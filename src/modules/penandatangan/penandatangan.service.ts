import type {
  JenisDokumenPenandatangan,
  Penandatangan,
  PenandatanganSnapshot,
} from "./penandatangan.schema";

const STORAGE_KEY = "simpenas_penandatangan";

const FINANCIAL_DOCUMENT_TYPES: JenisDokumenPenandatangan[] = [
  "SPBY",
  "Daftar Nominatif",
  "Tanda Terima",
  "Kuitansi",
];

const inferDocumentTypes = (
  item: Pick<Penandatangan, "jabatanPenandatangan" | "peran">,
): JenisDokumenPenandatangan[] => {
  const text = `${item.jabatanPenandatangan} ${item.peran}`.toLowerCase();
  const result = new Set<JenisDokumenPenandatangan>();
  if (
    text.includes("kasubbag") ||
    text.includes("kepala sub bagian") ||
    text.includes("kepala subbagian")
  )
    result.add("Nota Dinas");
  if (text.includes("sekretaris") || text.includes("ketua kpu"))
    result.add("SPT");
  if (text.includes("ppk") || text.includes("pejabat pembuat komitmen")) {
    result.add("SPPD");
    FINANCIAL_DOCUMENT_TYPES.forEach((type) => result.add(type));
  }
  if (
    text.includes("bendahara") ||
    text.includes("kpa") ||
    text.includes("kuasa pengguna anggaran") ||
    text.includes("ppspm")
  )
    FINANCIAL_DOCUMENT_TYPES.forEach((type) => result.add(type));
  if (text.includes("pengadaan")) result.add("Kuitansi");
  return result.size ? [...result] : [...FINANCIAL_DOCUMENT_TYPES];
};

const normalizePenandatangan = (item: Penandatangan): Penandatangan => ({
  ...item,
  berlakuMulai: item.berlakuMulai ?? "",
  berlakuSampai: item.berlakuSampai ?? "",
  jenisDokumen:
    item.jenisDokumen?.length > 0
      ? item.jenisDokumen
      : inferDocumentTypes(item),
});

const defaultPenandatangan: Penandatangan[] = [
  {
    id: "pe1",
    nip: "19750824 200212 1 002",
    nama: "Herman Monoarfa, M.Si",
    jabatanPenandatangan: "Kuasa Pengguna Anggaran (KPA)",
    peran: "KPA",
    berlakuMulai: "",
    berlakuSampai: "",
    jenisDokumen: [...FINANCIAL_DOCUMENT_TYPES],
    status: "Aktif",
  },
  {
    id: "pe2",
    nip: "19800411 200801 1 003",
    nama: "Faisal Yusuf, S.E",
    jabatanPenandatangan: "Pejabat Pembuat Komitmen (PPK)",
    peran: "PPK",
    berlakuMulai: "",
    berlakuSampai: "",
    jenisDokumen: ["SPPD", ...FINANCIAL_DOCUMENT_TYPES],
    status: "Aktif",
  },
  {
    id: "pe3",
    nip: "19880215 201401 2 001",
    nama: "Sri Wahyuni, A.Md",
    jabatanPenandatangan: "Bendahara Pengeluaran KPU Kabupaten Gorontalo",
    peran: "Bendahara",
    berlakuMulai: "",
    berlakuSampai: "",
    jenisDokumen: [...FINANCIAL_DOCUMENT_TYPES],
    status: "Aktif",
  },
  {
    id: "pe4",
    nip: "19790315 200501 1 001",
    nama: "Sekretaris KPU Kabupaten Gorontalo",
    jabatanPenandatangan: "Sekretaris KPU Kabupaten Gorontalo",
    peran: "Sekretaris KPU",
    berlakuMulai: "",
    berlakuSampai: "",
    jenisDokumen: ["SPT"],
    status: "Aktif",
  },
  {
    id: "pe5",
    nip: "19700101 200001 1 001",
    nama: "Ketua KPU Kabupaten Gorontalo",
    jabatanPenandatangan: "Ketua KPU Kabupaten Gorontalo",
    peran: "Ketua KPU",
    berlakuMulai: "",
    berlakuSampai: "",
    jenisDokumen: ["SPT"],
    status: "Aktif",
  },
  {
    id: "pe6",
    nip: "19850212 201201 1 001",
    nama: "Kepala Sub Bagian Keuangan, Umum dan Logistik",
    jabatanPenandatangan: "Kepala Sub Bagian Keuangan, Umum dan Logistik",
    peran: "Kepala Sub Bagian",
    berlakuMulai: "",
    berlakuSampai: "",
    jenisDokumen: ["Nota Dinas"],
    status: "Aktif",
  },
];

const ensureRequiredSigners = (items: Penandatangan[]) => {
  const text = items
    .map((item) => `${item.jabatanPenandatangan} ${item.peran}`)
    .join(" ")
    .toLowerCase();
  const requiredDefaults = defaultPenandatangan.filter((item) => {
    const signerText =
      `${item.jabatanPenandatangan} ${item.peran}`.toLowerCase();
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
      return defaultPenandatangan.map(normalizePenandatangan);
    }
    const merged = ensureRequiredSigners(JSON.parse(stored)).map(
      normalizePenandatangan,
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  },
  saveAll: (data: Penandatangan[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },
};

export const isPenandatanganAvailable = (
  item: Penandatangan,
  jenisDokumen: JenisDokumenPenandatangan,
  tanggalDokumen?: string,
) => {
  if (item.status !== "Aktif" || !item.jenisDokumen.includes(jenisDokumen))
    return false;
  if (!tanggalDokumen) return true;
  if (item.berlakuMulai && tanggalDokumen < item.berlakuMulai) return false;
  if (item.berlakuSampai && tanggalDokumen > item.berlakuSampai) return false;
  return true;
};

const getNotaDinasApproverRole = (item: Penandatangan) => {
  const text = `${item.peran} ${item.jabatanPenandatangan}`.toLowerCase();
  const isSekretaris = text.includes("sekretaris");
  const isPlt =
    isSekretaris && (text.includes("plt") || text.includes("pelaksana tugas"));
  const isPlh =
    isSekretaris && (text.includes("plh") || text.includes("pelaksana harian"));
  const isSekretarisKpu =
    isSekretaris &&
    (text.includes("sekretaris kpu") ||
      item.peran.toLowerCase() === "sekretaris kpu");

  if (isPlt) return "PLT. Sekretaris" as const;
  if (isPlh) return "PLH. Sekretaris" as const;
  if (isSekretarisKpu) return "Sekretaris" as const;
  return null;
};

const isWithinAssignmentPeriod = (item: Penandatangan, tanggal?: string) => {
  if (item.status !== "Aktif") return false;
  if (!tanggal) return true;
  if (item.berlakuMulai && tanggal < item.berlakuMulai) return false;
  if (item.berlakuSampai && tanggal > item.berlakuSampai) return false;
  return true;
};

export const getNotaDinasApprovalDestination = (
  item: Penandatangan | null | undefined,
) =>
  (item ? getNotaDinasApproverRole(item) : null) ??
  "Sekretaris/PLH/PLT Sekretaris";

export const resolveNotaDinasApprover = (
  items: Penandatangan[],
  tanggalDokumen?: string,
): Penandatangan | null => {
  const priority: Record<
    "Sekretaris" | "PLH. Sekretaris" | "PLT. Sekretaris",
    number
  > = {
    Sekretaris: 1,
    "PLH. Sekretaris": 2,
    "PLT. Sekretaris": 3,
  };

  return (
    items
      .filter((item) => {
        const role = getNotaDinasApproverRole(item);
        const mappedToApprovalDocument =
          item.jenisDokumen.includes("Nota Dinas") ||
          item.jenisDokumen.includes("SPT");
        return (
          Boolean(role) &&
          mappedToApprovalDocument &&
          isWithinAssignmentPeriod(item, tanggalDokumen)
        );
      })
      .sort((a, b) => {
        const roleA = getNotaDinasApproverRole(a) ?? "Sekretaris";
        const roleB = getNotaDinasApproverRole(b) ?? "Sekretaris";
        const roleDifference = priority[roleB] - priority[roleA];
        if (roleDifference !== 0) return roleDifference;
        return (b.berlakuMulai || "").localeCompare(a.berlakuMulai || "");
      })[0] ?? null
  );
};

export const createPenandatanganSnapshot = (
  item: Penandatangan,
  jenisDokumen: JenisDokumenPenandatangan,
  tanggalDokumen?: string,
  allowUnavailable = false,
): PenandatanganSnapshot | null => {
  if (
    !item.id ||
    (!allowUnavailable &&
      !isPenandatanganAvailable(item, jenisDokumen, tanggalDokumen))
  )
    return null;
  return {
    penandatanganId: item.id,
    nama: item.nama,
    nip: item.nip,
    jabatanPenandatangan: item.jabatanPenandatangan,
    peran: item.peran,
    jenisDokumen,
    berlakuMulai: item.berlakuMulai,
    berlakuSampai: item.berlakuSampai,
    diambilPada: new Date().toISOString(),
  };
};

export const createPenandatanganSnapshots = (
  items: Penandatangan[],
  jenisDokumen: JenisDokumenPenandatangan,
  tanggalDokumen?: string,
) =>
  items.flatMap((item) => {
    const snapshot = createPenandatanganSnapshot(
      item,
      jenisDokumen,
      tanggalDokumen,
    );
    return snapshot ? [snapshot] : [];
  });

export const snapshotToPenandatangan = (
  snapshot: PenandatanganSnapshot,
): Penandatangan => ({
  id: snapshot.penandatanganId,
  nama: snapshot.nama,
  nip: snapshot.nip,
  jabatanPenandatangan: snapshot.jabatanPenandatangan,
  peran: snapshot.peran,
  berlakuMulai: snapshot.berlakuMulai,
  berlakuSampai: snapshot.berlakuSampai,
  jenisDokumen: [snapshot.jenisDokumen],
  status: "Aktif",
});
