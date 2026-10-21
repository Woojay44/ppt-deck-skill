// Word speech script from the single-source Markdown (## P<n> <title>… sections, optional "## 试讲提示").
// Usage: node build_speech.js --md 讲稿.md --out 讲稿-v1.docx --meta meta.json [--thumbs dir] [--per-page 2] [--plain 1]
// --plain 1: text-only layout (page title + script, no cover/thumbnails/timings/bold/flip marks/tips)
// meta.json: { "title", "subtitle", "projectLine", "header", "author", "info": [["汇报人","…"], …], "howto": ["…"] }
const fs = require("fs");
const L = require("./lib");
const { d } = L;
const args = require("./args")(["md", "out", "meta"]);

const md = fs.readFileSync(args.md, "utf8").replace(/\r\n/g, "\n");
const meta = JSON.parse(fs.readFileSync(args.meta, "utf8"));
const perPage = Number(args["per-page"] || 2);
const plain = Boolean(args.plain && args.plain !== "0");

const pages = [];
const re = /^## (P(\d+)[^\n]*)\n+([\s\S]*?)(?=\n## |\n---|$(?![\s\S]))/gm;
let m;
while ((m = re.exec(md))) pages.push({ title: m[1].trim(), n: +m[2], body: m[3].trim() });
if (!pages.length) throw new Error("no '## P<n> …' sections found in " + args.md);

const tipsBlock = md.split(/^## 试讲提示/m)[1];
const tips = tipsBlock ? tipsBlock.trim().split("\n").filter((l) => l.startsWith("- ")).map((l) => l.slice(2)) : [];

let children = [
  new d.Paragraph({ spacing: { before: 2400, after: 200 }, alignment: d.AlignmentType.CENTER,
    children: [new d.TextRun({ text: meta.title || "讲稿", bold: true, size: 56, color: L.NAVY, font: L.FONT })] }),
];
if (meta.subtitle) children.push(new d.Paragraph({ alignment: d.AlignmentType.CENTER, spacing: { after: 120 },
  children: [new d.TextRun({ text: meta.subtitle, size: 26, font: L.FONT })] }));
if (meta.projectLine) children.push(new d.Paragraph({ alignment: d.AlignmentType.CENTER, spacing: { after: 1200 },
  children: [new d.TextRun({ text: meta.projectLine, size: 22, color: L.GREY, font: L.FONT })] }));
if (meta.info && meta.info.length) children.push(L.table(["项目", "内容"], meta.info, [2400, L.CONTENT_W - 2400]), L.spacer());
children.push(L.callout(meta.howto || [
  "**加粗**是要重读的关键词；“▶ 翻页”表示讲到这里切到下一页。",
  "讲稿内容和 PPT 每页备注一致，在 PowerPoint 演示者视图里也能看到。",
], { title: "怎么用这份讲稿" }));

if (plain) {
  children = [];
  pages.forEach((pg) => {
    children.push(L.h3(pg.title.replace(/（[^）]*）\s*$/, "")));
    const body = pg.body.replace(/▶\s*$/, "").replace(/\*\*/g, "").trim();
    body.split(/\n\s*\n/).forEach((para) => children.push(L.p(para.replace(/\n/g, ""), { line: 400 })));
  });
  L.save(L.doc(children, { title: meta.title || "讲稿", header: "", author: meta.author || "" }), args.out);
  return;
}

pages.forEach((pg, i) => {
  const flip = pg.body.endsWith("▶");
  const text = pg.body.replace(/▶\s*$/, "").trim();
  if (i % perPage === 0) children.push(new d.Paragraph({ children: [new d.PageBreak()] }));
  children.push(L.h2(pg.title));
  const t = L.thumb(pg.n, 300, args.thumbs);
  if (t) children.push(t);
  text.split(/\n\s*\n/).forEach((para) =>
    children.push(new d.Paragraph({ children: L.runs(para.replace(/\n/g, ""), { size: 26 }), spacing: { after: 120, line: 420 } })));
  if (flip) children.push(new d.Paragraph({ alignment: d.AlignmentType.RIGHT, spacing: { after: 200 },
    children: [new d.TextRun({ text: "▶ 翻页", bold: true, color: L.ORANGE, font: L.FONT, size: 22 })] }));
});

if (tips.length) {
  children.push(new d.Paragraph({ children: [new d.PageBreak()] }));
  children.push(L.h2("试讲提示"));
  tips.forEach((t) => children.push(L.bullet(t)));
}

L.save(L.doc(children, { title: meta.title || "讲稿", header: meta.header || "", author: meta.author || "" }), args.out);
