import { DIPA } from "./dipa.schema";

const STORAGE_KEY = "simpenas_dipa";

const defaultDipa: DIPA[] = [
  {
    id: "d1",
    kodeDipa: "015.01.2.654321",
    program: "Dukungan Manajemen Pelaksanaan Pemilu Gorontalo",
    pagu: 1500000000,
    realisasi: 420000000,
    tahunAnggaran: "2026",
  },
  {
    id: "d2",
    kodeDipa: "015.01.2.654322",
    program: "Penyelenggaraan Pemilu Serentak Kabupaten",
    pagu: 850000000,
    realisasi: 310000000,
    tahunAnggaran: "2026",
  },
  {
    id: "d3",
    kodeDipa: "015.01.2.654323",
    program: "Pengawasan Internal & Penegakan Hukum Pemilu",
    pagu: 450000000,
    realisasi: 98000000,
    tahunAnggaran: "2026",
  },
];

export const dipaService = {
  getAll: (): DIPA[] => {
    if (typeof window === "undefined") return defaultDipa;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDipa));
      return defaultDipa;
    }
    return JSON.parse(stored);
  },
  saveAll: (data: DIPA[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },
};
