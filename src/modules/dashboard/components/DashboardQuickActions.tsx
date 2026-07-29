import Link from "next/link";
import {
  CheckSquare,
  ClipboardList,
  FileText,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import type {
  DashboardQuickAction,
  DashboardQuickAction as DashboardQuickActionType,
} from "../dashboard.types";

const iconByKey: Record<DashboardQuickActionType["key"], typeof Users> = {
  pegawai: Users,
  approval: ShieldCheck,
  nota: FileText,
  spt: CheckSquare,
  laporan: ClipboardList,
  spj: ShieldCheck,
  kuitansi: Wallet,
  rekap: ClipboardList,
  pengaturan: Settings,
};

export function DashboardQuickActions({
  items,
}: {
  items: DashboardQuickAction[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-base font-bold">Aksi Cepat</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => {
          const Icon = iconByKey[item.key];
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-start gap-3 rounded-xl border border-border p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

