#!/usr/bin/env python3
"""
Dinos カテゴリ一覧から商品画像を取得し {slug} handoff を更新する。

例:
  python scripts/dinos_fetch.py --slug outdoor-storage --url https://www.dinos.co.jp/c3/002005014/1a2/
  python scripts/dinos_fetch.py --slug garden-furniture --url https://www.dinos.co.jp/c4/002005015003/1a2/ --limit 20 --max-images 6
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path

import requests

sys.stdout.reconfigure(encoding="utf-8")

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent


def images_dir_for(slug: str) -> Path:
    return PROJECT_ROOT / "public" / "images" / "products" / slug


def handoff_path_for(slug: str) -> Path:
    return PROJECT_ROOT / "data" / "handoff" / f"{slug}.json"


BASE = "https://www.dinos.co.jp"
IMG_BASE = "https://img.dinos.co.jp"
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"}

PRODUCT_LINK_RE = re.compile(r'href="(/p/[^"]+/)"')
LD_JSON_RE = re.compile(
    r'<script type="application/ld\+json">\s*(\{.*?\})\s*</script>',
    re.S,
)
ENL_RE = re.compile(
    r"/kp/defaultMall/images/goods/[^\"'\s]+/enl/[^\"'\s?]+\.jpg",
    re.I,
)
ETC_RE = re.compile(
    r"/kp/defaultMall/images/goods/[^\"'\s]+/etc/[^\"'\s]+c1\.jpg",
    re.I,
)


def log(msg: str) -> None:
    print(msg, flush=True)


SJIS_ALIASES = {"windows-31j", "shift_jis", "shift-jis", "sjis", "x-sjis", "ms932", "cp932"}


def resolve_encoding(response: requests.Response) -> str:
    """HTTP ヘッダの charset を優先する。Dinos は Windows-31J(=cp932) を宣言しているため、
    chardet(apparent_encoding) の誤判定（例: GB18030）で文字化けするのを防ぐ。"""
    ctype = response.headers.get("content-type", "")
    m = re.search(r"charset=([\w\-]+)", ctype, re.I)
    if m:
        enc = m.group(1).lower()
        return "cp932" if enc in SJIS_ALIASES else enc
    return response.apparent_encoding or "utf-8"


def fetch(url: str) -> str:
    r = requests.get(url, headers=HEADERS, timeout=30)
    r.raise_for_status()
    r.encoding = resolve_encoding(r)
    return r.text


def normalize_img_url(path_or_url: str) -> str:
    url = path_or_url.split("?")[0]
    if url.startswith("http"):
        if "img.dinos.co.jp" not in url and "/defaultMall/images/goods/" in url:
            path = url.split(".co.jp", 1)[-1]
            return IMG_BASE + "/kp" + path if path.startswith("/defaultMall/") else url
        return url
    if url.startswith("/kp/"):
        return IMG_BASE + url
    if url.startswith("/defaultMall/"):
        return IMG_BASE + "/kp" + url
    return BASE + url


def parse_ld_json(html: str) -> dict | None:
    for m in LD_JSON_RE.finditer(html):
        try:
            data = json.loads(m.group(1))
        except json.JSONDecodeError:
            continue
        if data.get("@type") == "Product":
            return data
    return None


def extract_image_urls(html: str, ld: dict | None, max_images: int = 6) -> list[str]:
    urls: list[str] = []
    for m in ENL_RE.finditer(html):
        urls.append(normalize_img_url(m.group(0)))
    if not urls:
        for m in ETC_RE.finditer(html):
            urls.append(normalize_img_url(m.group(0)))
    if ld:
        image = ld.get("image")
        if isinstance(image, list):
            image = image[0] if image else None
        if image:
            main = normalize_img_url(image)
            if main not in urls:
                urls.insert(0, main)
    return list(dict.fromkeys(urls))[:max_images]


def parse_price(ld: dict | None) -> int:
    if not ld:
        return 0
    offers = ld.get("offers") or {}
    if isinstance(offers, list):
        offers = offers[0] if offers else {}
    spec = offers.get("priceSpecification") or {}
    if isinstance(spec, list):
        spec = spec[0] if spec else {}
    price = (
        offers.get("price")
        or offers.get("lowPrice")
        or spec.get("price")
        or spec.get("lowPrice")
    )
    if not price:
        return 0
    return int(float(str(price).replace(",", "")))


def clean_name(name: str, fallback: str = "商品") -> str:
    name = re.sub(r"【[^】]*】", "", name).strip()
    name = re.sub(r"\s+", " ", name)
    return name[:100] or fallback


def download_image(url: str, dest: Path, skip_existing: bool = True) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if skip_existing and dest.exists() and dest.stat().st_size > 1000:
        return
    r = requests.get(url, headers=HEADERS, timeout=60)
    r.raise_for_status()
    dest.write_bytes(r.content)


def get_product_ids_from_listing(html: str, limit: int) -> list[str]:
    seen: list[str] = []
    for m in PRODUCT_LINK_RE.finditer(html):
        pid_m = re.search(r"/p/([^/]+)/", m.group(1))
        if not pid_m:
            continue
        pid = pid_m.group(1)
        if pid not in seen:
            seen.append(pid)
        if len(seen) >= limit:
            break
    return seen


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch Dinos category products by slug")
    parser.add_argument(
        "--slug",
        default="outdoor-storage",
        help="PLANTIA category slug (決定: 出力先ディレクトリ・handoff・商品ID)",
    )
    parser.add_argument(
        "--url",
        default="https://www.dinos.co.jp/c3/002005014/1a2/",
        help="Dinos category listing URL",
    )
    parser.add_argument("--limit", type=int, default=20)
    parser.add_argument("--max-images", type=int, default=6, help="Images per product")
    parser.add_argument("--interval", type=float, default=1.0)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--skip-images",
        action="store_true",
        help="Only refresh handoff JSON (reuse existing image files)",
    )
    args = parser.parse_args()

    slug = args.slug
    images_dir = images_dir_for(slug)
    handoff_path = handoff_path_for(slug)

    log(f"Slug: {slug}")
    log(f"Listing: {args.url}")
    listing_html = fetch(args.url)
    product_ids = get_product_ids_from_listing(listing_html, args.limit)
    log(f"Products to fetch: {len(product_ids)}")

    products = []
    for i, pid in enumerate(product_ids, 1):
        product_id = f"{slug}-{i:02d}"
        detail_url = f"{BASE}/p/{pid}/"
        log(f"[{i}/{len(product_ids)}] {detail_url}")

        html = fetch(detail_url)
        ld = parse_ld_json(html)
        fallback_name = f"{slug} {i}"
        name = clean_name(ld.get("name", fallback_name), fallback_name) if ld else fallback_name
        price = parse_price(ld)
        image_urls = extract_image_urls(html, ld, max_images=args.max_images)

        image_files: list[str] = []
        for j, img_url in enumerate(image_urls, 1):
            fname = f"{product_id}_{j:02d}.jpg"
            if args.dry_run:
                log(f"  would download {fname} <- {img_url}")
                image_files.append(fname)
                continue
            dest = images_dir / fname
            if args.skip_images and dest.exists():
                log(f"  reuse {fname}")
                image_files.append(fname)
                continue
            try:
                download_image(img_url, dest)
                size = dest.stat().st_size
                log(f"  saved {fname} ({size:,} bytes)")
                image_files.append(fname)
            except requests.RequestException as exc:
                log(f"  FAIL {fname}: {exc}")

        if not image_files:
            log(f"  skip {product_id}: no images")
            continue

        products.append(
            {
                "id": product_id,
                "name": name,
                "price": price,
                "images": image_files,
            }
        )
        time.sleep(args.interval)

    handoff = {
        "categorySlug": slug,
        "pattern": "per-product",
        "source": args.url,
        "imageSlots": [
            {
                "file": f"{{productId}}_{n:02d}.jpg",
                "role": "thumbnail" if n == 1 else "detail",
                "width": 1000,
                "height": 1000,
            }
            for n in range(1, args.max_images + 1)
        ],
        "products": products,
    }

    if args.dry_run:
        log(json.dumps(handoff, ensure_ascii=False, indent=2))
        return 0

    if not products:
        log(f"WARN: no products fetched for {slug}; handoff not written")
        return 1

    handoff_path.parent.mkdir(parents=True, exist_ok=True)
    handoff_path.write_text(
        json.dumps(handoff, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    log(f"Updated {handoff_path}")
    log(f"Downloaded {sum(len(p['images']) for p in products)} images for {len(products)} products")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
