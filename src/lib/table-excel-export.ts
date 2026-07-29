"use client";

import { downloadBlobFile, requestDownloadFileName } from "./download-file";
import {
  buildExcelTableWorkbook,
  type BuildExcelTableWorkbookOptions,
} from "./table-excel-workbook";

export type { ExcelCellValue, ExcelTableColumn } from "./table-excel-workbook";

export function exportTableToExcel<Row>(
  options: BuildExcelTableWorkbookOptions<Row> & { defaultFileName: string },
) {
  const fileName = requestDownloadFileName(options.defaultFileName, "xls");
  if (!fileName) return null;
  const workbook = buildExcelTableWorkbook(options);
  downloadBlobFile(
    new Blob([workbook], { type: "application/vnd.ms-excel;charset=utf-8" }),
    fileName,
  );
  return fileName;
}
