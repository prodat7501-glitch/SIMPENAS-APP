import type { Spj } from "@/modules/keuangan/keuangan.schema";
import { laporanService } from "@/modules/laporan/laporan.service";
import {
  isUnmodifiedNotaDinasDemoSeed,
  notaDinasService,
} from "@/modules/nota-dinas/nota-dinas.service";
import {
  isUnmodifiedSppdDemoSeed,
  sppdService,
} from "@/modules/sppd/sppd.service";
import {
  isUnmodifiedSptDemoSeed,
  sptService,
} from "@/modules/spt/spt.service";

const MIGRATION_KEY = "simpenas_real_dashboard_migration_v1";
const FINANCE_STORAGE_KEY = "simpenas_keuangan";

export interface DashboardMigrationResult {
  removedNotaDinas: number;
  removedSpt: number;
  removedSppd: number;
}

const emptyResult = (): DashboardMigrationResult => ({
  removedNotaDinas: 0,
  removedSpt: 0,
  removedSppd: 0,
});

const getStoredSpj = (): Spj[] => {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(
      localStorage.getItem(FINANCE_STORAGE_KEY) ?? "[]",
    ) as Spj[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const dashboardDataMigrationService = {
  migrate: async (): Promise<DashboardMigrationResult> => {
    if (typeof window === "undefined") return emptyResult();
    if (localStorage.getItem(MIGRATION_KEY)) return emptyResult();

    const notas = notaDinasService.getAll();
    const spts = sptService.getAll();
    const sppds = sppdService.getAllSync();
    const reports = await laporanService.list();
    const spjs = getStoredSpj();
    const financialDocuments = spjs.flatMap((spj) => spj.dokumen ?? []);

    const removableSppdIds = new Set(
      sppds
        .filter(isUnmodifiedSppdDemoSeed)
        .filter(
          (sppd) =>
            !reports.some((report) => report.sppdId === sppd.id) &&
            !spjs.some((spj) => spj.sppdId === sppd.id) &&
            !financialDocuments.some(
              (document) => document.sppdId === sppd.id,
            ),
        )
        .map((sppd) => sppd.id)
        .filter((id): id is string => Boolean(id)),
    );
    const retainedSppds = sppds.filter(
      (sppd) => !sppd.id || !removableSppdIds.has(sppd.id),
    );

    const removableSptIds = new Set(
      spts
        .filter(isUnmodifiedSptDemoSeed)
        .filter(
          (spt) =>
            !retainedSppds.some((sppd) => sppd.sptId === spt.id) &&
            !reports.some((report) => report.sptId === spt.id) &&
            !financialDocuments.some((document) => document.sptId === spt.id),
        )
        .map((spt) => spt.id)
        .filter((id): id is string => Boolean(id)),
    );
    const retainedSpts = spts.filter(
      (spt) => !spt.id || !removableSptIds.has(spt.id),
    );

    const removableNotaIds = new Set(
      notas
        .filter(isUnmodifiedNotaDinasDemoSeed)
        .filter(
          (nota) =>
            !retainedSpts.some((spt) => spt.notaDinasId === nota.id) &&
            !financialDocuments.some(
              (document) => document.notaDinasId === nota.id,
            ),
        )
        .map((nota) => nota.id)
        .filter((id): id is string => Boolean(id)),
    );
    const retainedNotas = notas.filter(
      (nota) => !nota.id || !removableNotaIds.has(nota.id),
    );

    if (removableSppdIds.size > 0) sppdService.saveAll(retainedSppds);
    if (removableSptIds.size > 0) sptService.saveAll(retainedSpts);
    if (removableNotaIds.size > 0) notaDinasService.saveAll(retainedNotas);

    const result: DashboardMigrationResult = {
      removedNotaDinas: removableNotaIds.size,
      removedSpt: removableSptIds.size,
      removedSppd: removableSppdIds.size,
    };

    localStorage.setItem(
      MIGRATION_KEY,
      JSON.stringify({ migratedAt: new Date().toISOString(), ...result }),
    );
    return result;
  },
};

