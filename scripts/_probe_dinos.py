#!/usr/bin/env python3
import re
import sys
from urllib.parse import urljoin

import requests

sys.stdout.reconfigure(encoding="utf-8")

URL = "https://www.dinos.co.jp/c3/002005014/1a2/"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0"}

r = requests.get(URL, headers=headers, timeout=30)
print("status", r.status_code, "len", len(r.text))
html = r.text

# product detail links
links = []
for m in re.finditer(r'href="(/p/[^"]+)"', html):
    links.append(m.group(1))
unique_links = list(dict.fromkeys(links))
print("product links", len(unique_links))
for u in unique_links[:25]:
    print(" ", u)

# image urls on listing
imgs = re.findall(r'(https?://[^"\']+\.(?:jpg|jpeg|png|webp)[^"\']*)', html, re.I)
print("image urls", len(imgs))
for u in dict.fromkeys(imgs):
    if "product" in u.lower() or "item" in u.lower() or "dinos" in u.lower():
        print(" ", u[:120])

# og patterns
for pat in [r'data-product[^=]*="([^"]+)"', r'"productCode"\s*:\s*"([^"]+)"', r'/p/(\d+)']:
    found = re.findall(pat, html)
    if found:
        print(pat, len(found), found[:5])
