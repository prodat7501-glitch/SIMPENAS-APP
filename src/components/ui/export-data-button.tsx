"use client";

import { FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  exportTableToExcel,
  type ExcelTableColumn,
} from "@/lib/table-excel-export";
import { useActivityStore } from "@/stores/activity.store";

interface ExportDataButtonProps<Row> {
  title: string;
  module: string;
  rows: Row[];
  columns: ExcelTableColumn<Row>[];
  defaultFileName: string;
}

export function ExportDataButton<Row>({
  title,
  module,
  rows,
  columns,
  defaultFileName,
}: ExportDataButtonProps<Row>) {
  const log = useActivityStore((state) => state.add);

  const handleExport = () => {
    const fileName = exportTableToExcel({
      title,
      worksheetName: module,
      columns,
      rows,
      defaultFileName,
    });
    if (!fileName) return;
    log({
      action: "Export",
      module,
      description: `Export Data ${fileName} berisi ${rows.length} baris`,
      user: "Pengguna aktif",
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleExport}
      disabled={rows.length === 0}
      className="gap-1.5"
    >
      <FileSpreadsheet className="h-4 w-4" />
      Export Data
    </Button>
  );
}
