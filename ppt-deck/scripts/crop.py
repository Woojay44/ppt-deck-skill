"""crop.py SRC DST x0 y0 x1 y1  (original pixel coords)"""
import sys
from PIL import Image
s, d, *b = sys.argv[1:]; Image.open(s).crop(tuple(map(int, b))).save(d); print(d, Image.open(d).size)
