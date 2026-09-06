#!/usr/bin/env python3
import json
import re
import sys

import requests

sys.stdout.reconfigure(encoding="utf-8")

URL = "https://www.dinos.co.jp/p/1120705859/"
headers = {"User-Agent": "Mozilla/5.0 Chrome/120.0.0.0"}
r = requests.get(URL, headers=headers, timeout=30)
print("encoding", r.encoding, "apparent", r.apparent_encoding)
r.encoding = r.apparent_encoding or "utf-8"
html = r.text

ld = re.search(r'<script type="application/ld\+json">\s*(\{.*?\})\s*</script>', html, re.S)
if ld:
    data = json.loads(ld.group(1))
    print("name:", data.get("name"))
    print("offers:", json.dumps(data.get("offers"), ensure_ascii=False)[:300])

for pat in [
    r'class="[^"]*salePrice[^"]*"[^>]*>[^<]*[¥￥]([0-9,]+)',
    r'class="[^"]*price[^"]*"[^>]*>[^<]*[¥￥]([0-9,]+)',
    r'data-price="([0-9]+)"',
    r'"price"\s*:\s*"?([0-9,]+)"?',
    r'税込[^<]*[¥￥]([0-9,]+)',
]:
    m = re.search(pat, html)
    if m:
        print("price pat", pat[:40], m.group(1))
