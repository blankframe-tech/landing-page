"""Validate the v0 frame classifier against human coding (proposal target: inter-coder kappa >= 0.7).

Workflow: two coders fill A_<frame> / B_<frame> (0/1) in out/coding_sample.csv, independently, using
../codebook.md and WITHOUT seeing classifier output. Then:  python validate.py

Prints per frame: coder agreement (Cohen's kappa), and classifier precision/recall/F1 against the
consensus (rows where A == B; disagreements are listed for adjudication, not silently dropped).
"""
import json

import pandas as pd

from common import DATA, OUT
from frames import FRAME_ORDER, classify


def kappa(a, b):
    a, b = pd.Series(a).astype(int), pd.Series(b).astype(int)
    po = (a == b).mean()
    pe = a.mean() * b.mean() + (1 - a.mean()) * (1 - b.mean())
    return float("nan") if pe == 1 else (po - pe) / (1 - pe)


def main():
    cs = pd.read_csv(OUT / "coding_sample.csv", dtype=str, keep_default_na=False)
    coded = cs[(cs[[f"A_{f}" for f in FRAME_ORDER]] != "").all(axis=1) & (cs[[f"B_{f}" for f in FRAME_ORDER]] != "").all(axis=1)]
    if coded.empty:
        raise SystemExit("No rows coded by both A and B yet - nothing to validate.")
    recs = {}
    for p in DATA.glob("corpus_*.jsonl"):
        for line in p.read_text(encoding="utf-8").splitlines():
            r = json.loads(line)
            recs[r["id"]] = r
    rows = []
    for f in FRAME_ORDER:
        a, b = coded[f"A_{f}"].astype(int), coded[f"B_{f}"].astype(int)
        agree = a == b
        cons = a[agree]
        pred = pd.Series({i: classify(recs[coded.at[i, "id"]]["title"], recs[coded.at[i, "id"]]["summary"],
                                      recs[coded.at[i, "id"]]["text"])[f] for i in coded.index})[cons.index]
        tp = int(((pred == 1) & (cons == 1)).sum()); fp = int(((pred == 1) & (cons == 0)).sum())
        fn = int(((pred == 0) & (cons == 1)).sum())
        prec = tp / (tp + fp) if tp + fp else float("nan"); rec = tp / (tp + fn) if tp + fn else float("nan")
        f1 = 2 * prec * rec / (prec + rec) if prec == prec and rec == rec and prec + rec else float("nan")
        rows.append({"frame": f, "n_coded": len(coded), "n_consensus": int(agree.sum()), "kappa_AB": round(kappa(a, b), 3),
                     "prevalence_consensus": round(cons.mean(), 3), "precision": round(prec, 3), "recall": round(rec, 3), "f1": round(f1, 3)})
        coded.loc[~agree, "disagree_on"] = coded.loc[~agree, "disagree_on"].fillna("") + f + ";" if "disagree_on" in coded else f + ";"
    t = pd.DataFrame(rows)
    t.to_csv(OUT / "validation.csv", index=False)
    print(t.to_string(index=False))
    print("\nframes with kappa < 0.7 need codebook revision before any frame share is reported:",
          list(t.loc[t.kappa_AB < 0.7, "frame"]))


if __name__ == "__main__":
    main()
