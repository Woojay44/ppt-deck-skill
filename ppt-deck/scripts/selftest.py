"""ppt-deck self-test: dependencies, engine integrity, SVG -> PPTX smoke build, QA, PowerPoint render, Word builders.

Usage: python selftest.py [--keep]   (--keep leaves the temp folder for inspection)
Exit code 0 = all required checks passed.
"""
import importlib.util
import os
import pathlib
import shutil
import subprocess
import sys
import tempfile

HERE = pathlib.Path(__file__).resolve().parent
SKILL = HERE.parent
ENGINE = pathlib.Path(os.environ.get("PPT_MASTER_DIR", pathlib.Path.home() / ".claude/skills/ppt-master"))
PY = sys.executable
results = []


def record(name, ok, detail="", required=True):
    results.append((name, ok, detail, required))
    print(f"[{'PASS' if ok else ('FAIL' if required else 'SKIP')}] {name}" + (f" — {detail}" if detail else ""))


def run(cmd, cwd=None, timeout=600):
    p = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=timeout)
    return p.returncode, (p.stdout or "") + (p.stderr or "")


def main():
    keep = "--keep" in sys.argv
    tmp = pathlib.Path(tempfile.mkdtemp(prefix="ppt-deck-selftest-"))

    # 1. python deps
    missing = [m for m in ("pptx", "pymupdf", "PIL") if importlib.util.find_spec(m) is None]
    record("Python 依赖（python-pptx / pymupdf / Pillow）", not missing, "缺少 " + ", ".join(missing) if missing else PY)
    record("fontTools（标志组合版转曲，可选）", importlib.util.find_spec("fontTools") is not None, required=False)

    # 2. engine integrity
    guard = ENGINE / "scripts/attribution_guard.py"
    if guard.exists():
        rc, out = run([PY, str(guard)])
        record("ppt-master 完整性检查", rc == 0, out.strip()[:200] or str(ENGINE))
    else:
        record("ppt-master 完整性检查", False, f"找不到 {guard}")

    # 3. smoke build: init -> copy fixture -> final check -> export
    pptx = None
    if guard.exists():
        rc, out = run([PY, str(ENGINE / "scripts/project_manager.py"), "init", "smoke", "--quick-generate"], cwd=tmp)
        projects = sorted((tmp / "projects").glob("smoke*")) if (tmp / "projects").exists() else []
        if projects:
            proj = projects[0]
            for f in (SKILL / "tests/fixtures/smoke/svg_output").glob("*.svg"):
                shutil.copy(f, proj / "svg_output" / f.name)
            rc, out = run([PY, str(ENGINE / "scripts/svg_quality_checker.py"), str(proj), "--quick-generate",
                           "--canonical-authoring", "--stage", "final", "--json"])
            record("SVG 最终检查（3 页样例）", rc == 0, "" if rc == 0 else out[-300:])
            rc, out = run([PY, str(ENGINE / "scripts/svg_to_pptx.py"), str(proj), "--quick-generate", "--no-notes"])
            exports = sorted((proj / "exports").glob("*.pptx"))
            record("导出 PPTX", rc == 0 and bool(exports), "" if exports else out[-300:])
            pptx = exports[-1] if exports else None
        else:
            record("建项目", False, out[-300:])

    # 4. QA script
    if pptx:
        rc, out = run([PY, str(HERE / "qa_pptx.py"), str(pptx)])
        record("qa_pptx.py", rc == 0, out.strip().splitlines()[-1] if out.strip() else "")

    # 5. PowerPoint render (Windows only)
    if pptx and os.name == "nt":
        rc, out = run(["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", str(HERE / "render_pptx.ps1"),
                       "-Pptx", str(pptx), "-OutDir", str(tmp / "render")], timeout=300)
        pngs = list((tmp / "render").glob("slide-*.png"))
        record("PowerPoint 实渲染", rc == 0 and len(pngs) == 3, f"{len(pngs)} 张 PNG" if pngs else out[-200:], required=False)

    # 6. Word builders
    docgen = HERE / "docgen"
    node = shutil.which("node")
    if not node:
        record("Node.js", False, "未安装 node")
    elif not (docgen / "node_modules/docx").exists():
        record("docx-js", False, f"先在 {docgen} 里运行 npm install")
    else:
        t = SKILL / "templates"
        rc1, o1 = run([node, str(docgen / "build_speech.js"), "--md", str(t / "speech.example.md"), "--meta",
                       str(t / "speech-meta.example.json"), "--out", str(tmp / "speech.docx"), "--plain", "1"])
        rc2, o2 = run([node, str(docgen / "build_prep.js"), "--spec", str(t / "prep-spec.example.json"), "--out", str(tmp / "prep.docx")])
        record("Word 讲稿（纯文字版）", rc1 == 0 and (tmp / "speech.docx").exists(), "" if rc1 == 0 else o1[-200:])
        record("Word 准备清单", rc2 == 0 and (tmp / "prep.docx").exists(), "" if rc2 == 0 else o2[-200:])

    failed = [r for r in results if r[3] and not r[1]]
    print(f"\n{len(results) - len(failed)}/{len(results)} 通过" + (f"；失败：{', '.join(r[0] for r in failed)}" if failed else ""))
    if keep:
        print("临时目录保留在", tmp)
    else:
        shutil.rmtree(tmp, ignore_errors=True)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
