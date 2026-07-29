import {
  createDipaRecord,
  dipaFormSchema,
  type DIPA,
  type DipaFormData,
} from "./dipa.schema";

const STORAGE_KEY = "simpenas_dipa";
const LEGACY_PLACEHOLDER = "Belum diisi";

const legacyDefaults = [
  {
    id: "d1",
    kodeDipa: "015.01.2.654321",
    program: "Dukungan Manajemen Pelaksanaan Pemilu Gorontalo",
    pagu: 1_500_000_000,
    realisasi: 420_000_000,
    tahunAnggaran: "2026",
  },
  {
    id: "d2",
    kodeDipa: "015.01.2.654322",
    program: "Penyelenggaraan Pemilu Serentak Kabupaten",
    pagu: 850_000_000,
    realisasi: 310_000_000,
    tahunAnggaran: "2026",
  },
  {
    id: "d3",
    kodeDipa: "015.01.2.654323",
    program: "Pengawasan Internal & Penegakan Hukum Pemilu",
    pagu: 450_000_000,
    realisasi: 98_000_000,
    tahunAnggaran: "2026",
  },
];

const readText = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const readFirstMeaningfulText = (
  item: Record<string, unknown>,
  keys: string[],
  fallback: string,
) => {
  for (const key of keys) {
    const value = readText(item[key], "");
    if (value && value !== "-" && value !== LEGACY_PLACEHOLDER) {
      return value;
    }
  }

  return fallback;
};

const readAmount = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;

const normalizeDipa = (value: unknown, index: number): DIPA => {
  const item =
    typeof value === "object" && value !== null
      ? (value as Record<string, unknown>)
      : {};
  const currentYear = new Date().getFullYear().toString();
  const legacyCode = readText(item.kodeDipa, `DIPA-${index + 1}`);
  const legacyCodeParts = legacyCode.split(".").filter(Boolean);
  const fallbackKodeAkun = legacyCodeParts.pop() ?? legacyCode;
  const fallbackKodeKro = legacyCodeParts.join(".") || legacyCode;
  const rawYear = readText(item.tahunAnggaran, currentYear);
  const formData: DipaFormData = {
    kodeKro: readFirstMeaningfulText(
      item,
      ["kodeKro", "kodeKlasifikasiRincianOutput"],
      fallbackKodeKro,
    ),
    klasifikasiRincianOutput: readFirstMeaningfulText(
      item,
      ["klasifikasiRincianOutput", "kro", "KlasifikasiRincianOutput"],
      legacyCode,
    ),
    kodeAkun: readFirstMeaningfulText(item, ["kodeAkun"], fallbackKodeAkun),
    akunPerjalananDinas: readFirstMeaningfulText(
      item,
      ["akunPerjalananDinas", "akun", "Akun", "detil", "program"],
      legacyCode,
    ),
    pagu: readAmount(item.pagu),
    tahunAnggaran: /^\d{4}$/.test(rawYear) ? rawYear : currentYear,
  };

  return createDipaRecord(
    dipaFormSchema.parse(formData),
    readText(item.id, `dipa-migrated-${index + 1}`),
  );
};

const defaultDipa = legacyDefaults.map(normalizeDipa);

export const dipaService = {
  getAll: (): DIPA[] => {
    if (typeof window === "undefined") return defaultDipa;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDipa));
      return defaultDipa;
    }

    try {
      const parsed = JSON.parse(stored) as unknown;
      if (!Array.isArray(parsed))
        throw new Error("Format data DIPA tidak valid");
      const normalized = parsed.map(normalizeDipa);
      const serialized = JSON.stringify(normalized);
      if (serialized !== stored) localStorage.setItem(STORAGE_KEY, serialized);
      return normalized;
    } catch {
      return defaultDipa;
    }
  },

  saveAll: (data: DIPA[]) => {
    if (typeof window !== "undefined") {
      const normalized = data.map(normalizeDipa);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }
  },
};
