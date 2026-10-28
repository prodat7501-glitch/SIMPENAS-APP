import type { Jabatan } from "@/modules/jabatan/jabatan.schema";
import type { Pangkat } from "@/modules/pangkat/pangkat.schema";
import type { Pegawai } from "./pegawai.schema";

const normalize = (value: string) => value.trim().toLocaleLowerCase("id-ID");
const PNS_GOLONGAN = new Set(["I", "II", "III", "IV"]);
const PPPK_GOLONGAN = new Set([
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
]);

export type KategoriGolongan = "PNS" | "PPPK" | "Lainnya";

const romanValue = (value: string) => {
  const scores: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
  };
  let total = 0;
  let previous = 0;

  for (const character of [...value].reverse()) {
    const score = scores[character] ?? 0;
    total += score < previous ? -score : score;
    previous = Math.max(previous, score);
  }

  return total;
};

export const getGolonganOrder = (golongan: string) => {
  const normalized = golongan.toUpperCase().replace(/\s/g, "");
  const romanMatch = normalized.match(/^([IVX]+)(?:[/.\-]?([A-Z]))?$/);
  if (romanMatch) {
    const suffix = romanMatch[2]
      ? romanMatch[2].charCodeAt(0) - "A".charCodeAt(0) + 1
      : 0;
    return romanValue(romanMatch[1]) * 100 + suffix;
  }

  const numericMatch = normalized.match(/^(\d+)(?:[/.\-]?([A-Z]))?$/);
  if (numericMatch) {
    const suffix = numericMatch[2]
      ? numericMatch[2].charCodeAt(0) - "A".charCodeAt(0) + 1
      : 0;
    return Number(numericMatch[1]) * 100 + suffix;
  }

  return 0;
};

export const getKategoriGolongan = (golongan: string): KategoriGolongan => {
  const normalized = golongan.toUpperCase().replace(/\s/g, "");
  const pnsMatch = normalized.match(/^([IVX]+)[/.\-]?([A-D])$/);
  if (pnsMatch && PNS_GOLONGAN.has(pnsMatch[1])) return "PNS";

  if (PPPK_GOLONGAN.has(normalized)) return "PPPK";
  const numericLevel = Number(normalized);
  if (
    Number.isInteger(numericLevel) &&
    numericLevel >= 1 &&
    numericLevel <= 11
  ) {
    return "PPPK";
  }

  return "Lainnya";
};

export const getKategoriGolonganOrder = (golongan: string) => {
  const kategori = getKategoriGolongan(golongan);
  if (kategori === "PNS") return 0;
  if (kategori === "PPPK") return 1;
  return 2;
};

export const isPegawaiKomisioner = (
  pegawai: Pegawai | undefined | null,
  jabatans?: Jabatan[] | { id: string; nama?: string }[],
): boolean => {
  if (!pegawai) return false;
  const kategori = normalize(pegawai.kategoriPegawai || "");
  const jabatanFromList = jabatans
    ? normalize(jabatans.find((item) => item.id === pegawai.jabatanId)?.nama ?? "")
    : "";
  const rawJabatan = normalize(
    ((pegawai as Record<string, unknown>).jabatan ||
      (pegawai as Record<string, unknown>).namaJabatan ||
      (pegawai as Record<string, unknown>).jabatanNama ||
      "").toString(),
  );

  return (
    kategori === "ketua kpu" ||
    kategori === "anggota kpu" ||
    kategori.includes("komisioner") ||
    kategori === "ketua" ||
    kategori === "anggota" ||
    jabatanFromList.includes("ketua kpu") ||
    jabatanFromList.includes("anggota kpu") ||
    jabatanFromList.includes("komisioner") ||
    jabatanFromList === "ketua" ||
    jabatanFromList === "anggota" ||
    rawJabatan.includes("ketua kpu") ||
    rawJabatan.includes("anggota kpu") ||
    rawJabatan.includes("komisioner") ||
    rawJabatan === "ketua" ||
    rawJabatan === "anggota"
  );
};

export const getPegawaiStructureOrder = (
  pegawai: Pegawai,
  jabatans: Jabatan[],
) => {
  const kategori = normalize(pegawai.kategoriPegawai);
  const jabatan = normalize(
    jabatans.find((item) => item.id === pegawai.jabatanId)?.nama ?? "",
  );

  if (kategori === "ketua kpu" || jabatan.includes("ketua kpu")) return 0;
  if (
    kategori === "anggota kpu" ||
    jabatan.includes("anggota kpu") ||
    jabatan.includes("komisioner")
  )
    return 1;
  if (jabatan.includes("sekretaris") || jabatan.includes("kepala sekretariat"))
    return 2;
  if (
    jabatan.includes("kasubag") ||
    jabatan.includes("kasubbag") ||
    jabatan.includes("kepala sub bagian") ||
    jabatan.includes("kepala subbagian")
  )
    return 3;
  return 4;
};

export const getPegawaiJabatanOrder = (
  pegawai: Pegawai,
  jabatans: Jabatan[],
): number => {
  if (!pegawai.jabatanId) {
    return getPegawaiStructureOrder(pegawai, jabatans) * 1000 + 999;
  }

  const index = jabatans.findIndex((item) => item.id === pegawai.jabatanId);
  if (index !== -1) {
    const jab = jabatans[index] as Jabatan & { urutan?: number };
    if (typeof jab.urutan === "number" && !isNaN(jab.urutan)) {
      return jab.urutan;
    }
    const match = jab.kode?.match(/\d+/);
    if (match) {
      return parseInt(match[0], 10);
    }
    return index + 1;
  }

  return getPegawaiStructureOrder(pegawai, jabatans) * 1000;
};

export const getPegawaiPangkatOrder = (
  pegawai: Pegawai,
  pangkats?: Pangkat[],
): number => {
  if (!pegawai.pangkatId) return 9999;
  if (pangkats && pangkats.length > 0) {
    const index = pangkats.findIndex((item) => item.id === pegawai.pangkatId);
    if (index !== -1) {
      return index;
    }
  }
  return 9999;
};

export const sortPegawais = (
  pegawais: Pegawai[],
  jabatans: Jabatan[],
  pangkats?: Pangkat[],
) => {
  return [...pegawais].sort((left, right) => {
    // 1. Urutkan berdasarkan urutan Jabatan di Master Jabatan / Struktural
    const leftJabatanOrder = getPegawaiJabatanOrder(left, jabatans);
    const rightJabatanOrder = getPegawaiJabatanOrder(right, jabatans);
    const jabatanDifference = leftJabatanOrder - rightJabatanOrder;
    if (jabatanDifference !== 0) return jabatanDifference;

    // 2. Jika jabatan sama, urutkan berdasarkan Pangkat (Pangkat tertinggi lebih dahulu)
    const leftPangkatOrder = getPegawaiPangkatOrder(left, pangkats);
    const rightPangkatOrder = getPegawaiPangkatOrder(right, pangkats);
    const pangkatDifference = leftPangkatOrder - rightPangkatOrder;
    if (pangkatDifference !== 0) return pangkatDifference;

    // 3. Jika jabatan dan pangkat sama, urutkan Nama pegawai sesuai Abjad (A-Z)
    return left.nama.localeCompare(right.nama, "id-ID", {
      sensitivity: "base",
    });
  });
};

export const sortByPegawaiOrder = <T>(
  items: T[],
  getPegawaiId: (item: T) => string,
  orderedPegawais: Pegawai[],
) => {
  const orderById = new Map(
    orderedPegawais.map((pegawai, index) => [pegawai.id, index]),
  );

  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => {
      const leftOrder = orderById.get(getPegawaiId(left.item));
      const rightOrder = orderById.get(getPegawaiId(right.item));
      const orderDifference =
        (leftOrder ?? Number.MAX_SAFE_INTEGER) -
        (rightOrder ?? Number.MAX_SAFE_INTEGER);
      return orderDifference || left.index - right.index;
    })
    .map(({ item }) => item);
};
