// Shared styling helpers for the defense Word documents (A4, Microsoft YaHei, deck palette).
const fs = require("fs");
const path = require("path");
const d = require("docx");

const NAVY = "17375E", ORANGE = "D9822B", GREY = "6B7280", TINT = "EEF3F8", LINE = "CBD5E1";
const FONT = "Microsoft YaHei";
const A4 = { width: 11906, height: 16838 };
const MARGIN = 1134; // 2 cm
const CONTENT_W = A4.width - 2 * MARGIN; // 9638 DXA

// "**bold** plain" -> TextRuns; bold parts in navy
function runs(text, opts = {}) {
  const out = [];
  text.split(/(\*\*[^*]+\*\*)/).forEach((part) => {
    if (!part) return;
    const bold = part.startsWith("**") && part.endsWith("**");
    out.push(new d.TextRun({
      text: bold ? part.slice(2, -2) : part,
      bold: bold || opts.bold,
      color: bold ? (opts.boldColor || NAVY) : opts.color,
      size: opts.size,
      font: FONT,
    }));
  });
  return out;
}

const p = (text, opts = {}) => new d.Paragraph({
  children: runs(text, opts),
  spacing: { after: opts.after ?? 120, line: opts.line ?? 360 },
  alignment: opts.align,
  indent: opts.indent,
});

const h1 = (text) => new d.Paragraph({ heading: d.HeadingLevel.HEADING_1, children: [new d.TextRun({ text, font: FONT })], pageBreakBefore: true });
const h2 = (text) => new d.Paragraph({ heading: d.HeadingLevel.HEADING_2, children: [new d.TextRun({ text, font: FONT })] });
const h3 = (text) => new d.Paragraph({ heading: d.HeadingLevel.HEADING_3, children: [new d.TextRun({ text, font: FONT })] });

const bullet = (text, level = 0) => new d.Paragraph({
  numbering: { reference: "bullets", level }, children: runs(text), spacing: { after: 80, line: 340 },
});
const check = (text) => new d.Paragraph({
  numbering: { reference: "checks", level: 0 }, children: runs(text), spacing: { after: 80, line: 340 },
});

// shaded call-out box (single-cell table)
function callout(lines, { fill = TINT, title } = {}) {
  const children = [];
  if (title) children.push(new d.Paragraph({ children: [new d.TextRun({ text: title, bold: true, color: NAVY, font: FONT })], spacing: { after: 80 } }));
  lines.forEach((l) => children.push(p(l, { after: 60, line: 320 })));
  const border = { style: d.BorderStyle.SINGLE, size: 4, color: fill };
  return new d.Table({
    width: { size: CONTENT_W, type: d.WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [new d.TableRow({ children: [new d.TableCell({
      width: { size: CONTENT_W, type: d.WidthType.DXA },
      shading: { type: d.ShadingType.CLEAR, color: "auto", fill },
      margins: { top: 140, bottom: 140, left: 200, right: 200 },
      borders: { top: border, bottom: border, left: { style: d.BorderStyle.SINGLE, size: 24, color: ORANGE }, right: border },
      children,
    })] })],
  });
}

// table: header row + body rows; widths in DXA summing to CONTENT_W
function table(header, rows, widths) {
  const border = { style: d.BorderStyle.SINGLE, size: 4, color: LINE };
  const borders = { top: border, bottom: border, left: border, right: border };
  const cell = (text, i, isHead, zebra) => new d.TableCell({
    width: { size: widths[i], type: d.WidthType.DXA },
    borders,
    shading: { type: d.ShadingType.CLEAR, color: "auto", fill: isHead ? NAVY : (zebra ? "F7F9FC" : "FFFFFF") },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new d.Paragraph({ children: runs(text, isHead ? { bold: true, color: "FFFFFF" } : {}), spacing: { after: 0, line: 300 } })],
  });
  return new d.Table({
    width: { size: CONTENT_W, type: d.WidthType.DXA },
    columnWidths: widths,
    rows: [
      new d.TableRow({ tableHeader: true, children: header.map((t, i) => cell(t, i, true)) }),
      ...rows.map((r, k) => new d.TableRow({ children: r.map((t, i) => cell(t, i, false, k % 2 === 1)) })),
    ],
  });
}

// slide thumbnail s01.jpg… from thumbsDir (made by scripts/make_thumbs.py); null when missing
function thumb(n, widthPx = 400, thumbsDir = null) {
  if (!thumbsDir) return null;
  const file = path.join(thumbsDir, `s${String(n).padStart(2, "0")}.jpg`);
  if (!fs.existsSync(file)) return null;
  return new d.Paragraph({
    children: [new d.ImageRun({ type: "jpg", data: fs.readFileSync(file), transformation: { width: widthPx, height: Math.round(widthPx * 9 / 16) } })],
    spacing: { before: 60, after: 120 },
  });
}

const spacer = () => new d.Paragraph({ children: [], spacing: { after: 120 } });

function doc(children, { title, header, author = "" }) {
  return new d.Document({
    title,
    creator: author,
    styles: {
      default: { document: { run: { font: FONT, size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 34, bold: true, color: NAVY, font: FONT }, paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, color: NAVY, font: FONT }, paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 1,
            border: { bottom: { style: d.BorderStyle.SINGLE, size: 6, color: ORANGE, space: 4 } } } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 24, bold: true, color: "1F2937", font: FONT }, paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
      ],
    },
    numbering: { config: [
      { reference: "bullets", levels: [
        { level: 0, format: d.LevelFormat.BULLET, text: "•", alignment: d.AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 280 } } } },
        { level: 1, format: d.LevelFormat.BULLET, text: "–", alignment: d.AlignmentType.LEFT, style: { paragraph: { indent: { left: 840, hanging: 280 } } } } ] },
      { reference: "checks", levels: [
        { level: 0, format: d.LevelFormat.BULLET, text: "☐", alignment: d.AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 320 } } } } ] },
    ] },
    sections: [{
      properties: { page: { size: A4, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
      headers: { default: new d.Header({ children: [new d.Paragraph({ alignment: d.AlignmentType.RIGHT,
        children: [new d.TextRun({ text: header, size: 18, color: GREY, font: FONT })] })] }) },
      footers: { default: new d.Footer({ children: [new d.Paragraph({ alignment: d.AlignmentType.CENTER,
        children: [new d.TextRun({ children: [d.PageNumber.CURRENT], size: 18, color: GREY, font: FONT })] })] }) },
      children,
    }],
  });
}

async function save(document, file) {
  fs.writeFileSync(file, await d.Packer.toBuffer(document));
  console.log("wrote", file);
}

module.exports = { d, p, h1, h2, h3, bullet, check, callout, table, thumb, spacer, doc, save, runs, NAVY, ORANGE, GREY, FONT, CONTENT_W };
