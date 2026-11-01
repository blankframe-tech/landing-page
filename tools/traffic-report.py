#!/usr/bin/env python3
"""Weekly traffic snapshot from the public GoatCounter counter.

Usage:
  python3 tools/traffic-report.py              # append this week's rows to DOCS/traffic/weekly.csv
  python3 tools/traffic-report.py --now-line   # print the one-line monthly summary for /now/
  python3 tools/traffic-report.py --self-test  # offline asserts, no network

The counter only returns all-time totals, so each row stores the all-time count
on the snapshot date and `delta` is the change since the previous snapshot of that path.
Paths come from the PATHS array in tools/visit-count/index.html (AGENTS.md makes it
the registry of every public page; the site has no sitemap.xml).
"""
import csv
import datetime as dt
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REGISTRY = ROOT / "tools" / "visit-count" / "index.html"
CSV_PATH = ROOT / "DOCS" / "traffic" / "weekly.csv"
COUNTER = "https://blankframe.goatcounter.com/counter/{}.json"
FIELDS = ["week", "date", "path", "count", "delta"]


def parse_paths(html):
    block = re.search(r"const PATHS = \[(.*?)\];", html, re.S)
    if not block:
        raise SystemExit(f"PATHS array not found in {REGISTRY}")
    return re.findall(r"path:\s*'([^']+)'", block.group(1))


def parse_count(body):
    return int(str(json.loads(body).get("count", 0)).replace(",", "") or 0)


def fetch_count(path):
    url = COUNTER.format(urllib.parse.quote(path, safe=""))
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            return parse_count(r.read())
    except urllib.error.HTTPError as e:
        if e.code == 404:  # GoatCounter answers 404 + {"count":"0"} for paths with no views
            return parse_count(e.read() or b"{}")
        raise


def iso_week(day):
    y, w, _ = day.isocalendar()
    return f"{y}-W{w:02d}"


def upsert(rows, week, date, counts):
    """Replace this week's rows, recompute delta against the latest earlier week."""
    rows = [r for r in rows if r["week"] != week]
    prev = {}
    for r in sorted(rows, key=lambda r: r["date"]):
        prev[r["path"]] = int(r["count"])
    for path, n in counts.items():
        delta = n - prev[path] if path in prev else ""
        rows.append({"week": week, "date": date, "path": path, "count": n, "delta": delta})
    return sorted(rows, key=lambda r: (r["date"], r["path"]))


def now_line(rows, month):
    """One line: site-wide views gained in `month` (YYYY-MM) from TOTAL snapshots."""
    tot = sorted((r for r in rows if r["path"] == "TOTAL"), key=lambda r: r["date"])
    if not tot:
        return "No traffic snapshots yet."
    before = [r for r in tot if r["date"] < month + "-01"]
    inside = [r for r in tot if r["date"].startswith(month)]
    end = inside[-1] if inside else tot[-1]
    start = before[-1] if before else tot[0]
    gained = int(end["count"]) - int(start["count"])
    top = max((r for r in rows if r["date"] == end["date"] and r["path"] != "TOTAL"),
              key=lambda r: int(r["count"]), default=None)
    top_txt = f"; top page {top['path']} ({top['count']})" if top else ""
    return (f"{month}: {end['count']} views all-time on blankframe.tech, "
            f"+{gained} since {start['date']}{top_txt} (GoatCounter public counter).")


def read_rows():
    if not CSV_PATH.exists():
        return []
    with CSV_PATH.open(newline="") as f:
        return list(csv.DictReader(f))


def write_rows(rows):
    CSV_PATH.parent.mkdir(parents=True, exist_ok=True)
    with CSV_PATH.open("w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=FIELDS)
        w.writeheader()
        w.writerows(rows)


def self_test():
    html = "const PATHS = [\n { id: 'root', path: '/', name: 'Home' },\n { id: 'm', path: '/mac-check/', name: 'M' }\n];"
    assert parse_paths(html) == ["/", "/mac-check/"]
    assert parse_count(b'{"count_unique":"1,234", "count":"1,234"}') == 1234
    assert parse_count(b'{"count":"0"}') == 0
    assert iso_week(dt.date(2026, 11, 1)) == "2026-W44"
    rows = upsert([], "2026-W44", "2026-11-01", {"/": 31, "TOTAL": 225})
    assert [r["delta"] for r in rows] == ["", ""]
    rows = upsert(rows, "2026-W45", "2026-11-08", {"/": 40, "TOTAL": 250})
    w45 = {r["path"]: r["delta"] for r in rows if r["week"] == "2026-W45"}
    assert w45 == {"/": 9, "TOTAL": 25}, w45
    again = upsert(rows, "2026-W45", "2026-11-08", {"/": 41, "TOTAL": 251})  # rerun same week replaces
    assert len(again) == 4 and {r["path"]: r["delta"] for r in again if r["week"] == "2026-W45"} == {"/": 10, "TOTAL": 26}
    line = now_line([{k: str(v) for k, v in r.items()} for r in rows], "2026-11")
    assert line.startswith("2026-11: 250 views all-time") and "+25 since 2026-11-01" in line and "top page / (40)" in line, line
    assert now_line([], "2026-11") == "No traffic snapshots yet."
    print("self-test: ok")


def main(argv):
    if "--self-test" in argv:
        return self_test()
    rows = read_rows()
    if "--now-line" in argv:
        return print(now_line(rows, dt.date.today().strftime("%Y-%m")))
    today = dt.date.today()
    paths = parse_paths(REGISTRY.read_text())
    counts = {p: fetch_count(p) for p in ["TOTAL"] + paths}
    write_rows(upsert(rows, iso_week(today), today.isoformat(), counts))
    print(f"wrote {len(counts)} rows for {iso_week(today)} to {CSV_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main(sys.argv[1:])
