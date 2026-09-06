#!/usr/bin/env python3
import re
import sys

import requests

sys.stdout.reconfigure(encoding="utf-8")

URL = "https://www.dinos.co.jp/c3/002005014/1a2/"
headers = {"User-Agent": "Mozilla/5.0 Chrome/120.0.0.0"}
r = requests.get(URL, headers=headers, timeout=30)
html = r.text

# Extract product blocks - look for /p/ links with nearby title and image
blocks = re.split(r'(?=<(?:li|div|article)[^>]*class="[^"]*(?:item|product|goods)[^"]*")', html, flags=re.I)
print("blocks", len(blocks))

# simpler: find each /p/ID/ and grab context
seen = set()
for m in re.finditer(r'href="(/p/[^"]+/)"', html):
    path = m.group(1)
    pid = re.search(r"/p/([^/]+)/", path)
    if not pid or pid.group(1) in seen:
        continue
    seen.add(pid.group(1))
    start = max(0, m.start() - 2000)
    end = min(len(html), m.end() + 2000)
    chunk = html[start:end]
    name_m = re.search(r'(?:alt|title)="([^"]{10,120})"', chunk)
    img_m = re.search(r'(https://img\.dinos\.co\.jp/kp/defaultMall/images/goods/[^"\']+\.(?:jpg|jpeg))', chunk)
    price_m = re.search(r'[¥￥]([0-9,]+)', chunk)
    print("---", pid.group(1))
    print(" name:", (name_m.group(1) if name_m else "?")[:80])
    print(" img:", img_m.group(1)[:90] if img_m else "?")
    print(" price:", price_m.group(1) if price_m else "?")
    if len(seen) >= 5:
        break
