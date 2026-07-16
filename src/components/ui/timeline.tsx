import React from "react";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  time: string;
  status?: "pending" | "success" | "warning" | "danger";
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <div
      className={cn(
        "space-y-6 relative pl-4 border-l border-border/80 ml-2 w-full",
        className,
      )}
    >
      {events.map((e) => (
        <div key={e.id} className="relative group">
          {/* Connector dot */}
          <div
            className={cn(
              "absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-card transition-all group-hover:scale-125 bg-muted",
              e.status === "success" && "bg-success",
              e.status === "pending" && "bg-primary",
              e.status === "warning" && "bg-warning",
              e.status === "danger" && "bg-danger",
            )}
          />
          {/* Details */}
          <div className="text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
              <span className="font-bold text-foreground">{e.title}</span>
              <span className="text-[10px] text-muted-foreground font-semibold shrink-0">
                {e.time}
              </span>
            </div>
            {e.description && (
              <p className="text-muted-foreground leading-relaxed font-medium">
                {e.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
