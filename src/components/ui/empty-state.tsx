import React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "Tidak Ada Data",
  description = "Belum ada rekaman data yang tersimpan pada modul ini.",
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-2xl bg-card/20 min-h-[280px] w-full",
        className,
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-4">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-xs font-bold text-foreground mb-1">{title}</h3>
      <p className="text-[11px] text-muted-foreground max-w-xs mb-4 leading-relaxed">
        {description}
      </p>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
