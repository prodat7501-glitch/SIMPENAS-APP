import { create } from "zustand";
import { persist } from "zustand/middleware";
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
  update: (value: TemplateConfig) => void;
}
export const useTemplateStore = create<State>()(
  persist(
    (set) => ({
      config: {
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
      },
      update: (config) => set({ config }),
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
