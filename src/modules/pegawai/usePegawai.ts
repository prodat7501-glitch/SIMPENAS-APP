import { useEffect, useMemo } from "react";
import { useActivityStore } from "@/stores/activity.store";
import { useJabatanStore } from "@/modules/jabatan/jabatan.store";
import { usePangkatStore } from "@/modules/pangkat/pangkat.store";
import { usePegawaiStore } from "./pegawai.store";
import { sortPegawais } from "./pegawai-order";

export function usePegawai() {
  const items = usePegawaiStore((state) => state.items);
  const load = usePegawaiStore((state) => state.load);
  const add = usePegawaiStore((state) => state.add);
  const update = usePegawaiStore((state) => state.update);
  const remove = usePegawaiStore((state) => state.remove);
  const toggleStatus = usePegawaiStore((state) => state.toggleStatus);
  const jabatans = useJabatanStore((state) => state.items);
  const loadJabatans = useJabatanStore((state) => state.load);
  const pangkats = usePangkatStore((state) => state.items);
  const loadPangkats = usePangkatStore((state) => state.load);
  const log = useActivityStore((state) => state.add);

  useEffect(() => {
    load();
    loadJabatans();
    loadPangkats();
  }, [load, loadJabatans, loadPangkats]);

  const orderedItems = useMemo(
    () => sortPegawais(items, jabatans, pangkats),
    [items, jabatans, pangkats],
  );

  return {
    items: orderedItems,
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
