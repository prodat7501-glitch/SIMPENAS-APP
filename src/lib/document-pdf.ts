import type { TemplateConfig } from "@/stores/template.store";
import { useActivityStore } from "@/stores/activity.store";
import { downloadBlobFile, requestDownloadFileName } from "@/lib/download-file";

export interface PdfSection {
  title?: string;
  lines: string[];
}

export interface PdfDocumentInput {
  title: string;
  subtitle?: string;
  sections: PdfSection[];
  filename: string;
  template: TemplateConfig;
}

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const FONT_SIZE = 10;
const LINE_HEIGHT = 15;

const escapePdfText = (value: string) =>
  value
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll("\r", "")
    .replaceAll("\n", " ");

const wrapLine = (line: string, maxChars: number) => {
  const words = line.split(/\s+/).filter(Boolean);
  const rows: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      rows.push(current);
      current = word;
      return;
    }
    current = next;
  });

  if (current) rows.push(current);
  return rows.length ? rows : [""];
};

const buildLines = (input: PdfDocumentInput) => {
  const lines = [
    input.template.kopSurat,
    input.template.alamat,
    "Logo: " + input.template.logo,
    "",
    input.title.toUpperCase(),
    ...(input.subtitle ? [input.subtitle] : []),
    "",
  ];

  input.sections.forEach((section) => {
    if (section.title) lines.push(section.title.toUpperCase());
    lines.push(...section.lines);
    lines.push("");
  });

  lines.push(input.template.footer);
  return lines;
};

export function createDocumentPdf(input: PdfDocumentInput) {
  const margin = Math.max(input.template.margin * 2.83465, 36);
  const maxChars = Math.max(Math.floor((PAGE_WIDTH - margin * 2) / 5.2), 32);
  const maxRowsPerPage = Math.max(
    Math.floor((PAGE_HEIGHT - margin * 2) / LINE_HEIGHT),
    1,
  );
  const textRows = buildLines(input).flatMap((line) =>
    wrapLine(line, maxChars),
  );
  const pages = Array.from(
    { length: Math.ceil(textRows.length / maxRowsPerPage) || 1 },
    (_, index) =>
      textRows.slice(index * maxRowsPerPage, (index + 1) * maxRowsPerPage),
  );
  const pageObjectStart = 3;
  const fontObjectId = pageObjectStart + pages.length;
  const contentObjectStart = fontObjectId + 1;
  const pageRefs = pages
    .map((_, index) => `${pageObjectStart + index} 0 R`)
    .join(" ");
  const pageObjects = pages.map(
    (_, index) =>
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectStart + index} 0 R >>`,
  );
  const contentObjects = pages.map((rows) => {
    const content = [
      "BT",
      `/F1 ${FONT_SIZE} Tf`,
      `${LINE_HEIGHT} TL`,
      `${margin.toFixed(2)} ${(PAGE_HEIGHT - margin).toFixed(2)} Td`,
      ...rows.map((line, index) =>
        index === 0
          ? `(${escapePdfText(line)}) Tj`
          : `T* (${escapePdfText(line)}) Tj`,
      ),
      "ET",
    ].join("\n");

    return `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>`,
    ...pageObjects,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ...contentObjects,
  ];
  const chunks = ["%PDF-1.4\n"];
  const offsets: number[] = [0];

  objects.forEach((object, index) => {
    offsets.push(chunks.join("").length);
    chunks.push(`${index + 1} 0 obj\n${object}\nendobj\n`);
  });

  const xrefOffset = chunks.join("").length;
  chunks.push(`xref\n0 ${objects.length + 1}\n`);
  chunks.push("0000000000 65535 f \n");
  offsets.slice(1).forEach((offset) => {
    chunks.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
  });
  chunks.push(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
  );

  return new Blob([chunks.join("")], { type: "application/pdf" });
}

export function downloadGeneratedPdf(input: PdfDocumentInput) {
  const fileName = requestDownloadFileName(input.filename, "pdf");

  if (!fileName) {
    return;
  }

  const blob = createDocumentPdf(input);
  downloadBlobFile(blob, fileName);
  useActivityStore.getState().add({
    action: "Export",
    module: input.title,
    description: `Mengunduh PDF ${fileName}`,
    user: "Pengguna aktif",
  });
}
