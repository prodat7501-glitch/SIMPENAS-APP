import { Penandatangan } from "./penandatangan.schema";

const STORAGE_KEY = "simpenas_penandatangan";

const defaultPenandatangan: Penandatangan[] = [
  {
    id: "pe1",
    nip: "19750824 200212 1 002",
    nama: "Herman Monoarfa, M.Si",
    jabatanPenandatangan: "Kuasa Pengguna Anggaran (KPA)",
    peran: "KPA",
    status: "Aktif",
  },
  {
    id: "pe2",
    nip: "19800411 200801 1 003",
    nama: "Faisal Yusuf, S.E",
    jabatanPenandatangan: "Pejabat Pembuat Komitmen (PPK)",
    peran: "PPK",
    status: "Aktif",
  },
  {
    id: "pe3",
    nip: "19880215 201401 2 001",
    nama: "Sri Wahyuni, A.Md",
    jabatanPenandatangan: "Bendahara Pengeluaran KPU Kabupaten Gorontalo",
    peran: "Bendahara",
    status: "Aktif",
  },
  {
    id: "pe4",
    nip: "19790315 200501 1 001",
    nama: "Sekretaris KPU Kabupaten Gorontalo",
    jabatanPenandatangan: "Sekretaris KPU Kabupaten Gorontalo",
    peran: "Sekretaris KPU",
    status: "Aktif",
  },
  {
    id: "pe5",
    nip: "19700101 200001 1 001",
    nama: "Ketua KPU Kabupaten Gorontalo",
    jabatanPenandatangan: "Ketua KPU Kabupaten Gorontalo",
    peran: "Ketua KPU",
    status: "Aktif",
  },
  {
    id: "pe6",
    nip: "19850212 201201 1 001",
    nama: "Kepala Sub Bagian Keuangan, Umum dan Logistik",
    jabatanPenandatangan: "Kepala Sub Bagian Keuangan, Umum dan Logistik",
    peran: "Kepala Sub Bagian",
    status: "Aktif",
  },
];

const ensureRequiredSigners = (items: Penandatangan[]) => {
  const text = items
    .map((item) => `${item.jabatanPenandatangan} ${item.peran}`)
    .join(" ")
    .toLowerCase();
  const requiredDefaults = defaultPenandatangan.filter((item) => {
    const signerText = `${item.jabatanPenandatangan} ${item.peran}`.toLowerCase();
    if (signerText.includes("sekretaris")) return !text.includes("sekretaris");
    if (signerText.includes("ketua kpu")) return !text.includes("ketua kpu");
    if (
      signerText.includes("kasubbag") ||
      signerText.includes("kepala sub bagian") ||
      signerText.includes("kepala subbagian")
    ) {
      return (
        !text.includes("kasubbag") &&
        !text.includes("kepala sub bagian") &&
        !text.includes("kepala subbagian")
      );
    }
    return false;
  });
  return [...items, ...requiredDefaults];
};

export const penandatanganService = {
  getAll: (): Penandatangan[] => {
    if (typeof window === "undefined") return defaultPenandatangan;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPenandatangan));
      return defaultPenandatangan;
    }
    const merged = ensureRequiredSigners(JSON.parse(stored));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  },
  saveAll: (data: Penandatangan[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },
};
