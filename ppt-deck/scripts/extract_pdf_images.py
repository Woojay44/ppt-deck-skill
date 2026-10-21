import sys, pathlib, pymupdf
out = pathlib.Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
for p in map(pathlib.Path, sys.argv[2:]):
    doc = pymupdf.open(p); tag = p.stem[:6]
    for i, pg in enumerate(doc):
        for j, img in enumerate(pg.get_images(full=True)):
            pix = pymupdf.Pixmap(doc, img[0])
            if pix.width < 300 or pix.height < 200: continue
            if pix.n - pix.alpha >= 4: pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
            f = out / f"{tag}_p{i+1:02d}_{j}.png"; pix.save(f)
            print(f.name, pix.width, pix.height)
