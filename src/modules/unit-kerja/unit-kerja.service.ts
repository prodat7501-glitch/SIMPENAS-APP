import { UnitKerja } from "./unit-kerja.schema";

const STORAGE_KEY = "simpenas_unit_kerja";

const defaultUnitKerja: UnitKerja[] = [
  { id: "u1", kode: "UN001", nama: "Sekretariat KPU" },
  { id: "u2", kode: "UN002", nama: "Sub Bagian Teknis Penyelenggaraan" },
  { id: "u3", kode: "UN003", nama: "Sub Bagian Perencanaan, Data & Informasi" },
  { id: "u4", kode: "UN004", nama: "Sub Bagian Keuangan, Umum & Logistik" },
  { id: "u5", kode: "UN005", nama: "Sub Bagian Hukum & SDM" },
];

export const unitKerjaService = {
  getAll: (): UnitKerja[] => {
    if (typeof window === "undefined") return defaultUnitKerja;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUnitKerja));
      return defaultUnitKerja;
    }
    return JSON.parse(stored);
  },
  saveAll: (data: UnitKerja[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },
};
