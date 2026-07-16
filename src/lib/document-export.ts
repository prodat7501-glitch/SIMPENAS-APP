"use client";

import {
  downloadBlobFile,
  requestDownloadFileName,
} from "@/lib/download-file";

export type PrintExportFormat = "print" | "doc" | "xls";

interface ExportPrintDocumentOptions {
  format: PrintExportFormat;
  title: string;
}

const PRINT_CONTAINER_SELECTOR = ".print-direct .print-container";

function toAbsoluteUrl(value: string) {
  try {
    return new URL(value, window.location.origin).href;
  } catch {
    return value;
  }
}

function getPrintableClone() {
  const container = document.querySelector<HTMLElement>(PRINT_CONTAINER_SELECTOR);

  if (!container) {
    return null;
  }

  const clone = container.cloneNode(true) as HTMLElement;

  clone
    .querySelectorAll(".no-print, script, button")
    .forEach((element) => element.remove());

  clone.querySelectorAll<HTMLImageElement>("img").forEach((image) => {
    const src = image.getAttribute("src");
    if (src) {
      image.setAttribute("src", toAbsoluteUrl(src));
    }
  });

  return clone;
}

function collectDocumentStyles() {
  return Array.from(
    document.querySelectorAll<HTMLStyleElement | HTMLLinkElement>(
      'style, link[rel="stylesheet"]',
    ),
  )
    .map((element) => {
      if (element instanceof HTMLLinkElement) {
        const href = element.getAttribute("href");
        return href
          ? `<link rel="stylesheet" href="${toAbsoluteUrl(href)}" />`
          : "";
      }

      return `<style>${element.innerHTML}</style>`;
    })
    .join("\n");
}

function buildHtmlDocument(title: string, body: string) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  ${collectDocumentStyles()}
  <style>
    body { background: #ffffff; color: #000000; }
    table { border-collapse: collapse; }
    img { max-width: 100%; }
  </style>
</head>
<body>
  ${body}
</body>
</html>`;
}

function buildExcelDocument(title: string, clone: HTMLElement) {
  const tables = Array.from(clone.querySelectorAll("table"));
  const body = tables.length
    ? tables.map((table) => table.outerHTML).join("<br />")
    : `<table><tbody>${(clone.textContent ?? "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `<tr><td>${line}</td></tr>`)
        .join("")}</tbody></table>`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    table { border-collapse: collapse; }
    td, th { border: 1px solid #000000; padding: 4px; vertical-align: top; }
  </style>
</head>
<body>
  <h3>${title}</h3>
  ${body}
</body>
</html>`;
}

export async function exportPrintDocument({
  format,
  title,
}: ExportPrintDocumentOptions) {
  if (typeof window === "undefined") return;

  if (format === "print") {
    window.print();
    return true;
  }

  const clone = getPrintableClone();
  if (!clone) {
    window.alert("Dokumen pratinjau tidak ditemukan.");
    return false;
  }

  const fileName = requestDownloadFileName(title, format);
  if (!fileName) {
    return false;
  }

  if (format === "doc") {
    downloadBlobFile(
      new Blob([`\ufeff${buildHtmlDocument(title, clone.outerHTML)}`], {
        type: "application/msword;charset=utf-8",
      }),
      fileName,
    );
    return true;
  }

  downloadBlobFile(
    new Blob([`\ufeff${buildExcelDocument(title, clone)}`], {
      type: "application/vnd.ms-excel;charset=utf-8",
    }),
    fileName,
  );
  return true;
}
