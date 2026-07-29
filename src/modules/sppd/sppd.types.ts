import type { Sppd } from "./sppd.schema";

export type SppdStatus = Sppd["status"];

export interface SppdListFilters {
  search: string;
  status: SppdStatus | "Semua";
}

export type SppdMutationPayload = Omit<Sppd, "id" | "status">;
