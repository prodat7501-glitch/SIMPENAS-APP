import { Spt } from "./spt.schema";
import { notaDinasService } from "@/modules/nota-dinas/nota-dinas.service";
import { pegawaiService } from "@/modules/pegawai/pegawai.service";
import { penandatanganService } from "@/modules/penandatangan/penandatangan.service";
import { penomoranService } from "@/modules/pengaturan/penomoran.service";

const STORAGE_KEY = "simpenas_spt";

const normalizeText = (value: string) => value.toLowerCase();
const isKomisionerPegawai = (pegawaiId: string) => {
  const pegawai = pegawaiService.getAll().find((item) => item.id === pegawaiId);
  return (
    pegawai?.kategoriPegawai === "Ketua KPU" ||
    pegawai?.kategoriPegawai === "Anggota KPU"
  );
};
const getSignerText = (penandatanganId: string) => {
  const signer = penandatanganService
    .getAll()
    .find((item) => item.id === penandatanganId);
  return signer
    ? normalizeText(`${signer.jabatanPenandatangan} ${signer.peran}`)
    : "";
};
const normalizeSeparatedSptPersonil = (item: Spt): Spt => {
  const signerText = getSignerText(item.penandatanganId);
  const isKetuaKpuSpt = signerText.includes("ketua kpu");
  const filteredPersonil = item.personil.filter((person) =>
    isKetuaKpuSpt
      ? isKomisionerPegawai(person.pegawaiId)
      : !isKomisionerPegawai(person.pegawaiId),
  );
  return filteredPersonil.length > 0
    ? { ...item, personil: filteredPersonil }
    : item;
};

const defaultSpts: Spt[] = [
  {
    id: "st1",
    notaDinasId: "nd1",
    nomor: "001/ST.KPU-Kab.Gorontalo/VII/2026",
    tanggalMulai: "2026-07-12",
    tanggalSelesai: "2026-07-14",
    penandatanganId: "pe1",
    status: "Selesai",
    menimbang: [
      {
        text: "Bahwa untuk tertib administrasi dan kelancaran pelaksanaan Rapat Koordinasi Evaluasi Pemilu, dipandang perlu menugaskan personil yang berkompeten.",
      },
    ],
    dasar: [
      { text: "Undang-Undang Nomor 7 Tahun 2017 tentang Pemilihan Umum." },
      {
        text: "Peraturan Komisi Pemilihan Umum Nomor 8 Tahun 2019 tentang Tata Kerja Komisi Pemilihan Umum.",
      },
      {
        text: "DIPA Komisi Pemilihan Umum Kabupaten Gorontalo Tahun Anggaran 2026.",
      },
    ],
    untuk: [
      {
        text: "Melaksanakan perjalanan dinas dalam rangka mengikuti Rapat Koordinasi Evaluasi Pemilu Serentak di KPU Provinsi Gorontalo pada tanggal 12 s.d 14 Juli 2026.",
      },
    ],
    personil: [{ pegawaiId: "pg1" }],
  },
];

export const sptService = {
  getAll: (): Spt[] => {
    if (typeof window === "undefined") return defaultSpts;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSpts));
      return defaultSpts;
    }
    const storedItems = JSON.parse(stored) as Array<
      Spt & { notaDinasId?: string }
    >;
    const notas = notaDinasService.getAll();
    const synchronized = storedItems.map((item) => {
      if (item.notaDinasId) return normalizeSeparatedSptPersonil(item as Spt);
      const nota = notas.find((candidate) => {
        const ids = new Set(candidate.lampiran.map((row) => row.pegawaiId));
        return item.personil.every((person) => ids.has(person.pegawaiId));
      });
      if (!nota?.id) return item as Spt;
      return normalizeSeparatedSptPersonil({
        ...item,
        notaDinasId: nota.id,
      } as Spt);
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(synchronized));
    return synchronized;
  },
  saveAll: (data: Spt[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },
  generateNomor: (dateStr: string): string => {
    return penomoranService.requestNumber("SPT", dateStr, sptService.getAll().length);
  },
};
