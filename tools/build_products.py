#!/usr/bin/env python3
"""Write each product's status chip on index.html from products.json.

    python3 tools/build_products.py           # rewrite the chips
    python3 tools/build_products.py --check   # fail if a chip drifted or a status is off-vocabulary
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "products.json").read_text())
CHIP = re.compile(r'(<span class="status-chip" data-product="([a-z0-9-]+)"><span class="dot" aria-hidden="true"></span> )([^<]*)(</span>)')


def main():
    check = "--check" in sys.argv
    page = ROOT / "index.html"
    text = page.read_text()
    status = {p["id"]: p["status"] for p in DATA["products"]}
    errs = [f"{i}: status {s!r} is not one of {DATA['statuses']}" for i, s in status.items() if s not in DATA["statuses"]]
    on_page = [m.group(2) for m in CHIP.finditer(text)]
    errs += [f"{i}: in products.json but has no data-product chip on index.html" for i in status if i not in on_page]
    errs += [f"{i}: chip on index.html but not in products.json" for i in on_page if i not in status]
    built = CHIP.sub(lambda m: m.group(1) + status.get(m.group(2), m.group(3)) + m.group(4), text)
    if built != text:
        if check or errs:
            errs.append("index.html chips are stale: run python3 tools/build_products.py")
        else:
            page.write_text(built)
            print("wrote index.html")
    for e in errs:
        print(f"FAIL {e}", file=sys.stderr)
    sys.exit(1 if errs else 0)


if __name__ == "__main__":
    main()
