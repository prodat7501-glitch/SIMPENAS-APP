import { sppdService } from "@/modules/sppd/sppd.service";
import { sptService } from "@/modules/spt/spt.service";
import { useActivityStore } from "@/stores/activity.store";
import { penomoranService } from "./penomoran.service";

const getSequenceFromNumber = (nomor: string, fallback: number) => {
  const firstPart = nomor.split("/")[0]?.trim();
  const parsed = Number(firstPart);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const applyExistingNumberingService = {
  applySptAndSppd: () => {
    const spts = sptService.getAll();
    const sppds = sppdService.getAllSync();
    const oldToNew: Array<{
      documentType: "SPT" | "SPPD";
      id: string;
      oldNumber: string;
      newNumber: string;
    }> = [];

    const updatedSpts = spts.map((item, index) => {
      const sequence = getSequenceFromNumber(item.nomor, index + 1);
      const newNumber = penomoranService.formatNumber(
        "SPT",
        sequence,
        item.tanggalMulai,
      );
      if (item.nomor !== newNumber) {
        oldToNew.push({
          documentType: "SPT",
          id: item.id ?? "",
          oldNumber: item.nomor,
          newNumber,
        });
      }
      return { ...item, nomor: newNumber };
    });

    const usedSppdSequencesByYear = new Map<number, Set<number>>();
    const updatedSppds = sppds.map((item, index) => {
      const date = new Date(item.tanggalBerangkat);
      const year = Number.isNaN(date.getTime())
        ? new Date().getFullYear()
        : date.getFullYear();
      const usedSequences = usedSppdSequencesByYear.get(year) ?? new Set();
      let sequence = getSequenceFromNumber(item.nomor, index + 1);
      while (usedSequences.has(sequence)) sequence += 1;
      usedSequences.add(sequence);
      usedSppdSequencesByYear.set(year, usedSequences);
      const newNumber = penomoranService.formatNumber(
        "SPPD",
        sequence,
        item.tanggalBerangkat,
      );
      if (item.nomor !== newNumber) {
        oldToNew.push({
          documentType: "SPPD",
          id: item.id ?? "",
          oldNumber: item.nomor,
          newNumber,
        });
      }
      return { ...item, nomor: newNumber };
    });

    sptService.saveAll(updatedSpts);
    sppdService.saveAll(updatedSppds);
    useActivityStore.getState().add({
      action: "Update",
      module: "Pengaturan Penomoran",
      description: `Menerapkan ulang format nomor existing: ${oldToNew.length} dokumen terdampak`,
      user: "Administrator",
    });

    return oldToNew;
  },
};
