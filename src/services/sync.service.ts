import { apiClient } from "./api";
import { notaDinasService } from "@/modules/nota-dinas/nota-dinas.service";
import { sptService } from "@/modules/spt/spt.service";
import { sppdService } from "@/modules/sppd/sppd.service";
import { laporanService } from "@/modules/laporan/laporan.service";
import { pegawaiService } from "@/modules/pegawai/pegawai.service";
import { dipaService } from "@/modules/dipa/dipa.service";
import { sbmService } from "@/modules/sbm/sbm.service";
import { userAccountService } from "@/modules/user-account/user-account.service";
import { penandatanganService } from "@/modules/penandatangan/penandatangan.service";
import { pangkatService } from "@/modules/pangkat/pangkat.service";
import { jabatanService } from "@/modules/jabatan/jabatan.service";
import { unitKerjaService } from "@/modules/unit-kerja/unit-kerja.service";
import { useActivityStore } from "@/stores/activity.store";

export interface SyncResult {
  success: boolean;
  totalSynced: number;
  details: { module: string; count: number }[];
  error?: string;
}

export const syncService = {
  checkHealth: async (): Promise<{
    online: boolean;
    latency: number;
    dbConnected: boolean;
    message: string;
    serverTime?: string;
  }> => {
    const start = performance.now();
    try {
      // Try /api/v1/health or fallback to /api/v1
      const res = await apiClient.get<{
        status?: string;
        success?: boolean;
        database?: string | boolean;
        timestamp?: string;
      }>("/api/v1/health");
      const latency = Math.round(performance.now() - start);
      return {
        online: true,
        latency,
        dbConnected:
          res.database === "connected" ||
          res.database === true ||
          res.success !== false,
        message: "Server Vercel & Database Terhubung",
        serverTime: res.timestamp || new Date().toISOString(),
      };
    } catch {
      try {
        // Fallback check to root API
        await apiClient.get("/api/v1");
        const latency = Math.round(performance.now() - start);
        return {
          online: true,
          latency,
          dbConnected: true,
          message: "Server Vercel Terhubung",
          serverTime: new Date().toISOString(),
        };
      } catch (err) {
        return {
          online: false,
          latency: 0,
          dbConnected: false,
          message:
            err instanceof Error
              ? err.message
              : "Tidak dapat terhubung ke server",
        };
      }
    }
  },

  syncAllLocalToServer: async (): Promise<SyncResult> => {
    const details: { module: string; count: number }[] = [];
    let totalSynced = 0;

    try {
      // 1. Pegawai
      const pegawais = pegawaiService.getAll();
      if (pegawais.length > 0) {
        await pegawaiService.apiBulkCreate(pegawais);
        details.push({ module: "Pegawai", count: pegawais.length });
        totalSynced += pegawais.length;
      }

      // 2. Unit Kerja
      const units = unitKerjaService.getAll();
      if (units.length > 0) {
        await unitKerjaService.apiBulkCreate(units);
        details.push({ module: "Unit Kerja", count: units.length });
        totalSynced += units.length;
      }

      // 3. Jabatan
      const jabatans = jabatanService.getAll();
      if (jabatans.length > 0) {
        await jabatanService.apiBulkCreate(jabatans);
        details.push({ module: "Jabatan", count: jabatans.length });
        totalSynced += jabatans.length;
      }

      // 4. Pangkat
      const pangkats = pangkatService.getAll();
      if (pangkats.length > 0) {
        await pangkatService.apiBulkCreate(pangkats);
        details.push({ module: "Pangkat", count: pangkats.length });
        totalSynced += pangkats.length;
      }

      // 5. DIPA
      const dipas = dipaService.getAll();
      if (dipas.length > 0) {
        await dipaService.apiBulkCreate(dipas);
        details.push({ module: "Anggaran DIPA", count: dipas.length });
        totalSynced += dipas.length;
      }

      // 6. SBM
      const sbms = sbmService.getAll();
      if (sbms.length > 0) {
        await sbmService.apiBulkCreate(sbms);
        details.push({ module: "SBM", count: sbms.length });
        totalSynced += sbms.length;
      }

      // 7. Akun Pengguna
      const akuns = userAccountService.getAll();
      if (akuns.length > 0) {
        await userAccountService.apiBulkCreate(akuns);
        details.push({ module: "Akun Pengguna", count: akuns.length });
        totalSynced += akuns.length;
      }

      // 8. Pejabat Penandatangan
      const penandatangans = penandatanganService.getAll();
      if (penandatangans.length > 0) {
        await penandatanganService.apiBulkCreate(penandatangans);
        details.push({ module: "Penandatangan", count: penandatangans.length });
        totalSynced += penandatangans.length;
      }

      // 9. Nota Dinas
      const notas = notaDinasService.getAll();
      if (notas.length > 0) {
        await notaDinasService.apiBulkCreate(notas);
        details.push({ module: "Nota Dinas", count: notas.length });
        totalSynced += notas.length;
      }

      // 10. SPT
      const spts = sptService.getAll();
      if (spts.length > 0) {
        await sptService.apiBulkCreate(spts);
        details.push({ module: "SPT", count: spts.length });
        totalSynced += spts.length;
      }

      // 11. SPPD
      const sppds = sppdService.getAllSync();
      if (sppds.length > 0) {
        await sppdService.apiBulkCreate(sppds);
        details.push({ module: "SPPD", count: sppds.length });
        totalSynced += sppds.length;
      }

      // 12. Laporan Perjalanan
      const laporan = await laporanService.list();
      if (laporan.length > 0) {
        await laporanService.apiBulkCreate(laporan);
        details.push({ module: "Laporan Perjalanan", count: laporan.length });
        totalSynced += laporan.length;
      }

      useActivityStore.getState().add({
        action: "Export",
        module: "Sinkronisasi",
        description: `Berhasil sinkronisasi ${totalSynced} data lokal ke server backend Vercel`,
        user: "System / User Sync",
      });

      return {
        success: true,
        totalSynced,
        details,
      };
    } catch (err) {
      return {
        success: false,
        totalSynced,
        details,
        error:
          err instanceof Error ? err.message : "Sinkronisasi sebagian gagal.",
      };
    }
  },
};
