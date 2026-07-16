import { Pangkat } from "./pangkat.schema";

const STORAGE_KEY = "simpenas_pangkat";

const defaultPangkat: Pangkat[] = [
  { id: "p1", golongan: "IV/b", namaPangkat: "Pembina Tingkat I" },
  { id: "p2", golongan: "IV/a", namaPangkat: "Pembina" },
  { id: "p3", golongan: "III/d", namaPangkat: "Penata Tingkat I" },
  { id: "p4", golongan: "III/c", namaPangkat: "Penata" },
  { id: "p5", golongan: "III/b", namaPangkat: "Penata Muda Tingkat I" },
  { id: "p6", golongan: "III/a", namaPangkat: "Penata Muda" },
];

export const pangkatService = {
  getAll: (): Pangkat[] => {
    if (typeof window === "undefined") return defaultPangkat;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPangkat));
      return defaultPangkat;
    }
    return JSON.parse(stored);
  },
  saveAll: (data: Pangkat[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },
};
