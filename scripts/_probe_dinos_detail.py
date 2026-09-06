#!/usr/bin/env python3
import re
import sys

import requests

sys.stdout.reconfigure(encoding="utf-8")

URL = "https://www.dinos.co.jp/p/1120705859/"
headers = {"User-Agent": "Mozilla/5.0 Chrome/120.0.0.0"}
r = requests.get(URL, headers=headers, timeout=30)
html = r.text
print("status", r.status_code, "len", len(html))

title = re.search(r"<title>([^<]+)</title>", html)
print("title:", title.group(1).strip() if title else None)

for pat, name in [
    (r'<h1[^>]*class="[^"]*itemName[^"]*"[^>]*>([^<]+)', "h1 itemName"),
    (r'<h1[^>]*>([^<]+)', "h1"),
    (r'"name"\s*:\s*"([^"]+)"', "json name"),
    (r'itemprop="name"[^>]*content="([^"]+)"', "itemprop name"),
]:
    m = re.search(pat, html)
    if m:
        print(name + ":", m.group(1).strip()[:100])

price_pats = [
    r'class="[^"]*price[^"]*"[^>]*>[^<]*[¥￥]([0-9,]+)',
    r'[¥￥]([0-9,]+)\s*<',
    r'"price"\s*:\s*"?([0-9,]+)"?',
]
for pat in price_pats:
    m = re.search(pat, html)
    if m:
        print("price:", m.group(1))
        break

enl = re.findall(
    r"(https://img\.dinos\.co\.jp/kp/defaultMall/images/goods/[^\"']+/enl/[^\"']+\.(?:jpg|jpeg|png))",
    html,
)
etc = re.findall(
    r"(https://img\.dinos\.co\.jp/kp/defaultMall/images/goods/[^\"']+/etc/[^\"']+c1\.jpg[^\"']*)",
    html,
)
print("enl images:", len(enl))
for u in dict.fromkeys(enl)[:8]:
    print(" ", u)
print("etc images:", len(etc))
for u in dict.fromkeys(etc)[:3]:
    print(" ", u)

# listing card near product id
for pat in [r'data-goods-code="([^"]+)"', r'"goodsCode"\s*:\s*"([^"]+)"']:
    found = re.findall(pat, html)
    if found:
        print(pat, found[:3])
