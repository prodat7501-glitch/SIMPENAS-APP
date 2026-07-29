import { Activity } from "lucide-react";
import type { ActivityItem } from "@/stores/activity.store";

const formatActivityTime = (dateValue: string) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Waktu tidak tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export function DashboardActivity({ items }: { items: ActivityItem[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold">
        <Activity className="h-5 w-5 text-primary" /> Aktivitas Terbaru
      </h2>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-xs text-muted-foreground">
          Belum ada aktivitas aktual untuk akun ini.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article key={item.id} className="flex gap-3 text-xs">
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground">
                  {item.action} · {item.module}
                </p>
                <p className="mt-0.5 text-muted-foreground">
                  {item.description}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {item.user} · {formatActivityTime(item.createdAt)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

