import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createCanvas } from "@napi-rs/canvas";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

const [, , inputPdf, outputDir = "tmp/pdf-render", dpiArg = "144"] =
  process.argv;

if (!inputPdf) {
  console.error(
    "Usage: npm run render:pdf -- <input.pdf> [output-dir] [dpi]",
  );
  process.exit(1);
}

const dpi = Number(dpiArg);
if (!Number.isFinite(dpi) || dpi <= 0) {
  console.error("DPI must be a positive number.");
  process.exit(1);
}

await mkdir(outputDir, { recursive: true });

const loadingTask = pdfjsLib.getDocument({
  url: pathToFileURL(path.resolve(inputPdf)).href,
  disableWorker: true,
});
const pdf = await loadingTask.promise;
const scale = dpi / 72;
const baseName = path.basename(inputPdf, path.extname(inputPdf));

for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = createCanvas(
    Math.ceil(viewport.width),
    Math.ceil(viewport.height),
  );
  const context = canvas.getContext("2d");

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  const outputPath = path.join(
    outputDir,
    `${baseName}-page-${String(pageNumber).padStart(2, "0")}.png`,
  );
  await writeFile(outputPath, canvas.toBuffer("image/png"));
  console.log(outputPath);
}
