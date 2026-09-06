#!/usr/bin/env python3
"""Dinos ガーデニング親ページからサブカテゴリ URL を抽出する。"""
import re
import sys
from urllib.parse import urljoin

import requests

sys.stdout.reconfigure(encoding="utf-8")

# ガーデニング用品・エクステリア トップ付近
CANDIDATE_URLS = [
    "https://www.dinos.co.jp/c2/002005/1a2/",
    "https://www.dinos.co.jp/c2/002005/",
    "https://www.dinos.co.jp/c3/002005/1a2/",
]

HEADERS = {"User-Agent": "Mozilla/5.0 Chrome/120.0.0.0"}

TARGET_NAMES = [
    "屋外収納庫・物置",
    "ガーデンファニチャー",
    "日除けシェード・ガーデンパラソル",
    "ガーデンオーナメント・置物",
    "敷石・防草シート・芝",
    "プランター・植木鉢・鉢カバー",
    "フラワースタンド・プランタースタンド・花台",
    "フェンス・ラティス・トレリス",
    "エアコン室外機カバー",
    "屋外ゴミ箱/保管庫",
    "温室・ビニール温室",
    "ガーデンアーチ・パーゴラ",
    "ウッドデッキ・ジョイントタイルパネル",
    "ガーデン/ソーラーライト・庭用照明",
    "園芸土/肥料",
    "ホース・ホースリール",
]


def fetch(url: str) -> str:
    r = requests.get(url, headers=HEADERS, timeout=30)
    r.raise_for_status()
    r.encoding = r.apparent_encoding or "utf-8"
    return r.text


def extract_links(html: str, base: str) -> list[tuple[str, str]]:
    """(label, absolute_url) from href + nearby text."""
    results: list[tuple[str, str]] = []
    for m in re.finditer(
        r'href="((?:/c[234]/[^"]+/1a2/)|(?:https://www\.dinos\.co\.jp/c[234]/[^"]+/1a2/))"',
        html,
    ):
        path = m.group(1)
        if path.startswith("http"):
            url = path
        else:
            url = urljoin(base, path)
        # grab text within 200 chars after link
        chunk = html[m.end() : m.end() + 300]
        text_m = re.search(r">([^<]{2,80})<", chunk)
        label = text_m.group(1).strip() if text_m else ""
        results.append((label, url))
    return results


def main() -> None:
    all_links: dict[str, str] = {}
    for url in CANDIDATE_URLS:
        try:
            html = fetch(url)
            print(f"\n=== {url} status OK len={len(html)} ===")
            links = extract_links(html, "https://www.dinos.co.jp")
            print(f"links found: {len(links)}")
            for label, link in links:
                if label and label not in all_links:
                    all_links[label] = link
        except requests.RequestException as exc:
            print(f"FAIL {url}: {exc}")

    print("\n--- matched targets ---")
    for name in TARGET_NAMES:
        url = all_links.get(name, "?")
        print(f"{name}\t{url}")

    print("\n--- all unique labels (garden-related) ---")
    for label, link in sorted(all_links.items()):
        if any(k in label for k in ("ガーデン", "屋外", "園芸", "ホース", "温室", "フェンス", "プラン", "敷石", "防草", "芝", "エアコン", "ゴミ", "ウッド", "デッキ", "ジョイント", "ソーラ", "照明", "日除け", "パラソル", "物置", "収納")):
            print(f"{label}\t{link}")


if __name__ == "__main__":
    main()
