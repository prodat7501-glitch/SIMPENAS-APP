import { SBM } from "./sbm.schema";

const STORAGE_KEY = "simpenas_sbm";

const defaultSbm: SBM[] = [
  {
    id: "s1",
    wilayah: "Gorontalo",
    jenisBiaya: "Uang Harian Dalam Kota",
    satuan: "OH",
    tarif: 150000,
  },
  {
    id: "s2",
    wilayah: "Gorontalo",
    jenisBiaya: "Uang Harian Luar Kota",
    satuan: "OH",
    tarif: 370000,
  },
  {
    id: "s3",
    wilayah: "Gorontalo",
    jenisBiaya: "Uang Harian Luar Daerah (DKI Jakarta)",
    satuan: "OH",
    tarif: 530000,
  },
  {
    id: "s4",
    wilayah: "DKI Jakarta",
    jenisBiaya: "Akomodasi Hotel Bintang 4",
    satuan: "Malam",
    tarif: 1200000,
  },
  {
    id: "s5",
    wilayah: "Gorontalo",
    jenisBiaya: "Transport Bandara Jalur Darat",
    satuan: "Kali",
    tarif: 250000,
  },
];

export const sbmService = {
  getAll: (): SBM[] => {
    if (typeof window === "undefined") return defaultSbm;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSbm));
      return defaultSbm;
    }
    return JSON.parse(stored);
  },
  saveAll: (data: SBM[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },
};
