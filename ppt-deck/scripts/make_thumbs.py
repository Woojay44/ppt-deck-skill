"""Make slide thumbnails s01.jpg… (960 px wide) from PowerPoint-rendered slide-NN.png files.

Usage: python make_thumbs.py <render_dir> <thumbs_dir>
"""
import pathlib
import sys

from PIL import Image

src, dst = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
dst.mkdir(parents=True, exist_ok=True)
files = sorted(src.glob("slide-*.png"))
if not files:
    sys.exit(f"no slide-*.png in {src}")
for f in files:
    n = int(f.stem.split("-")[1])
    im = Image.open(f).convert("RGB")
    im.thumbnail((960, 540))
    im.save(dst / f"s{n:02d}.jpg", quality=88)
print(f"{len(files)} thumbnails -> {dst}")
