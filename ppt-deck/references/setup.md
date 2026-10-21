# 安装与环境

## 依赖
| 依赖 | 用途 | 检查 |
|---|---|---|
| Windows + PowerPoint 2016 及以上 | 实渲染 QA（COM 导出 PNG） | `scripts/render_pptx.ps1` |
| Microsoft Word | Word 文档转 PDF 做版面检查 | `scripts/docx_to_pdf.ps1` |
| Python 3.10+ | 引擎脚本和本 skill 的脚本 | `python --version` |
| Node.js 18+ | 生成 Word（docx-js） | `node -v` |
| ppt-master | 渲染引擎 | `%USERPROFILE%\.claude\skills\ppt-master\scripts\attribution_guard.py` 返回 0 |
| logo-design skill（可选） | 标志设计 | `%USERPROFILE%\.claude\skills\logo-design` |

## 首次安装
```powershell
# 1. 引擎：从官方仓库原样复制 skills/ppt-master，不改任何文件
git clone --depth 1 https://github.com/hugohe3/ppt-master.git $env:TEMP\ppt-master
Copy-Item -Recurse $env:TEMP\ppt-master\skills\ppt-master $env:USERPROFILE\.claude\skills\ppt-master

# 2. Python 环境（项目内 .venv）
cd D:\Project-claude\ppt-deck-skill
python -m venv .venv
.venv\Scripts\python -m pip install -r $env:USERPROFILE\.claude\skills\ppt-master\requirements.txt -r requirements.txt

# 3. Word 生成器依赖
cd ppt-deck\scripts\docgen; npm install; cd ..\..\..

# 4. 把 skill 链接到 Claude Code（目录联接；在项目里改完立即生效）
New-Item -ItemType Junction -Path $env:USERPROFILE\.claude\skills\ppt-deck -Target D:\Project-claude\ppt-deck-skill\ppt-deck   # 目录联接，不需要管理员

# 5. 自检
.venv\Scripts\python ppt-deck\scripts\selftest.py
```

## 升级 ppt-master
整包替换 `%USERPROFILE%\.claude\skills\ppt-master`，然后跑自检。升级后若引擎的命令或参数有变化，更新 `references/engine-map.md`。
