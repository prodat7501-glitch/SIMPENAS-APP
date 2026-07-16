import { NotaDinas } from "./nota-dinas.schema";
import { penomoranService } from "@/modules/pengaturan/penomoran.service";

const STORAGE_KEY = "simpenas_nota_dinas";

const defaultNotaDinas: NotaDinas[] = [
  {
    id: "nd1",
    kepada: "Ketua KPU Kabupaten Gorontalo",
    dari: "Kasubag Keuangan, Umum & Logistik",
    tembusan: "Sekretaris KPU Kabupaten Gorontalo",
    nomor: "001/ND-KPU/VII/2026",
    tanggal: "2026-07-10",
    sifat: "Penting",
    perihal: "Permohonan Perjalanan Dinas Rapat Koordinasi Evaluasi Pemilu",
    isi: "Sehubungan dengan pelaksanaan Rapat Koordinasi Evaluasi Pemilu Serentak 2026, bersama ini diajukan permohonan pelaksanaan perjalanan dinas bagi staf pelaksana sub bagian keuangan.",
    penandatanganId: "pe1",
    jenis: "Luar Kota",
    status: "Disetujui",
    totalBiaya: 1420000,
    lampiran: [
      {
        pegawaiId: "pg1",
        uraian: "Mengikuti rakor evaluasi di KPU Provinsi Gorontalo",
        uangHarian: 370000,
        uangTransport: 250000,
        penginapan: 450000,
        tiketPesawat: 0,
        transportBandaraAsal: 0,
        transportBandaraTujuan: 0,
        volume: 2,
        total: 1420000,
      },
    ],
  },
];

export const notaDinasService = {
  getAll: (): NotaDinas[] => {
    if (typeof window === "undefined") return defaultNotaDinas;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultNotaDinas));
      return defaultNotaDinas;
    }
    return JSON.parse(stored);
  },
  saveAll: (data: NotaDinas[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },
  generateNomor: (dateStr: string): string => {
    return penomoranService.requestNumber("Nota Dinas", dateStr, notaDinasService.getAll().length);
  },
};
