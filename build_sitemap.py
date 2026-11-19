#!/usr/bin/env python3
"""Write sitemap.xml from the committed index.html pages. Re-run after adding or removing a page:

    python3 build_sitemap.py          # writes sitemap.xml
    python3 build_sitemap.py --check  # exits 1 if sitemap.xml is out of date (for a pre-push check)

Skips what visitors should not land on: folders in _config.yml's exclude list, /archived/, redirect stubs
(meta refresh or location.replace), pages marked noindex, and mirrors whose canonical URL is another site. lastmod is each page's last commit date.
"""
import re, subprocess, sys
from pathlib import Path

SITE = "https://www.blankframe.tech"
ROOT = Path(__file__).resolve().parent
SKIP_DIRS = ("archived/",)


def excluded_prefixes():
    out, on = [], False
    for line in (ROOT / "_config.yml").read_text().splitlines():
        if re.match(r"^\w", line): on = line.startswith("exclude:")
        elif on and line.strip().startswith("-"): out.append(line.strip()[1:].strip().strip('"') + "/")
    return tuple(out) + SKIP_DIRS


def pages():
    files = subprocess.run(["git", "ls-files", "*index.html"], cwd=ROOT, capture_output=True, text=True, check=True).stdout.split()
    skip = excluded_prefixes()
    for f in sorted(files, key=lambda f: (f != "index.html", f)):
        if f.startswith(skip): continue
        html = (ROOT / f).read_text(errors="ignore")
        if re.search(r'http-equiv=["\']refresh|location\.replace\(', html, re.I): continue  # redirect stub
        if re.search(r'<meta[^>]+name=["\']robots["\'][^>]*noindex', html, re.I): continue
        canon = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]*href=["\']([^"\']+)', html, re.I)
        if canon and not canon.group(1).startswith(SITE): continue  # a mirror: the canonical copy lives elsewhere
        date = subprocess.run(["git", "log", "-1", "--format=%cs", "--", f], cwd=ROOT, capture_output=True, text=True).stdout.strip()
        yield "/" + f[: -len("index.html")], date


def render():
    rows = "".join(f"  <url><loc>{SITE}{p}</loc>{f'<lastmod>{d}</lastmod>' if d else ''}</url>\n" for p, d in pages())
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{rows}</urlset>\n'


if __name__ == "__main__":
    xml, target = render(), ROOT / "sitemap.xml"
    assert f"<loc>{SITE}/</loc>" in xml and "/archived/" not in xml and "/tools/nepal-viz/" not in xml, "self-check failed"
    if "--check" in sys.argv:
        sys.exit(0 if target.exists() and target.read_text() == xml else 1)
    target.write_text(xml)
    print(f"sitemap.xml: {xml.count('<url>')} pages")
