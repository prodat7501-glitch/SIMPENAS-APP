"use client";

import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrintExportActions } from "@/components/ui/print-export-actions";

interface PrintPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export function PrintPreview({
  isOpen,
  onClose,
  title = "Pratinjau Cetak Dokumen",
  className,
  children,
}: PrintPreviewProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto pointer-events-auto print-direct">
        <div
          className={cn(
            "relative my-auto flex min-h-[297mm] w-[210mm] flex-col rounded-xl bg-white p-[20mm] text-slate-900 shadow-2xl print-container print:min-h-0 print:w-full print:rounded-none print:border-none print:p-0 print:shadow-none",
            className,
          )}
        >
          <div className="absolute right-4 top-4 flex items-center gap-2 no-print">
            <PrintExportActions
              title={title}
              module={title}
              printLabel="Cetak Dokumen"
            />
            <button
              onClick={onClose}
              aria-label="Tutup pratinjau"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-black transition hover:bg-black/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="pt-10 print:pt-0">{children}</div>
        </div>
      </div>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-direct,
          .print-direct * {
            visibility: visible;
          }
          .print-direct {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          .print-container {
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
