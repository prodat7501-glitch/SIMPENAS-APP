import {
  CheckSquare,
  Clock,
  FileSpreadsheet,
  FileText,
  Map,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  DashboardMetric,
  DashboardMetricKey,
} from "../dashboard.types";

const iconByKey: Record<DashboardMetricKey, typeof Users> = {
  pegawai: Users,
  perjalanan: FileText,
  anggaran: Wallet,
  pembayaran: Wallet,
  approval: ShieldCheck,
  aktif: Map,
  hari: Clock,
  status: CheckSquare,
  laporan: FileSpreadsheet,
  spj: ShieldCheck,
  spby: FileSpreadsheet,
};

const toneClass = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
};

export function DashboardMetricCard({ metric }: { metric: DashboardMetric }) {
  const Icon = iconByKey[metric.key];

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {metric.label}
        </span>
        <div className={cn("rounded-xl p-2", toneClass[metric.tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="break-words text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        {metric.value}
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {metric.description}
      </p>
    </article>
  );
}

