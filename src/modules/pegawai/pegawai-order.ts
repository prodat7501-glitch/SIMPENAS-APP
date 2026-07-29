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
  if (Number.isInteger(numericLevel) && numericLevel >= 1 && numericLevel <= 11) {
    return "PPPK";
  }

  return "Lainnya";
};

const getKategoriGolonganOrder = (golongan: string) => {
  const kategori = getKategoriGolongan(golongan);
  if (kategori === "PNS") return 0;
  if (kategori === "PPPK") return 1;
  return 2;
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
  if (
    jabatan.includes("sekretaris") ||
    jabatan.includes("kepala sekretariat")
  )
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

export const sortPegawais = (
  pegawais: Pegawai[],
  jabatans: Jabatan[],
  pangkats: Pangkat[],
) => {
  const pangkatById = new Map(pangkats.map((item) => [item.id, item]));

  return [...pegawais].sort((left, right) => {
    const leftStructure = getPegawaiStructureOrder(left, jabatans);
    const rightStructure = getPegawaiStructureOrder(right, jabatans);
    const structureDifference = leftStructure - rightStructure;
    if (structureDifference !== 0) return structureDifference;

    const leftGolonganValue =
      pangkatById.get(left.pangkatId)?.golongan ?? "";
    const rightGolonganValue =
      pangkatById.get(right.pangkatId)?.golongan ?? "";

    if (leftStructure === 4) {
      const kategoriDifference =
        getKategoriGolonganOrder(leftGolonganValue) -
        getKategoriGolonganOrder(rightGolonganValue);
      if (kategoriDifference !== 0) return kategoriDifference;
    }

    const leftGolongan = getGolonganOrder(leftGolonganValue);
    const rightGolongan = getGolonganOrder(rightGolonganValue);
    if (leftGolongan !== rightGolongan) return rightGolongan - leftGolongan;

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
