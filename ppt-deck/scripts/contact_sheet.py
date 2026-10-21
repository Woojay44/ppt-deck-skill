"""Tile images into labelled contact sheets: contact_sheet.py OUT_PREFIX COLS img..."""
import sys, pathlib
from PIL import Image, ImageDraw, ImageFont
out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
W, H, LH = 360, 240, 22
font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 15)
per = cols * 4
for k in range(0, len(files), per):
    chunk = files[k:k+per]; rows = (len(chunk) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * W, rows * (H + LH)), "white"); d = ImageDraw.Draw(sheet)
    for i, f in enumerate(chunk):
        im = Image.open(f).convert("RGB"); im.thumbnail((W - 8, H - 8))
        x, y = (i % cols) * W, (i // cols) * (H + LH)
        sheet.paste(im, (x + 4, y + 4)); d.text((x + 4, y + H), pathlib.Path(f).name[-24:], fill="black", font=font)
    p = f"{out}_{k // per + 1}.png"; sheet.save(p); print(p)
