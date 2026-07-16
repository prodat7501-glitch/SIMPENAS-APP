import { useEffect } from "react";
import { useActivityStore } from "@/stores/activity.store";
import { useUnitKerjaStore } from "./unit-kerja.store";

export function useUnitKerja() {
  const items = useUnitKerjaStore((state) => state.items);
  const load = useUnitKerjaStore((state) => state.load);
  const add = useUnitKerjaStore((state) => state.add);
  const update = useUnitKerjaStore((state) => state.update);
  const remove = useUnitKerjaStore((state) => state.remove);
  const log = useActivityStore((state) => state.add);

  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    add: (...args: Parameters<typeof add>) => {
      const result = add(...args);
      log({
        action: "Create",
        module: "Master Data",
        description: "Menambah data unit kerja",
        user: "Pengguna aktif",
      });
      return result;
    },
    update: (...args: Parameters<typeof update>) => {
      const result = update(...args);
      log({
        action: "Update",
        module: "Master Data",
        description: "Memperbarui data unit kerja",
        user: "Pengguna aktif",
      });
      return result;
    },
    remove: (...args: Parameters<typeof remove>) => {
      const result = remove(...args);
      log({
        action: "Delete",
        module: "Master Data",
        description: "Menghapus data unit kerja",
        user: "Pengguna aktif",
      });
      return result;
    },
  };
}
