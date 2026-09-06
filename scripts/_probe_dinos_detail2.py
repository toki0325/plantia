#!/usr/bin/env python3
import re
import sys

import requests

sys.stdout.reconfigure(encoding="utf-8")

URL = "https://www.dinos.co.jp/p/1120705859/"
headers = {"User-Agent": "Mozilla/5.0 Chrome/120.0.0.0"}
r = requests.get(URL, headers=headers, timeout=30)
html = r.text

goods_img = re.findall(r"(/kp/defaultMall/images/goods/[^\"'\s>]+\.(?:jpg|jpeg|png)[^\"'\s>]*)", html)
print("goods paths:", len(goods_img))
for u in list(dict.fromkeys(goods_img))[:15]:
    print(" ", u[:100])

# og:image
og = re.findall(r'property="og:image"\s+content="([^"]+)"', html)
print("og:image", og)

# data-src, srcset
for pat in [r'data-src="([^"]+goods[^"]+)"', r'src="([^"]+goods[^"]+)"']:
    found = re.findall(pat, html)
    if found:
        print(pat, len(found), found[:3])

# json ld
ld = re.search(r'<script type="application/ld\+json">([^<]+)</script>', html)
if ld:
    print("ld+json snippet:", ld.group(1)[:500])
