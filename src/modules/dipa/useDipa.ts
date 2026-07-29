import { useEffect } from "react";
import { useActivityStore } from "@/stores/activity.store";
import { keuanganService } from "@/modules/keuangan/keuangan.service";
import { useDipaStore } from "./dipa.store";

export function useDipa() {
  const items = useDipaStore((state) => state.items);
  const load = useDipaStore((state) => state.load);
  const add = useDipaStore((state) => state.add);
  const update = useDipaStore((state) => state.update);
  const remove = useDipaStore((state) => state.remove);
  const log = useActivityStore((state) => state.add);

  useEffect(() => {
    load();
  }, [load]);

  const realization = keuanganService.getCompletedPaymentTotalsByDipa();
  const derivedItems = items.map((item) => ({
    ...item,
    realisasi:
      (realization.byId[item.id] ?? 0) +
      (realization.byLegacyAccount[`${item.tahunAnggaran}::${item.kodeDipa}`] ??
        0),
  }));

  return {
    items: derivedItems,
    add: (...args: Parameters<typeof add>) => {
      const result = add(...args);
      log({
        action: "Create",
        module: "Master Data",
        description: "Menambah data DIPA",
        user: "Pengguna aktif",
      });
      return result;
    },
    update: (...args: Parameters<typeof update>) => {
      const result = update(...args);
      log({
        action: "Update",
        module: "Master Data",
        description: "Memperbarui data DIPA",
        user: "Pengguna aktif",
      });
      return result;
    },
    remove: (...args: Parameters<typeof remove>) => {
      const result = remove(...args);
      log({
        action: "Delete",
        module: "Master Data",
        description: "Menghapus data DIPA",
        user: "Pengguna aktif",
      });
      return result;
    },
  };
}
