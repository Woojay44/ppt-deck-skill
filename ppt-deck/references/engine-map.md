# ppt-master 引擎地图

ppt-master（hugohe3/ppt-master，MIT）原样安装在 `%USERPROFILE%\.claude\skills\ppt-master`，是本 skill 的渲染引擎。**全部功能都可以用，但只通过它自己的 SKILL.md、workflows 和 scripts 调用，不改它的文件。**

调用方式：需要引擎时，用 Skill 工具加载 `ppt-master`（它会先跑完整性检查、读 `workflows/routing.md` 选路线）。本文件帮你**提前判断**该走哪条路线、要准备什么，避免在它的长文档里迷路。

## 1. 需求 → 路线

| 用户的需求 | ppt-master 路线 / 模式 | 说明 |
|---|---|---|
| 按资料或主题新做一份 | Generate → **Quick**（本 skill 默认） | 用我们自己的 `outline.md` 作为计划，跳过它的策略师和确认网页；页面手写 SVG，单次最终检查后导出 |
| 新做一份，且想走它完整的设计确认（三套方案、设计规范锁定、确认网页） | Generate → **Default** | 流程重、耗 token；用户明确想要完整设计确认，或页数很多需要分会话续做时用 |
| 旧 PPT 内容不变，只换更好的设计 | Generate → **Beautify** | 保持原文字、页数、顺序 1:1；说“快一点”时走 Quick |
| 截图 / 图片 / PDF 页面要重建成可编辑 PPT | Generate → **Image to PPTX** | 只走 Quick；按页帧还原 |
| 旧 PPT 的设计要保留，只改内容 / 增删页 / 加备注 / 加动画 / 加配音 | **Edit Native PPTX** | 往返编辑，未改动页面逐字节保留 |
| 学院 / 公司模板，以后反复用 | **Create Template**（Brand / Style / Layout / Deck 工作区） | 产出模板工作区，再在 Generate 时套用 |
| 给了一份模板 PPTX + 新内容 | 先 Edit Native（直接填）；要反复复用时先 Create Template | 原样模板优先“填充”，效果不好再改为参照模板配色和 logo 从零生成，并告诉用户改了路线 |
| 只有主题、缺事实 | Generate 内的 **topic-research** 阶段 | 只补缺口；学术、答辩等场景不上网凑内容 |
| 录播 / 自动播放 / 视频 | Generate 内加载 `video-design`，再走 **customize-animations**、**generate-audio** | 配音、字幕、MP4 |
| 逐个元素出现、强调、转场 | **customize-animations**，或导出参数 `-a auto`、`-t <转场>` | 默认淡入转场，不加元素动画 |
| 需要图片但用户没给 | AI 生图（`image_gen.py`）或网络搜图（`image_search.py`） | 学术 / 事实类页面只用真实材料；装饰性、氛围性页面可用，并注明来源 |
| 改全局配色或字体 | `update_spec.py`（Default 项目）；Quick 项目在 SVG 里统一替换 | |

画布：默认 16:9（`ppt169`，1280×720）。小红书 / 朋友圈 / 竖版故事 / A4 海报等见引擎 `references/canvas-formats.md`。

## 2. 引擎里的常用脚本（`%ENGINE%\scripts\`）

| 脚本 | 用途 |
|---|---|
| `attribution_guard.py` | 完整性检查，每次开始先跑 |
| `source_to_md.py` | PDF / Word / PPT / 网页 → Markdown，读材料首选 |
| `project_manager.py init <名称> --quick-generate` | 建项目（固定建在**当前目录**的 `projects/` 下，名字自动加日期） |
| `text_measure.py calibrate <项目> --role 名称:字体:字号[:bold]` | 每种字号每 100px 能放多少字，用来防止溢出 |
| `icon_sync.py <项目> <库>/<名>…` | 把图标拷进项目；一次只用一个风格库（推荐 `tabler-filled`，实心，投影清晰） |
| `preset_shape_svg.py render <形状> --id --frame x y w h --fill` | 生成可编辑的原生形状（箭头、人字形、标注框等） |
| `svg_position_calculator.py calc bar/line/pie …` | 按数据算图表坐标，柱子位置以它为准 |
| `svg_quality_checker.py <项目> --quick-generate --canonical-authoring --stage final --json` | 最终检查，必须 0 错误才能导出 |
| `compact_svg_styles.py svg_output --inplace` | 规范化样式写法，消除检查器的提示 |
| `total_md_split.py <项目>` | 把 `notes/total.md` 拆成每页备注 |
| `svg_to_pptx.py <项目> --quick-generate --with-notes` | 导出 PPTX；原生可编辑图表加 `--native-charts-and-tables` |
| `latex_render.py` / 原生公式 | 方法页公式，见引擎 `references/native-formula.md` |

## 3. 必须知道的坑（实测）

- **字号换算**：1280 宽画布上 1px = 0.75pt。正文 ≥ 18pt 就是 SVG 里 ≥ 24px；页码、出处脚注可以 18px（13.5pt）作为例外。
- **Windows**：一律用 `python`，不用 `python3`（会弹出微软商店）；PowerShell 里传以 `/` 开头的参数要注意路径转换。
- **根组区域**：每个顶层 `<g id>` 都要写 `data-pptx-bounds`，区域之间重叠超过 1px 会报错；标签、标注要放进所属图表的组里，不要单独成组。
- **`marker-end`（箭头线端）只能写在 `<line>` / `<path>` 上**，写在 `<g>` 上会报错。
- **滤镜（阴影、发光）只能挂在单个形状上**（rect / circle / path / image / text），不能挂在 `<g>` 上。
- **渐变**：`linearGradient` / `radialGradient` 放在 `<defs>`，用 objectBoundingBox 坐标；背景矩形用渐变会导出成幻灯片原生背景。
- **不要嵌套 `<svg>`，也不要用 transform 缩放**：要放进页面的外部矢量图（标志等），先用 `scripts/embed_logo.py` 把坐标、半径、线宽按比例换算好再写进去。
- **Quick 项目没有 `design_spec.md` / `spec_lock.md`**：配色等以 `svg_output/` 实际色值为准（`grep -ohE '#[0-9A-F]{6}' *.svg | sort | uniq -c`）。
- 检查通过后再跑 `compact_svg_styles.py`，之后要重跑一次检查，导出器会核对检查报告的指纹。
- 导出会自动在 `backup/` 留 `svg_output` 副本，`exports/` 里旧文件保留，文件名带时间戳。
