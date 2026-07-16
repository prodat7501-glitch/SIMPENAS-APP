import { useEffect } from "react";
import { useActivityStore } from "@/stores/activity.store";
import { useNotaDinasStore } from "./nota-dinas.store";

export function useNotaDinas() {
  const items = useNotaDinasStore((state) => state.items);
  const load = useNotaDinasStore((state) => state.load);
  const add = useNotaDinasStore((state) => state.add);
  const update = useNotaDinasStore((state) => state.update);
  const remove = useNotaDinasStore((state) => state.remove);
  const generateNomor = useNotaDinasStore((state) => state.generateNomor);
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
        module: "Nota Dinas",
        description: "Membuat Nota Dinas",
        user: "Pengguna aktif",
      });
      return result;
    },
    update: (...args: Parameters<typeof update>) => {
      const result = update(...args);
      log({
        action: "Update",
        module: "Nota Dinas",
        description: "Memperbarui Nota Dinas",
        user: "Pengguna aktif",
      });
      return result;
    },
    remove: (...args: Parameters<typeof remove>) => {
      const result = remove(...args);
      log({
        action: "Delete",
        module: "Nota Dinas",
        description: "Menghapus Nota Dinas",
        user: "Pengguna aktif",
      });
      return result;
    },
    generateNomor: (...args: Parameters<typeof generateNomor>) => {
      const result = generateNomor(...args);
      log({
        action: "Generate",
        module: "Nota Dinas",
        description: `Ambil nomor Nota Dinas ${result}`,
        user: "Pengguna aktif",
      });
      return result;
    },
  };
}
