import { useEffect } from "react";
import { useActivityStore } from "@/stores/activity.store";
import { usePenandatanganStore } from "./penandatangan.store";

export function usePenandatangan() {
  const items = usePenandatanganStore((state) => state.items);
  const load = usePenandatanganStore((state) => state.load);
  const add = usePenandatanganStore((state) => state.add);
  const update = usePenandatanganStore((state) => state.update);
  const remove = usePenandatanganStore((state) => state.remove);
  const toggleStatus = usePenandatanganStore((state) => state.toggleStatus);
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
        description: "Menambah pejabat penandatangan",
        user: "Pengguna aktif",
      });
      return result;
    },
    update: (...args: Parameters<typeof update>) => {
      const result = update(...args);
      log({
        action: "Update",
        module: "Master Data",
        description: "Memperbarui pejabat penandatangan",
        user: "Pengguna aktif",
      });
      return result;
    },
    remove: (...args: Parameters<typeof remove>) => {
      const result = remove(...args);
      log({
        action: "Delete",
        module: "Master Data",
        description: "Menghapus pejabat penandatangan",
        user: "Pengguna aktif",
      });
      return result;
    },
    toggleStatus: (...args: Parameters<typeof toggleStatus>) => {
      const result = toggleStatus(...args);
      log({
        action: "Update",
        module: "Master Data",
        description: "Mengubah status pejabat penandatangan",
        user: "Pengguna aktif",
      });
      return result;
    },
  };
}
