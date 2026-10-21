"""Render PDF pages to PNG: pdf_pages.py PDF OUTDIR [zoom]"""
import pathlib, sys, pymupdf
pdf, out = sys.argv[1], pathlib.Path(sys.argv[2]); z = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
out.mkdir(parents=True, exist_ok=True)
doc = pymupdf.open(pdf)
for i, pg in enumerate(doc):
    pg.get_pixmap(matrix=pymupdf.Matrix(z, z)).save(out / f"page-{i+1:02d}.png")
print(doc.page_count, "pages")
