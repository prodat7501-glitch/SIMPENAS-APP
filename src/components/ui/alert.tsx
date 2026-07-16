import * as React from "react";
import { cn } from "@/lib/utils";
import { Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  ...props
}: AlertProps) {
  const Icon = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: AlertCircle,
  }[variant];

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-xl border text-xs font-semibold leading-relaxed w-full",
        variant === "info" && "bg-accent/5 border-accent/20 text-accent-hover",
        variant === "success" &&
          "bg-success/5 border-success/20 text-success-hover",
        variant === "warning" &&
          "bg-warning/5 border-warning/20 text-warning-hover",
        variant === "error" && "bg-danger/5 border-danger/20 text-danger",
        className,
      )}
      {...props}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <div>
        {title && (
          <p className="font-bold text-xs mb-1 text-foreground">{title}</p>
        )}
        <div className="text-muted-foreground">{children}</div>
      </div>
    </div>
  );
}
