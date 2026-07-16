"use client";
import { useCallback, useState } from "react";
import type { NumberingConfig } from "./penomoran.schema";
import { penomoranService } from "./penomoran.service";
export function usePenomoran() {
  const initial = () => { try { return { configs: penomoranService.list(), error: "" }; } catch { return { configs: [] as NumberingConfig[], error: "Pengaturan penomoran gagal dimuat." }; } };
  const [state, setState] = useState(initial);
  const refresh = useCallback(() => { try { setState({ configs: penomoranService.list(), error: "" }); } catch { setState({ configs: [], error: "Pengaturan penomoran gagal dimuat." }); } }, []);
  const save = (value: NumberingConfig) => { penomoranService.update(value); refresh(); };
  return { configs: state.configs, history: penomoranService.history(), loading: false, error: state.error, save, refresh };
}
