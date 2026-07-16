import { useEffect } from "react";
import { useActivityStore } from "@/stores/activity.store";
import { usePegawaiStore } from "./pegawai.store";

export function usePegawai() {
  const items = usePegawaiStore((state) => state.items);
  const load = usePegawaiStore((state) => state.load);
  const add = usePegawaiStore((state) => state.add);
  const update = usePegawaiStore((state) => state.update);
  const remove = usePegawaiStore((state) => state.remove);
  const toggleStatus = usePegawaiStore((state) => state.toggleStatus);
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
        description: "Menambah data pegawai",
        user: "Pengguna aktif",
      });
      return result;
    },
    update: (...args: Parameters<typeof update>) => {
      const result = update(...args);
      log({
        action: "Update",
        module: "Master Data",
        description: "Memperbarui data pegawai",
        user: "Pengguna aktif",
      });
      return result;
    },
    remove: (...args: Parameters<typeof remove>) => {
      const result = remove(...args);
      log({
        action: "Delete",
        module: "Master Data",
        description: "Menghapus data pegawai",
        user: "Pengguna aktif",
      });
      return result;
    },
    toggleStatus: (...args: Parameters<typeof toggleStatus>) => {
      const result = toggleStatus(...args);
      log({
        action: "Update",
        module: "Master Data",
        description: "Mengubah status pegawai",
        user: "Pengguna aktif",
      });
      return result;
    },
  };
}
