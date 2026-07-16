import { useEffect } from "react";
import { useActivityStore } from "@/stores/activity.store";
import { usePangkatStore } from "./pangkat.store";

export function usePangkat() {
  const items = usePangkatStore((state) => state.items);
  const load = usePangkatStore((state) => state.load);
  const add = usePangkatStore((state) => state.add);
  const update = usePangkatStore((state) => state.update);
  const remove = usePangkatStore((state) => state.remove);
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
        description: "Menambah data pangkat/golongan",
        user: "Pengguna aktif",
      });
      return result;
    },
    update: (...args: Parameters<typeof update>) => {
      const result = update(...args);
      log({
        action: "Update",
        module: "Master Data",
        description: "Memperbarui data pangkat/golongan",
        user: "Pengguna aktif",
      });
      return result;
    },
    remove: (...args: Parameters<typeof remove>) => {
      const result = remove(...args);
      log({
        action: "Delete",
        module: "Master Data",
        description: "Menghapus data pangkat/golongan",
        user: "Pengguna aktif",
      });
      return result;
    },
  };
}
