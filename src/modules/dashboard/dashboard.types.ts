import type { ActivityItem } from "@/stores/activity.store";
import type { TravelTask } from "@/modules/tugas-perjalanan/travel-task.types";

export type DashboardMetricTone = "primary" | "accent" | "success" | "warning";

export type DashboardMetricKey =
  | "pegawai"
  | "perjalanan"
  | "anggaran"
  | "pembayaran"
  | "approval"
  | "aktif"
  | "hari"
  | "status"
  | "laporan"
  | "spj"
  | "spby";

export interface DashboardMetric {
  key: DashboardMetricKey;
  label: string;
  value: string;
  description: string;
  tone: DashboardMetricTone;
}

export interface DashboardChartPoint {
  name: string;
  primary: number;
  secondary?: number;
}

export interface DashboardChartData {
  title: string;
  description: string;
  type: "area" | "bar" | "line";
  primaryLabel: string;
  secondaryLabel?: string;
  points: DashboardChartPoint[];
}

export interface DashboardEmployeeSummary {
  pegawaiId: string;
  nama: string;
  nip: string;
  jumlahHariSppd: number;
  jumlahDibayarkan: number;
}

export interface DashboardQuickAction {
  key:
    | "pegawai"
    | "approval"
    | "nota"
    | "spt"
    | "laporan"
    | "spj"
    | "kuitansi"
    | "rekap"
    | "pengaturan";
  label: string;
  description: string;
  href: string;
}

export interface DashboardData {
  year: string;
  activeDipaCount: number;
  metrics: DashboardMetric[];
  chart: DashboardChartData;
  activities: ActivityItem[];
  quickActions: DashboardQuickAction[];
  travelTasks: TravelTask[];
  employeeSummaries: DashboardEmployeeSummary[];
  removedDemoRecords: number;
}
