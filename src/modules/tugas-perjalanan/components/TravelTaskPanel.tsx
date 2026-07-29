import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TravelTask } from "../travel-task.types";

interface TravelTaskPanelProps {
  tasks: TravelTask[];
}

const formatDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const badgeVariant = (task: TravelTask) => {
  if (task.tone === "danger") return "danger" as const;
  if (task.tone === "warning") return "warning" as const;
  if (task.tone === "success") return "success" as const;
  return "info" as const;
};

export function TravelTaskPanel({ tasks }: TravelTaskPanelProps) {
  const activeCount = tasks.filter((task) => !task.completed).length;

  return (
    <Card className="space-y-4 p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h2 className="text-base font-extrabold">Tugas Perjalanan Saya</h2>
            <Badge variant={activeCount ? "warning" : "success"}>
              {activeCount} Aktif
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Tugas personal, dokumen, approval, validasi SPJ, dan pembayaran yang
            menjadi kewenangan akun Anda.
          </p>
        </div>
      </div>

      {!tasks.length ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
          <p className="mt-2 text-sm font-bold">Belum ada tugas perjalanan</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tugas akan muncul ketika Anda ditugaskan, memiliki dokumen yang
            belum selesai, memiliki dokumen yang harus di-approval, atau
            memiliki antrean validasi dan pembayaran.
          </p>
        </div>
      ) : (
        <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
          {tasks.map((task) => (
            <article
              key={task.id}
              className="rounded-xl border border-border bg-background p-4"
            >
              <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={badgeVariant(task)}>
                      {task.statusLabel}
                    </Badge>
                    <span className="font-mono text-[11px] font-bold text-foreground">
                      {task.nomorNotaDinas}
                    </span>
                    {task.nomorSpt && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        SPT {task.nomorSpt}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    {task.perihal}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5 text-primary" />
                      {formatDate(task.tanggalBerangkat)}–
                      {formatDate(task.tanggalKembali)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {task.lokasiTujuan}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {task.description}
                  </p>
                </div>

                {task.actionLabel && task.actionUrl && (
                  <Link
                    href={task.actionUrl}
                    className={cn(
                      buttonVariants({
                        variant: task.completed ? "outline" : "default",
                        size: "sm",
                      }),
                      "self-start",
                    )}
                  >
                    {task.actionLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
