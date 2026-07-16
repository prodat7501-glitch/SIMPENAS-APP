"use client";

export function sanitizeFileName(value: string) {
  const normalized = value
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || "dokumen";
}

export function requestDownloadFileName(defaultName: string, extension: string) {
  const cleanExtension = extension.replace(/^\./, "").toLowerCase();
  const extensionPattern = new RegExp(`\\.${cleanExtension}$`, "i");
  const defaultBaseName = sanitizeFileName(defaultName).replace(
    extensionPattern,
    "",
  );
  const input = window.prompt(
    `Masukkan nama file .${cleanExtension}`,
    defaultBaseName,
  );

  if (input === null) {
    return null;
  }

  const fileName = sanitizeFileName(input || defaultBaseName).replace(
    extensionPattern,
    "",
  );

  return `${fileName}.${cleanExtension}`;
}

export function downloadBlobFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
