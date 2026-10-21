// Word preparation checklist: recap + per-slide plain-language glossary + Q&A drill, all content from a JSON spec.
// Usage: node build_prep.js --spec prep.json --out 准备清单-v1.docx [--thumbs dir]
// Spec shape: see ../../templates/prep-spec.example.json (a complete real example).
const fs = require("fs");
const L = require("./lib");
const { d, p, h1, h2, h3, bullet, check, callout, table, spacer } = L;
const args = require("./args")(["spec", "out"]);
const S = JSON.parse(fs.readFileSync(args.spec, "utf8"));
const W3 = [2000, 4400, L.CONTENT_W - 6400];
const need = (k) => { if (S[k] === undefined) throw new Error(`spec missing "${k}"`); return S[k]; };

const c = [];
const meta = need("meta");
c.push(new d.Paragraph({ spacing: { before: 2200, after: 200 }, alignment: d.AlignmentType.CENTER,
  children: [new d.TextRun({ text: meta.title, bold: true, size: 56, color: L.NAVY, font: L.FONT })] }));
if (meta.subtitle) c.push(new d.Paragraph({ alignment: d.AlignmentType.CENTER, spacing: { after: 120 },
  children: [new d.TextRun({ text: meta.subtitle, size: 28, font: L.FONT })] }));
if (meta.projectLine) c.push(new d.Paragraph({ alignment: d.AlignmentType.CENTER, spacing: { after: 1000 },
  children: [new d.TextRun({ text: meta.projectLine, size: 21, color: L.GREY, font: L.FONT })] }));
if (S.howto) c.push(callout(S.howto, { title: "怎么用这份清单" }), spacer());
if (S.toc) c.push(table(["部分", "内容", "建议用时"], S.toc, [1200, 6200, L.CONTENT_W - 7400]));

// Part 1 checklist
c.push(h1("一、检查清单"));
need("checklist").forEach((sec) => { c.push(h3(sec.title)); sec.items.forEach((t) => c.push(check(t))); });

// Part 2 recap
const R = need("recap");
c.push(h1("二、一页纸回顾"));
c.push(callout([`**${R.oneLiner}**`], { title: "一句话说清项目" }));
if (R.why) { c.push(h3("为什么做")); c.push(p(R.why)); }
if (R.phases) {
  c.push(h3(R.phases.title || "做了什么"));
  const n = R.phases.header.length;
  const widths = R.phases.widths || Array(n).fill(Math.floor(L.CONTENT_W / n));
  widths[n - 1] = L.CONTENT_W - widths.slice(0, n - 1).reduce((a, b) => a + b, 0);
  c.push(table(R.phases.header, R.phases.rows, widths));
}
if (R.footnote) c.push(p(R.footnote, { color: L.GREY }));
if (R.numbers) { c.push(h3("关键数字速记表")); c.push(table(["数字", "含义", "PPT 页"], R.numbers, [2400, 5800, L.CONTENT_W - 8200])); }
if (R.limits) { c.push(h3(R.limitsTitle || "必须知道的局限")); R.limits.forEach((t) => c.push(bullet(t))); }

// Part 3 per slide
c.push(h1("三、逐页讲解"));
c.push(p("每页包括：这页在讲什么 → 术语通俗解释（第三列是它在本项目里的具体情况）→ 可能被追问的点。", { color: L.GREY }));
need("slides").forEach((s, i) => {
  if (i > 0) c.push(new d.Paragraph({ children: [new d.PageBreak()] }));
  c.push(h2(s.title));
  const t = L.thumb(s.n, 340, args.thumbs);
  if (t) c.push(t);
  c.push(callout([s.gist], { title: "这页讲什么" }));
  if (s.terms && s.terms.length) { c.push(h3("术语通俗解释")); c.push(table(["术语", "通俗解释", "在本项目里"], s.terms, W3)); }
  if (s.asks && s.asks.length) { c.push(h3("可能被追问")); s.asks.forEach(([q, a]) => { c.push(bullet(`**${q}**`)); c.push(bullet(a, 1)); }); }
});

// Part 4 Q&A
c.push(h1("四、提问应对"));
if (S.qaPrinciples) c.push(callout(S.qaPrinciples, { title: "回答原则" }));
need("qa").forEach(([group, items]) => {
  c.push(h2(group));
  items.forEach(([q, a, more, pg]) => {
    c.push(h3(q));
    c.push(p(`**先答：**${a}`));
    if (more) c.push(p(`**补充：**${more}`));
    if (pg) c.push(p(`可翻回：${pg}`, { color: L.GREY, after: 160 }));
  });
});

// Part 5 glossary index (auto)
c.push(h1("五、术语速查"));
const idx = [];
S.slides.forEach((s) => (s.terms || []).forEach(([term, ex]) => idx.push([term, ex.length > 46 ? ex.slice(0, 46) + "…" : ex, `P${s.n}`])));
c.push(table(["术语", "一句话", "页"], idx, [2400, 6400, L.CONTENT_W - 8800]));

// Part 6 tips
if (S.tips) { c.push(h1("六、现场小贴士")); S.tips.forEach((t) => c.push(bullet(t))); }

L.save(L.doc(c.filter(Boolean), { title: meta.title, header: meta.header || "", author: meta.author || "" }), args.out);
