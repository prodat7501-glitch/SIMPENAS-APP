import type { Laporan } from "./laporan.schema";

export type LaporanStatus = Laporan["status"];
export type LaporanPayload = Omit<Laporan, "id">;
export interface LaporanFilters {
  search: string;
  status: LaporanStatus | "Semua";
}
