import { Pegawai } from "./pegawai.schema";

const STORAGE_KEY = "simpenas_pegawai";
const DEFAULT_KATEGORI_PEGAWAI = "ASN/Sekretariat";
const DEFAULT_ROLE_APLIKASI = "Pegawai";

const normalizePegawai = (item: Pegawai): Pegawai => ({
  ...item,
  kategoriPegawai: item.kategoriPegawai ?? DEFAULT_KATEGORI_PEGAWAI,
  nip: item.nip ?? "",
  pangkatId: item.pangkatId ?? "",
  roleAplikasi: item.roleAplikasi ?? DEFAULT_ROLE_APLIKASI,
  status: item.status ?? "Aktif",
});

const defaultPegawai: Pegawai[] = [
  {
    id: "pg1",
    kategoriPegawai: "ASN/Sekretariat",
    nip: "19900815 201801 1 002",
    nama: "Eriyanto",
    jabatanId: "j4",
    unitKerjaId: "u4",
    pangkatId: "p6",
    roleAplikasi: "Pegawai",
    status: "Aktif",
  },
  {
    id: "pg2",
    kategoriPegawai: "ASN/Sekretariat",
    nip: "19850212 201201 1 001",
    nama: "Andi Saputra",
    jabatanId: "j3",
    unitKerjaId: "u4",
    pangkatId: "p4",
    roleAplikasi: "Supervisor",
    status: "Aktif",
  },
  {
    id: "pg3",
    kategoriPegawai: "ASN/Sekretariat",
    nip: "19750824 200212 1 002",
    nama: "Herman Monoarfa, M.Si",
    jabatanId: "j1",
    unitKerjaId: "u1",
    pangkatId: "p1",
    roleAplikasi: "Supervisor",
    status: "Aktif",
  },
];

export const pegawaiService = {
  getAll: (): Pegawai[] => {
    if (typeof window === "undefined") return defaultPegawai;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPegawai));
      return defaultPegawai;
    }
    const parsed = JSON.parse(stored) as Pegawai[];
    const normalized = parsed.map(normalizePegawai);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
  },
  saveAll: (data: Pegawai[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },
};
