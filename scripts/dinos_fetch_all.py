#!/usr/bin/env python3
"""
category-map.json の pending カテゴリを順番に処理する。

例:
  python scripts/dinos_fetch_all.py
  python scripts/dinos_fetch_all.py --dry-run
  python scripts/dinos_fetch_all.py --skip-done
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
MAP_PATH = PROJECT_ROOT / "data" / "dinos" / "category-map.json"
FETCH_SCRIPT = SCRIPT_DIR / "dinos_fetch.py"


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch all pending Dinos categories")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument(
        "--skip-done",
        action="store_true",
        default=True,
        help="status=done をスキップ（デフォルト: true）",
    )
    parser.add_argument("--interval", type=float, default=1.0, help="カテゴリ間の待機秒")
    args = parser.parse_args()

    entries = json.loads(MAP_PATH.read_text(encoding="utf-8"))
    pending = [
        e
        for e in entries
        if e.get("status") != "done" or not args.skip_done
    ]
    if args.skip_done:
        pending = [e for e in entries if e.get("status") != "done"]

    print(f"Total: {len(entries)}, pending: {len(pending)}", flush=True)
    if not pending:
        return 0

    failed: list[str] = []
    for i, entry in enumerate(pending, 1):
        slug = entry["slug"]
        cmd = [
            sys.executable,
            str(FETCH_SCRIPT),
            "--slug",
            slug,
            "--url",
            entry["dinosUrl"],
            "--limit",
            str(entry.get("limit", 20)),
            "--max-images",
            str(entry.get("maxImages", 6)),
            "--interval",
            str(args.interval),
        ]
        if args.dry_run:
            print(f"[{i}/{len(pending)}] would run: {' '.join(cmd)}", flush=True)
            continue

        print(f"\n[{i}/{len(pending)}] === {slug} ===", flush=True)
        result = subprocess.run(cmd, cwd=PROJECT_ROOT)
        if result.returncode != 0:
            failed.append(slug)
            print(f"FAIL: {slug} (exit {result.returncode})", flush=True)

    if failed:
        print(f"\nFailed slugs: {', '.join(failed)}", flush=True)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
