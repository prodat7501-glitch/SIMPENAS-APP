import { useEffect } from "react";
import { useActivityStore } from "@/stores/activity.store";
import { useJabatanStore } from "./jabatan.store";

export function useJabatan() {
  const items = useJabatanStore((state) => state.items);
  const load = useJabatanStore((state) => state.load);
  const add = useJabatanStore((state) => state.add);
  const update = useJabatanStore((state) => state.update);
  const remove = useJabatanStore((state) => state.remove);
  const log = useActivityStore((state) => state.add);

  useEffect(() => {
    load();
  }, [load]);

  return {
    items,
    add: async (...args: Parameters<typeof add>) => {
      const result = await add(...args);
      log({
        action: "Create",
        module: "Master Data",
        description: "Menambah data jabatan",
        user: "Pengguna aktif",
      });
      return result;
    },
    update: async (...args: Parameters<typeof update>) => {
      const result = await update(...args);
      log({
        action: "Update",
        module: "Master Data",
        description: "Memperbarui data jabatan",
        user: "Pengguna aktif",
      });
      return result;
    },
    remove: async (...args: Parameters<typeof remove>) => {
      const result = await remove(...args);
      log({
        action: "Delete",
        module: "Master Data",
        description: "Menghapus data jabatan",
        user: "Pengguna aktif",
      });
      return result;
    },
  };
}
