"use client";
import { useCallback, useState } from "react";
import type { NumberingConfig } from "./penomoran.schema";
import { penomoranService } from "./penomoran.service";
import { notaDinasService } from "@/modules/nota-dinas/nota-dinas.service";
import { keuanganService } from "@/modules/keuangan/keuangan.service";
import type { JenisDokumen } from "@/modules/keuangan/keuangan.schema";

const financialDocumentTypes = new Set<JenisDokumen>([
  "SPBY",
  "Daftar Nominatif",
  "Tanda Terima",
  "Kuitansi",
]);

export function usePenomoran() {
  const initial = () => {
    try {
      return { configs: penomoranService.list(), error: "" };
    } catch {
      return {
        configs: [] as NumberingConfig[],
        error: "Pengaturan penomoran gagal dimuat.",
      };
    }
  };
  const [state, setState] = useState(initial);
  const refresh = useCallback(() => {
    try {
      setState({ configs: penomoranService.list(), error: "" });
    } catch {
      setState({ configs: [], error: "Pengaturan penomoran gagal dimuat." });
    }
  }, []);
  const getPersistedNumbers = useCallback((value: NumberingConfig) => {
    if (value.documentType === "Nota Dinas") {
      return notaDinasService.getAll().map((item) => item.nomor);
    }
    if (financialDocumentTypes.has(value.documentType as JenisDokumen)) {
      return keuanganService.getDocumentNumbers(
        value.documentType as JenisDokumen,
        new Date().getFullYear(),
      );
    }
    return undefined;
  }, []);
  const previewNext = useCallback(
    (value: NumberingConfig) =>
      penomoranService.preview(value, new Date(), getPersistedNumbers(value)),
    [getPersistedNumbers],
  );
  const save = (value: NumberingConfig) => {
    const persistedNumbers = getPersistedNumbers(value);
    const reconciled = persistedNumbers
      ? penomoranService.reconcileUsedNumbers(
          value.documentType,
          persistedNumbers,
          "Riwayat Terpakai dibatalkan saat Administrator menetapkan Nomor Berikutnya.",
        )
      : [];
    const config = penomoranService.update(value);
    refresh();
    return { config, reconciledCount: reconciled.length };
  };
  return {
    configs: state.configs,
    history: penomoranService.history(),
    loading: false,
    error: state.error,
    save,
    refresh,
    previewNext,
  };
}
