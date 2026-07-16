import { useEffect } from "react";
import { useActivityStore } from "@/stores/activity.store";
import { useSbmStore } from "./sbm.store";

export function useSbm() {
  const items = useSbmStore((state) => state.items);
  const load = useSbmStore((state) => state.load);
  const add = useSbmStore((state) => state.add);
  const update = useSbmStore((state) => state.update);
  const remove = useSbmStore((state) => state.remove);
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
        description: "Menambah standar biaya masukan",
        user: "Pengguna aktif",
      });
      return result;
    },
    update: (...args: Parameters<typeof update>) => {
      const result = update(...args);
      log({
        action: "Update",
        module: "Master Data",
        description: "Memperbarui standar biaya masukan",
        user: "Pengguna aktif",
      });
      return result;
    },
    remove: (...args: Parameters<typeof remove>) => {
      const result = remove(...args);
      log({
        action: "Delete",
        module: "Master Data",
        description: "Menghapus standar biaya masukan",
        user: "Pengguna aktif",
      });
      return result;
    },
  };
}
