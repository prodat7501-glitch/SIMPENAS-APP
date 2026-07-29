"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActivityStore } from "@/stores/activity.store";
import { SPPD_QUERY_KEY } from "@/modules/sppd/sppd.constants";
import { sppdService } from "@/modules/sppd/sppd.service";
import { arsipSpjService } from "./arsip-spj.service";
import type { UploadArsipSpjInput } from "./arsip-spj.types";

const ARSIP_SPJ_QUERY_KEY = ["arsip-spj"] as const;

export function useArsipSpj() {
  const queryClient = useQueryClient();
  const addActivity = useActivityStore((state) => state.add);
  const listQuery = useQuery({
    queryKey: ARSIP_SPJ_QUERY_KEY,
    queryFn: arsipSpjService.list,
  });

  const uploadMutation = useMutation({
    mutationFn: async (input: UploadArsipSpjInput) => {
      const archive = await arsipSpjService.upload(input);
      sppdService.markArchivedByNotaDinas(input.notaDinasId);
      return archive;
    },
    onSuccess: (archive) => {
      queryClient.invalidateQueries({ queryKey: ARSIP_SPJ_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: SPPD_QUERY_KEY });
      addActivity({
        action: "Update",
        module: "Arsip SPJ",
        description: `Mengunggah arsip fisik untuk Nota Dinas ${archive.notaDinasId}`,
        user: archive.diunggahOleh,
      });
    },
  });

  const download = async (notaDinasId: string) => {
    const record = await arsipSpjService.getFile(notaDinasId);
    const url = URL.createObjectURL(record.file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = record.namaFile;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    addActivity({
      action: "Export",
      module: "Arsip SPJ",
      description: `Mengunduh ${record.namaFile}`,
      user: record.diunggahOleh,
    });
  };

  return {
    items: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    isUploading: uploadMutation.isPending,
    upload: uploadMutation.mutateAsync,
    download,
  };
}
