#!/usr/bin/env python3
"""
Verkfæri til að:
1) búa til þýðingarbúta (TSV) úr ATU Index.html
2) lesa tilbúnar þýðingar og sameina í nýtt HTML.

Notkun:
  python3 translate_workflow.py export --input "ATU Index.html" --outdir translation_chunks --chunk-size 40
    -> skrifar chunk_01_en.tsv o.s.frv. í outdir/
    -> Afritaðu hvern bút í ChatGPT og biddu um þýðingu á dálkum 4-7 (halda fyrstu tveimur dálkum óbreyttum).
       Vistaðu svarið í samsvarandi chunk_01_is.tsv o.s.frv. (sama röð, TSV).

  python3 translate_workflow.py merge --input "ATU Index.html" --chunks translation_chunks --output "ATU Index.is.html"
    -> les * _is.tsv búta, sameinar og skrifar nýtt HTML með íslensku textum.
"""

import argparse
import html
from html.parser import HTMLParser
from pathlib import Path
from typing import List, Dict


class TableParser(HTMLParser):
    """Grunn HTML taflu-parser sem sækir <tr> og <td>/<th> texta."""

    def __init__(self) -> None:
        super().__init__()
        self.rows: List[List[str]] = []
        self._in_cell = False
        self._current_cell: List[str] = []
        self._current_row: List[str] = []

    def handle_starttag(self, tag, attrs):
        if tag == "tr":
            self._current_row = []
        if tag in ("td", "th"):
            self._in_cell = True
            self._current_cell = []

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self._in_cell:
            text = "".join(self._current_cell).strip()
            self._current_row.append(html.unescape(text))
            self._in_cell = False
        if tag == "tr":
            if self._current_row:
                self.rows.append(self._current_row)
            self._current_row = []

    def handle_data(self, data):
        if self._in_cell:
            self._current_cell.append(data)


def parse_rows(path: Path) -> List[List[str]]:
    parser = TableParser()
    parser.feed(path.read_text(encoding="utf-8"))
    cleaned: List[List[str]] = []
    for row in parser.rows:
        if len(row) < 7:
            continue
        # fyrsta dálkurinn er raðnúmer (1,2,3,...) – sleppa honum
        data = row[1:7]
        # tryggja að ATU dálkurinn sé númer (sumar línur geta verið tómir hausar)
        if data[0].strip().isdigit():
            cleaned.append(data)
    return cleaned


def write_chunks(rows: List[List[str]], outdir: Path, chunk_size: int) -> None:
    outdir.mkdir(parents=True, exist_ok=True)
    headers = ["idx", "ATU", "SUB", "Classifications", "Category", "Subcategory", "Variation Example"]
    for i in range(0, len(rows), chunk_size):
        chunk_rows = rows[i : i + chunk_size]
        fname = outdir / f"chunk_{i//chunk_size+1:02d}_en.tsv"
        with fname.open("w", encoding="utf-8") as f:
            f.write("\t".join(headers) + "\n")
            for global_idx, row in enumerate(chunk_rows, start=i):
                line = [str(global_idx)] + row[:6]
                f.write("\t".join(line) + "\n")
        print(f"Skrifaði {fname} ({len(chunk_rows)} línur)")


def load_translations(chunks_dir: Path) -> Dict[int, List[str]]:
    translations: Dict[int, List[str]] = {}
    for path in sorted(chunks_dir.glob("chunk_*_is.tsv")):
        with path.open("r", encoding="utf-8") as f:
            next(f, None)  # sleppa haus
            for line in f:
                parts = line.rstrip("\n").split("\t")
                if len(parts) < 7:
                    continue
                idx = int(parts[0])
                translations[idx] = parts[1:7]
    if not translations:
        raise SystemExit("Engar þýðingar fundust í *_is.tsv skrám")
    return translations


def render_html(rows: List[List[str]], title: str = "ATU Index (IS)") -> str:
    head = f"""<!DOCTYPE html>
<html lang="is">
<head>
  <meta charset="UTF-8" />
  <title>{html.escape(title)}</title>
  <style>
    body {{ font-family: Arial, sans-serif; margin: 16px; }}
    table {{ border-collapse: collapse; width: 100%; }}
    th, td {{ border: 1px solid #ccc; padding: 4px 6px; vertical-align: top; }}
    th {{ background: #f3f4f6; text-align: left; }}
  </style>
</head>
<body>
<table>
  <thead>
    <tr><th>ATU</th><th>SUB</th><th>Flokkanir</th><th>Flokkur</th><th>Undirflokkur</th><th>Dæmi um afbrigði</th></tr>
  </thead>
  <tbody>
"""
    body_parts = []
    for row in rows:
        cells = "".join(f"<td>{html.escape(cell)}</td>" for cell in row[:6])
        body_parts.append(f"    <tr>{cells}</tr>")
    tail = """
  </tbody>
</table>
</body>
</html>
"""
    return head + "\n".join(body_parts) + tail


def cmd_export(args):
    rows = parse_rows(Path(args.input))
    write_chunks(rows, Path(args.outdir), args.chunk_size)


def cmd_merge(args):
    base_rows = parse_rows(Path(args.input))
    translations = load_translations(Path(args.chunks))
    merged = []
    for idx, row in enumerate(base_rows):
        if idx in translations:
            translated = translations[idx]
            # translated er í sömu dálkaröð (ATU,SUB,Class,Cat,Subcat,Example)
            merged.append(translated)
        else:
            merged.append(row[:6])
    out_html = render_html(merged, title="ATU Index – íslensk þýðing")
    Path(args.output).write_text(out_html, encoding="utf-8")
    print(f"Skrifaði {args.output} ({len(merged)} línur)")


def main():
    parser = argparse.ArgumentParser(description="Skipta ATU töflu í þýðingarbúta og sameina aftur.")
    sub = parser.add_subparsers(dest="command", required=True)

    p_exp = sub.add_parser("export", help="Búa til TSV búta til þýðingar")
    p_exp.add_argument("--input", required=True, help="Slóð á ATU Index.html (enskt)")
    p_exp.add_argument("--outdir", required=True, help="Mappa fyrir búta (TSV)")
    p_exp.add_argument("--chunk-size", type=int, default=40, help="Fjöldi lína í hverjum bút (default 40)")
    p_exp.set_defaults(func=cmd_export)

    p_merge = sub.add_parser("merge", help="Lesa íslenska TSV búta og mynda nýtt HTML")
    p_merge.add_argument("--input", required=True, help="Upprunaleg ATU Index.html (til að sækja númera dálka)")
    p_merge.add_argument("--chunks", required=True, help="Mappa með *_is.tsv skrám")
    p_merge.add_argument("--output", required=True, help="Úttaksskrá, t.d. ATU Index.is.html")
    p_merge.set_defaults(func=cmd_merge)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
