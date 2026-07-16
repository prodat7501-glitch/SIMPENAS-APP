import type { Sppd } from "./sppd.schema";

export type SppdStatus = Sppd["status"];

export interface SppdListFilters {
  search: string;
  status: SppdStatus | "Semua";
}

export interface SppdNomorRequest {
  tanggalBerangkat: string;
}

export type SppdMutationPayload = Omit<Sppd, "id">;
