# 更新记录

## v1（2026-10-21）

首个版本，来自一次大创结题答辩的真实测试。

**定位**
- 通用 PPT 入口 skill：场景预设覆盖学术、课程与教学、商业与工作、演讲、社媒等；ppt-master 原样作为引擎，全部路线（Quick / Default / Beautify / Image to PPTX / Edit Native / Create Template、动画、配音、视频、生图、搜图）都可调用。

**流程与规则**
- 8 步流程：需求 → 材料 → 大纲（⛔确认）→ 2 页样稿（⛔确认）→ 生成 → QA → 配套 → 修订；顺序是“事实底稿 → 逐页讲稿 → PPT”。
- 内容规则：结论式标题、一页一结论、数字可追溯但出处默认不上幻灯片、截图与资料逐项核对、口径冲突交给用户、不足用温和措辞。
- 设计规则：18pt 字号底线、单一强调色语义、浅渐变背景 + 浮起卡片 + 渐变柱、封面封底不单调、截图完整且放进卡片、小字截图原生重画。
- 反馈日志：答辩项目的 15 条用户意见（含用户答辩前自己改动交付物得出的 6 条）。

**脚本**
- `render_pptx.ps1`（PowerPoint 实渲染）、`qa_pptx.py`（字号 / 字体 / 备注 / 图片检查）、`selftest.py`（9 项自检）。
- `docgen/`：通用 Word 讲稿（完整版 / `--plain` 纯文字版）和准备清单生成器，内容来自 Markdown / JSON。
- `embed_logo.py`（矢量标志烘焙进页面）、`video_frames.py`、`crop.py`、`contact_sheet.py`、`extract_pdf_images.py`、`make_thumbs.py`、`docx_to_pdf.ps1`、`pdf_pages.py`。

## v1.1（2026-10-21）

- 讲稿默认只交 Markdown，用户明确要 Word 时才用 docgen 转换（反馈 #16）。
- 撤回反馈 #15 和预警窗口那一条：用户说明那是答辩后期自己的改动，不作为规则。
