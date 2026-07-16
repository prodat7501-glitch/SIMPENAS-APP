import { Jabatan } from "./jabatan.schema";

const STORAGE_KEY = "simpenas_jabatan";

const defaultJabatan: Jabatan[] = [
  { id: "j1", kode: "JAB001", nama: "Kepala Sekretariat" },
  { id: "j2", kode: "JAB002", nama: "Kasubag Keuangan" },
  { id: "j3", kode: "JAB003", nama: "Kasubag Umum & Logistik" },
  { id: "j4", kode: "JAB004", nama: "Staf Pelaksana" },
];

export const jabatanService = {
  getAll: (): Jabatan[] => {
    if (typeof window === "undefined") return defaultJabatan;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultJabatan));
      return defaultJabatan;
    }
    return JSON.parse(stored);
  },
  saveAll: (data: Jabatan[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },
};
