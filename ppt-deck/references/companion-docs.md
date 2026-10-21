# 配套文档

需要现场讲的 PPT，默认做讲稿备注 + Markdown 讲稿；准备清单按需问。**讲稿默认只交 Markdown**（用户读 md 就够），用户明确要 Word 时才转。

## 1. 讲稿（Markdown 源 + PPT 备注 + Word）

唯一源文件是 `deck/<名称>讲稿.md`，格式：

```markdown
## P1 封面（约 10 秒）

各位老师好……**重读词**……▶

## P2 ……
---
## 试讲提示
- 数字念法……
```

- PPT 备注：从 Markdown 生成 `notes/total.md`（标题用页面文件名 `# 01_cover`，只写纯讲稿，不要列表符号、加粗标记和“▶”）→ `total_md_split.py` → `--with-notes` 导出。
- Word（只在用户要求时生成），两种版式：
  - 纯文字版：`node scripts/docgen/build_speech.js --md <讲稿.md> --out <讲稿-vN.docx> --meta <meta.json> --plain 1`，只有“页码 + 页名 + 讲稿正文”，方便打印和自己改。
  - 完整版：去掉 `--plain`，加 `--thumbs <缩略图目录>`。每页 Word 排两张幻灯片，配缩略图，重读词加粗成主色，橙色“▶ 翻页”，附试讲提示。
  - `meta.json` 的格式见 `templates/speech-meta.example.json`，讲稿 Markdown 实例见 `templates/speech.example.md`。
- 缩略图来自 PowerPoint 渲染图：`python scripts/make_thumbs.py <render目录> <缩略图目录>`。

## 2. 准备清单（Word）

给“很久没碰这个项目”的用户回顾用，要通俗易懂。用 JSON 写内容（结构见 `templates/prep-spec.example.json`，这是一个完整实例），再生成：

`node scripts/docgen/build_prep.js --spec <prep.json> --out <准备清单-vN.docx> --thumbs <缩略图目录>`

固定六部分：
1. **检查清单**：文件和设备、内容准备、现场演示注意事项（可打勾）
2. **一页纸回顾**：一句话说清项目、为什么做、分工表、关键数字速记表、必须知道的局限
3. **逐页讲解**：每页缩略图、“这页讲什么”、术语通俗解释表（术语 / 通俗解释 / 在本项目里）、老师可能的追问
4. **提问应对**：分组，每题“先答 + 补充 + 可翻回第几页”
5. **术语速查**：自动从第三部分汇总
6. **现场小贴士**

术语解释的要求：用生活化的比喻（“召回率：该抓的抓到了多少”），同时保证技术上准确；涉及具体数值时和 PPT 保持一致；不确定的说法不写。

## 3. 问答准备（Markdown）

`deck/QA_prep.md`：10–16 题，覆盖局限性、数据可靠性、创新点、与已有工作的区别、指标为什么没达到；每题写回答要点和对应页码。如实回答，不夸大，可以引用资料里自己写明的局限。

## 4. 验证

Word 文件用 `scripts/docx_to_pdf.ps1` 让 Word 导出 PDF，再用 `scripts/pdf_pages.py` 渲染成 PNG 逐页看（本机没有 LibreOffice）。
