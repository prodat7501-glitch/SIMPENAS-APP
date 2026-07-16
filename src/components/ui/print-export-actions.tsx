"use client";

import { useState } from "react";
import { FileSpreadsheet, FileText, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  exportPrintDocument,
  type PrintExportFormat,
} from "@/lib/document-export";
import { useActivityStore } from "@/stores/activity.store";

interface PrintExportActionsProps {
  title: string;
  module: string;
  description?: string;
  printLabel?: string;
  className?: string;
}

const ACTIONS: Array<{
  format: PrintExportFormat;
  label: string;
  activity: "Print" | "Export";
  activityLabel: string;
  icon: typeof Printer;
  primary?: boolean;
}> = [
  {
    format: "print",
    label: "Cetak",
    activity: "Print",
    activityLabel: "Mencetak",
    icon: Printer,
    primary: true,
  },
  {
    format: "doc",
    label: "DOC",
    activity: "Export",
    activityLabel: "Mengekspor DOC",
    icon: FileText,
  },
  {
    format: "xls",
    label: "XLS",
    activity: "Export",
    activityLabel: "Mengekspor XLS",
    icon: FileSpreadsheet,
  },
];

export function PrintExportActions({
  title,
  module,
  description,
  printLabel = "Cetak",
  className,
}: PrintExportActionsProps) {
  const log = useActivityStore((state) => state.add);
  const [pendingFormat, setPendingFormat] = useState<PrintExportFormat | null>(
    null,
  );

  const handleExport = async (
    format: PrintExportFormat,
    activity: "Print" | "Export",
    activityLabel: string,
  ) => {
    setPendingFormat(format);

    try {
      const exported = await exportPrintDocument({ format, title });

      if (!exported) {
        return;
      }

      log({
        action: activity,
        module,
        description: description ?? `${activityLabel} ${title}`,
        user: "Pengguna aktif",
      });
    } finally {
      setPendingFormat(null);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {ACTIONS.map(({ format, label, activity, activityLabel, icon: Icon, primary }) => (
        <button
          key={format}
          type="button"
          disabled={pendingFormat !== null}
          onClick={() => handleExport(format, activity, activityLabel)}
          aria-label={`${activityLabel} ${title}`}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold shadow-md transition",
            pendingFormat !== null && "cursor-wait opacity-70",
            primary
              ? "bg-primary text-white hover:bg-primary/95"
              : "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-100",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {pendingFormat === format
            ? "Memproses..."
            : format === "print"
              ? printLabel
              : label}
        </button>
      ))}
    </div>
  );
}
