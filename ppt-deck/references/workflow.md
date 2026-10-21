# 完整流程

核心顺序（用户验证过的经验）：**先把事实底稿定下来 → 写逐页讲稿 → 按讲稿生成 PPT**。PPT 是讲稿的视觉化，不是先画页面再凑话。

每次回复开头写一行：`当前进度：第 X 步 · <这一步的哪一部分>`。

## 第 1 步 需求
- 判定场景（`scenes.md`）和引擎路线（`engine-map.md` §1）。
- 收集：用途和受众、陈述时长、交付时间（涉及北京时间要换算，本机是美国太平洋时间）、有无模板 / logo、需要哪些配套（讲稿、Word、问答准备、视频）、命名规则。
- 只问真正卡住的问题，其余写成“我的默认做法”，让用户有异议再说。

## 第 2 步 材料
- 用 `%ENGINE%\scripts\source_to_md.py` 把 PDF / Word / PPT 转成文本；图片用 `scripts/extract_pdf_images.py` 抽出，拼成缩略图（`scripts/contact_sheet.py`）一次看完。
- 视频演示：`scripts/video_frames.py` 每隔几秒抽帧，挑**内容完整**的帧，用 `scripts/crop.py` 去掉浏览器边框。
- 整理“事实底稿”：每个数字记下出处（文件 + 章节 / 页码）。
- **口径冲突**（报告、中期材料、系统截图、原始数据之间数字不一致）：列成表交给用户决定用哪个口径，不自己挑。决定后写进项目记忆。
- 用户说材料里哪些不用，就不用；删除文件前先确认，不可逆的操作先问。

## 第 3 步 大纲（⛔ 用户确认前不进入生成）
用 `templates/outline-template.md`。每页写清：
- 结论式标题（一句话结论，不是“实验结果”这种标签）
- 2–4 个要点；要用的图或数据及出处
- 讲稿（按 250 字/分钟算时长）、预计时长
- 文末：时长核对、需要用户确认的问题、决定记录

用户已有现成的报告 / 讲稿时，以它为底稿；觉得底稿质量不行，先说明问题、问用户要不要重写，不擅自重写。

## 第 4 步 样稿（⛔ 确认风格）
- 建项目：在交付目录下运行 `project_manager.py init <名称> --quick-generate`（或按路线用 Default / Beautify / 模板）。
- 校准字号（`text_measure.py calibrate`），定好标题 / 正文 / 标签 / 脚注四种字号。
- 出 2 页：封面 + 信息最密的一张内容页（带图表）。检查 → 导出 → `scripts/render_pptx.ps1` 用 PowerPoint 渲染 → 把 PNG 给用户看。
- 用户说“继续”而没提意见，也算确认。

## 第 5 步 生成
- 按大纲逐页手写 SVG（引擎规定页面必须由主代理手写，不能用生成器批量写页面）。
- 图表坐标用 `svg_position_calculator.py` 算；截图放进带阴影的白卡片；小字截图改成原生重画（`design-rules.md`）。
- 7 页以上，第 5 页后跑一次 early 检查；全部写完跑 final 检查，0 错误后导出。
- 讲稿写进 `notes/total.md`（标题 `# 01_cover` 这种页面文件名，页间用 `---`，只写纯讲稿段落），`total_md_split.py` 拆分后用 `--with-notes` 导出。

## 第 6 步 QA
见 `qa-checklist.md`。修完再交付，附 QA 记录（`templates/qa-record-template.md`）。

## 第 7 步 配套
见 `companion-docs.md`：讲稿（默认 Markdown，用户要时转 Word）、准备清单（Word，按需）、问答准备。

## 第 8 步 修订（交付后用户提意见）
- Quick 项目：直接改对应的 `svg_output/*.svg`（所有重复出现同一内容的页都要改）→ 改 `notes/total.md` → 重跑 final 检查 → 拆分备注 → 导出。不重新规划，不重新生成整套。
- Default 项目：按引擎 `generate-pptx.md` 的 Revision Round。
- 原生 PPTX：按引擎 `edit-native-pptx.md` §7。
- 增删页或调整顺序：先改编号，包括文件名、页脚页码、目录页、备注标题、动画配置的键。
- 批量改样式：用脚本做查找替换时，**每处替换都要断言命中次数**，改完用 grep 抽查。
- 每次修订都按命名规则出新版本号，旧版保留，方便对比回退。改之前把 `svg_output` 备份一份，用来做替换前后的对比图。
- 把本轮意见提炼成规则，追加到 `feedback-log.md`。
