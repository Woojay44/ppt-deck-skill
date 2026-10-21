---
name: ppt-deck
description: 通用 PPT / 演示文稿制作与修改的总入口：新建、按资料生成、美化旧 PPT、套用或创建模板、在原 PPTX 上改页、加讲稿备注 / 动画 / 配音 / 视频、做标志图标，并配套 Markdown 讲稿（需要时转 Word）和准备清单。以 ppt-master 为渲染引擎（原样调用、不修改），在其上加场景预设、分阶段确认流程、质量规则、PowerPoint 实渲染逐页 QA。用户提到 PPT、PPTX、幻灯片、演示文稿、deck、课件、路演、汇报、答辩、开题、组会、发布会、培训材料、小红书图文等任何要做或要改演示文稿的需求时使用，优先于通用 pptx skill。
---

# ppt-deck

做 PPT 的唯一入口。**ppt-master 负责画（SVG → 原生可编辑 PPTX），本 skill 负责想清楚做什么、守住质量、交付配套材料。**

## 0. 每次开始先做

1. 读用户的相关记忆和 `references/feedback-log.md`（历次用户修改意见，已转成规则），本次照做。
2. 定位环境（Windows）：
   - 引擎：`ENGINE=%USERPROFILE%\.claude\skills\ppt-master`
   - Python：`D:\Project-claude\ppt-deck-skill\.venv\Scripts\python.exe`（没有就按 `references/setup.md` 建）；**不用 `python3`**
   - 先跑 `python "%ENGINE%\scripts\attribution_guard.py"`，非 0 立即停下报告，**不修复、不绕过**。
3. 自检有疑问时跑 `python scripts/selftest.py`。

## 1. 硬规则（任何场景都不能破）

- **不修改 ppt-master 的任何文件**，不绕过它的完整性检查；只通过它的脚本和流程调用。需要它没有的能力，就写在本 skill 的 `scripts/` 里。
- **不编造**：数字、结论、引用、截图内容都要有出处（用户材料、报告章节、数据文件）；查不到就问或不写。截图里的数字和公式要和正文资料逐项核对。
- **分阶段确认**：大纲确认前不生成；先出 2 页样稿确认风格再批量；不一次性生成全部再给看。
- **需要用户决定时在回复正文里列问题和选项**（附利弊和推荐），不用弹窗。每次回复写明当前处在流程的哪一步。
- 交付文件命名按用户规则；没有规则时先问。默认版本号递增：`<名称>-v1.pptx`、`-v2`…，旧版保留。

## 2. 流程（详见 `references/workflow.md`）

| 步 | 做什么 | 停下确认 |
|---|---|---|
| 1 需求 | 判定场景（`references/scenes.md`）和引擎路线（`references/engine-map.md`）；收集时长、受众、模板、交付物 | 有关键缺口时 |
| 2 材料 | 读材料（`ENGINE/scripts/source_to_md.py`），整理事实和数字口径，列出冲突 | 口径冲突交给用户定 |
| 3 大纲 | `outline.md`：结论式标题、要点、图和数据出处、讲稿、时长 | ⛔ 必须确认 |
| 4 样稿 | 2 页（封面 + 一张信息最密的内容页），PowerPoint 渲染给用户看 | ⛔ 确认风格 |
| 5 生成 | 按引擎路线批量生成；设计规则见 `references/design-rules.md` | 分批汇报 |
| 6 QA | PowerPoint 实渲染逐页看 + `scripts/qa_pptx.py`（`references/qa-checklist.md`） | 交付前 |
| 7 配套 | 讲稿备注、Markdown 讲稿（用户要时再转 Word）、准备清单、问答准备（`references/companion-docs.md`） | 按需 |
| 8 修订 | 改对应 SVG → 重跑检查 → 新版本号导出（`references/workflow.md` §修订） | 每轮 |

可选：标志 / 图标系统（`references/branding.md`，调用 logo-design skill）。

## 3. 参考文件

| 文件 | 何时读 |
|---|---|
| `references/scenes.md` | 第 1 步：场景预设（结构、页数与时长、受众关注点、风格、画布） |
| `references/engine-map.md` | 第 1、5 步：ppt-master 全部路线和功能怎么选、怎么调用、常见坑 |
| `references/workflow.md` | 全流程细节、停顿点、修订规则 |
| `references/content-rules.md` | 写大纲和讲稿时：标题、信息密度、数据出处、口径冲突 |
| `references/design-rules.md` | 第 4–5 步：视觉质量规则（来自用户反馈） |
| `references/qa-checklist.md` | 第 6 步：自动 + 人工检查项 |
| `references/companion-docs.md` | 第 7 步：讲稿、准备清单的结构和生成方法 |
| `references/branding.md` | 需要项目标志、角标、背景纹理时 |
| `references/feedback-log.md` | 每次开始读；每个项目结束后追加新的用户意见 |
| `references/setup.md` | 首次安装、换电脑、依赖缺失时 |

## 4. 收尾

交付时列出：文件路径、版本号、做了哪些检查和结果、已知问题。项目结束后把本轮用户的修改意见提炼成规则，追加到 `references/feedback-log.md`（必要时同步改对应规则文件），并在 `docs/CHANGELOG.md` 记一笔。
