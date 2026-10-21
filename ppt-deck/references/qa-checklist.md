# QA 清单

交付前必须做完；结果写进 QA 记录（`templates/qa-record-template.md`）。

## 1. 自动检查

```powershell
$PY = "D:\Project-claude\ppt-deck-skill\.venv\Scripts\python.exe"
$E  = "$env:USERPROFILE\.claude\skills\ppt-master\scripts"
& $PY "$E\svg_quality_checker.py" <项目> --quick-generate --canonical-authoring --stage final --json   # 0 错误
& $PY "$E\svg_to_pptx.py" <项目> --quick-generate --with-notes                                         # postflight passed
& $PY scripts\qa_pptx.py <导出的.pptx> --min-pt 18                                                     # PASS
powershell -File scripts\render_pptx.ps1 -Pptx <导出的.pptx> -OutDir <项目>\render\vN                  # PowerPoint 实渲染
```

`qa_pptx.py` 会检查：低于最小字号的文字（页码、出处脚注除外）、实际用到的字体（主题字体会解析成真实字体名）、每页是否有备注、图片数量、空白页。修订后对比前后两版的文字段数量，可以确认文字没有被误改。

## 2. 人工逐页看（看 PowerPoint 渲染的 PNG，不看浏览器预览）

- [ ] 文字溢出、遮挡、贴边（框里文字离边小于约 8px 要调整）
- [ ] 字号：正文 ≥ 18pt；投影距离下图表刻度能看清
- [ ] 中文字体没有回退成宋体或方框
- [ ] 每页只讲一个结论，标题是结论句
- [ ] 数字和出处一致，同一个数字在全套里口径相同
- [ ] 截图完整、没有截断感、文字看得清；和资料没有冲突
- [ ] 图表：从 0 开始、标注完整、强调色只用在重点上
- [ ] 页码、页眉、角标在各页的位置一致
- [ ] 封面和封底不单调，和内容页同一套视觉语言
- [ ] 讲稿总时长 ≤ 规定时长的 90%

## 3. 看图的方法

- 先用 `scripts/contact_sheet.py` 拼缩略图总览，找出风格不一致的页；再逐页打开有疑问的大图。
- 角标、小字要用 PIL 裁出局部放大看。
- 修订时生成替换前后的对比图，交给用户确认。
