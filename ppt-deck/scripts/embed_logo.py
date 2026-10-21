"""Bake a brand SVG (our own subset: g / circle / path with M L A Z) into page coordinates as plain vector markup.

No nested <svg>, no transform: every coordinate, radius and stroke width is scaled and translated numerically,
so ppt-master exports native editable shapes.
"""
import re
import xml.etree.ElementTree as ET

NS = "{http://www.w3.org/2000/svg}"
NUM = r"-?\d+(?:\.\d+)?"


def _f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def _path(d, s, tx, ty):
    out, toks = [], re.findall(r"[MLAZmlaz]|" + NUM, d)
    i, cmd = 0, None
    while i < len(toks):
        t = toks[i]
        if t.isalpha():
            cmd = t
            assert cmd in "MLAZ", f"unsupported path command {cmd}"
            out.append(cmd)
            i += 1
            continue
        if cmd in "ML":
            x, y = float(toks[i]), float(toks[i + 1])
            out += [_f(x * s + tx), _f(y * s + ty)]
            i += 2
        elif cmd == "A":
            rx, ry, rot, la, sw, x, y = toks[i:i + 7]
            out += [_f(float(rx) * s), _f(float(ry) * s), rot, la, sw, _f(float(x) * s + tx), _f(float(y) * s + ty)]
            i += 7
        else:
            raise ValueError(f"number after {cmd}")
    return " ".join(out)


def _attrs(el, s):
    keep = {}
    for k, v in el.attrib.items():
        if k in ("id",):
            continue
        if k == "stroke-width":
            v = _f(float(v) * s)
        keep[k] = v
    return keep


def _emit(el, s, tx, ty, indent):
    tag = el.tag.replace(NS, "")
    a = _attrs(el, s)
    if tag == "circle":
        a["cx"] = _f(float(a["cx"]) * s + tx)
        a["cy"] = _f(float(a["cy"]) * s + ty)
        a["r"] = _f(float(a["r"]) * s)
    elif tag == "path":
        a["d"] = _path(a["d"], s, tx, ty)
    elif tag not in ("g",):
        return []
    attr = " ".join(f'{k}="{v}"' for k, v in a.items())
    if tag == "g":
        kids = [line for c in el for line in _emit(c, s, tx, ty, indent + "  ")]
        return [f"{indent}<g {attr}>".replace("<g >", "<g>")] + kids + [f"{indent}</g>"]
    return [f"{indent}<{tag} {attr}/>"]


def bake(svg_path, x, y, size, indent="    "):
    """Return markup lines placing the 256-unit brand file at (x, y) with the given size in page px."""
    root = ET.parse(svg_path).getroot()
    vb = [float(v) for v in root.get("viewBox").split()]
    s = size / vb[2]
    tx, ty = x - vb[0] * s, y - vb[1] * s
    lines = []
    for child in root:
        if child.tag.replace(NS, "") == "title":
            continue
        lines += _emit(child, s, tx, ty, indent)
    return "\n".join(lines)
