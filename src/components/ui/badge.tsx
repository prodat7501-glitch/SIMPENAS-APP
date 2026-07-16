import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "outline";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase transition-colors select-none",
        variant === "default" && "bg-primary text-white",
        variant === "secondary" && "bg-muted text-muted-foreground",
        variant === "success" && "bg-success/20 text-success-hover",
        variant === "warning" && "bg-warning/20 text-warning-hover",
        variant === "danger" && "bg-danger/20 text-danger",
        variant === "info" && "bg-accent/20 text-accent",
        variant === "outline" && "border border-border text-foreground",
        className,
      )}
      {...props}
    />
  );
}
