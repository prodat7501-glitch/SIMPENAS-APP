import { useEffect } from "react";
import { useActivityStore } from "@/stores/activity.store";
import { useSptStore } from "./spt.store";
import { sptService } from "./spt.service";

export function useSpt() {
  const items = useSptStore((state) => state.items);
  const load = useSptStore((state) => state.load);
  const add = useSptStore((state) => state.add);
  const update = useSptStore((state) => state.update);
  const remove = useSptStore((state) => state.remove);
  const generateNomor = useSptStore((state) => state.generateNomor);
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
        module: "SPT",
        description: "Membuat SPT",
        user: "Pengguna aktif",
      });
      return result;
    },
    update: (...args: Parameters<typeof update>) => {
      const result = update(...args);
      log({
        action: "Update",
        module: "SPT",
        description: "Memperbarui SPT",
        user: "Pengguna aktif",
      });
      return result;
    },
    remove: (...args: Parameters<typeof remove>) => {
      const result = remove(...args);
      log({
        action: "Delete",
        module: "SPT",
        description: "Menghapus SPT",
        user: "Pengguna aktif",
      });
      return result;
    },
    generateNomor: (...args: Parameters<typeof generateNomor>) => {
      const result = generateNomor(...args);
      log({
        action: "Generate",
        module: "SPT",
        description: `Ambil nomor SPT ${result}`,
        user: "Pengguna aktif",
      });
      return result;
    },
    releaseNomor: sptService.releaseNomor,
  };
}
