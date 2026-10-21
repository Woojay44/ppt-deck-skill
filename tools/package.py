#!/usr/bin/env python3
"""把 ppt-deck/ 打包成 dist/ppt-deck-<版本>.zip（zip 内顶层目录为 ppt-deck/）。

用法：python tools/package.py v1
不含 node_modules（安装后在 scripts/docgen 里 npm install）；不含 ppt-master 引擎（单独安装）。
"""

import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / "ppt-deck"
SKIP_DIRS = {"__pycache__", ".pytest_cache", "node_modules"}
SKIP_SUFFIXES = {".pyc", ".pyo"}
SKIP_NAMES = {"package-lock.json"}


def main():
    if len(sys.argv) != 2:
        sys.exit("用法：python tools/package.py <版本，如 v1>")
    out = ROOT / "dist" / ("ppt-deck-%s.zip" % sys.argv[1])
    out.parent.mkdir(exist_ok=True)
    files = sorted(p for p in SKILL.rglob("*") if p.is_file()
                   and not SKIP_DIRS & set(p.relative_to(SKILL).parts)
                   and p.suffix not in SKIP_SUFFIXES
                   and p.name not in SKIP_NAMES)
    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
        for p in files:
            z.write(p, Path("ppt-deck") / p.relative_to(SKILL))
    print("%s（%d 个文件）" % (out, len(files)))


if __name__ == "__main__":
    main()
