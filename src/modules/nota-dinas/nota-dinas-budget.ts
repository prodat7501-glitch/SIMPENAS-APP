import type { DIPA } from "@/modules/dipa/dipa.schema";
import type { NotaDinas } from "./nota-dinas.schema";

const BUDGET_COMMITMENT_STATUSES = new Set<NotaDinas["status"]>([
  "Menunggu Approval",
  "Disetujui",
  "Perlu Revisi",
  "Selesai",
]);

interface DipaBudgetAvailabilityInput {
  dipa: DIPA | undefined;
  notas: NotaDinas[];
  currentTotal: number;
  excludeNotaDinasId?: string;
}

export interface DipaBudgetAvailability {
  pagu: number;
  committed: number;
  available: number;
  currentTotal: number;
  projected: number;
  exceeded: boolean;
}

export const getDipaBudgetAvailability = ({
  dipa,
  notas,
  currentTotal,
  excludeNotaDinasId,
}: DipaBudgetAvailabilityInput): DipaBudgetAvailability => {
  const normalizedCurrentTotal = Math.max(0, Number(currentTotal) || 0);
  if (!dipa) {
    return {
      pagu: 0,
      committed: 0,
      available: 0,
      currentTotal: normalizedCurrentTotal,
      projected: normalizedCurrentTotal,
      exceeded: normalizedCurrentTotal > 0,
    };
  }

  const committed = notas
    .filter(
      (nota) =>
        nota.id !== excludeNotaDinasId &&
        nota.dipaId === dipa.id &&
        BUDGET_COMMITMENT_STATUSES.has(nota.status),
    )
    .reduce((total, nota) => total + nota.totalBiaya, 0);
  const available = dipa.pagu - committed;
  const projected = committed + normalizedCurrentTotal;

  return {
    pagu: dipa.pagu,
    committed,
    available,
    currentTotal: normalizedCurrentTotal,
    projected,
    exceeded: projected > dipa.pagu,
  };
};
