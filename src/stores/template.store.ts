import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient, withApiFallback } from "@/services/api";

export interface TemplateConfig {
  namaInstansi: string;
  alamat: string;
  footer: string;
  ukuranKertas: "A4" | "F4";
  margin: number;
  penandatanganId: string;
  logo: string;
  kopSurat: string;
  font: "Arial" | "Times New Roman" | "Inter";
  alignment: "left" | "center" | "right";
}

interface State {
  config: TemplateConfig;
  load: () => Promise<void>;
  update: (value: TemplateConfig) => Promise<void>;
}

const defaultConfig: TemplateConfig = {
  namaInstansi: "KOMISI PEMILIHAN UMUM KABUPATEN GORONTALO",
  alamat: "Jl. Katili Dulanimo Kelurahan Kayumerah Kecamatan Limboto",
  footer: "Dokumen resmi SIMPENAS KPU Kabupaten Gorontalo",
  ukuranKertas: "F4",
  margin: 20,
  penandatanganId: "",
  logo: "/images/logo-kpu.png",
  kopSurat: "KOMISI PEMILIHAN UMUM KABUPATEN GORONTALO",
  font: "Arial",
  alignment: "center",
};

export const useTemplateStore = create<State>()(
  persist(
    (set, get) => ({
      config: defaultConfig,
      load: async () => {
        const loaded = await withApiFallback(
          async () => {
            const res = await apiClient.get<TemplateConfig | { data?: TemplateConfig }>("/api/v1/pengaturan-template/tpl-default");
            const unwrapped = (res as { data?: TemplateConfig }).data || (res as TemplateConfig);
            return unwrapped || get().config;
          },
          () => get().config
        );
        set({ config: loaded });
      },
      update: async (config) => {
        set({ config });
        await withApiFallback(
          async () => {
            await apiClient.put("/api/v1/pengaturan-template/tpl-default", config);
            return config;
          },
          () => config
        );
      },
    }),
    {
      name: "simpenas-template-config",
      merge: (persisted, current) => {
        const saved = persisted as Partial<State>;
        return { ...current, ...saved, config: { ...current.config, ...saved.config } };
      },
    },
  ),
);
