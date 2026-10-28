import type {
  JenisDokumenPenandatangan,
  Penandatangan,
  PenandatanganSnapshot,
} from "./penandatangan.schema";
import { apiClient, withApiFallback } from "@/services/api";

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
    text.includes("kasubag") ||
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

export const normalizePenandatangan = (raw: unknown): Penandatangan => {
  if (!raw || typeof raw !== "object") {
    return {
      id: "",
      nama: "-",
      nip: "-",
      jabatanPenandatangan: "-",
      peran: "-",
      berlakuMulai: "",
      berlakuSampai: "",
      status: "Nonaktif",
      jenisDokumen: ["Nota Dinas"],
    };
  }
  const item = raw as Record<string, unknown>;
  const id = String(item.id || "");
  const pegawaiId = String(
    item.pegawaiId || item.pegawai_id || item.pegawaiIdRef || "",
  ).trim();
  const nama = String(
    item.nama || item.nama_pejabat || item.namaPejabat || "",
  ).trim();
  const nip = String(item.nip || "").trim();
  const jabatanPenandatangan = String(
    item.jabatanPenandatangan ||
      item.jabatan ||
      item.jabatan_pejabat ||
      item.jabatanPejabat ||
      "",
  ).trim();
  const peran = String(
    item.peran ||
      item.role_pejabat ||
      item.rolePejabat ||
      item.kategori ||
      "",
  ).trim();

  const statusRaw = item.status ?? item.status_aktif ?? item.statusAktif;
  const status: "Aktif" | "Nonaktif" =
    statusRaw === true ||
    statusRaw === "TRUE" ||
    statusRaw === "true" ||
    statusRaw === 1 ||
    statusRaw === "1" ||
    statusRaw === "Aktif"
      ? "Aktif"
      : "Nonaktif";

  const rawJenis = item.jenisDokumen || item.jenis_dokumen;
  const parsedJenis = Array.isArray(rawJenis)
    ? (rawJenis as JenisDokumenPenandatangan[])
    : typeof rawJenis === "string"
      ? (() => {
          try {
            const p = JSON.parse(rawJenis);
            return Array.isArray(p)
              ? (p as JenisDokumenPenandatangan[])
              : [];
          } catch {
            return [];
          }
        })()
      : [];

  const partial: Omit<Penandatangan, "jenisDokumen"> = {
    id,
    ...(pegawaiId ? { pegawaiId } : {}),
    nama,
    nip,
    jabatanPenandatangan,
    peran,
    berlakuMulai: String(item.berlakuMulai || item.berlaku_mulai || ""),
    berlakuSampai: String(item.berlakuSampai || item.berlaku_sampai || ""),
    status,
  };

  const jenisDokumen =
    parsedJenis.length > 0 ? parsedJenis : inferDocumentTypes(partial);

  return {
    ...partial,
    jenisDokumen,
  };
};

export const penandatanganService = {
  getAll: (): Penandatangan[] => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.map(normalizePenandatangan) : [];
    } catch {
      return [];
    }
  },
  saveAll: (data: Penandatangan[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  },

  // REST API Integration (/api/v1/penandatangan)
  apiGetAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<Penandatangan[]> => {
    return withApiFallback(
      async () => {
        const queryParams = { limit: 100, ...params };
        const res = await apiClient.get<
          Penandatangan[] | { data?: Penandatangan[]; items?: Penandatangan[] }
        >("/api/v1/penandatangan", queryParams);
        const list = Array.isArray(res) ? res : res.data || res.items || [];
        const normalized = list.map(normalizePenandatangan);
        if (normalized.length > 0) {
          penandatanganService.saveAll(normalized);
        }
        return normalized;
      },
      () => penandatanganService.getAll(),
    );
  },

  apiGetById: async (id: string): Promise<Penandatangan | null> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<
          Penandatangan | { data?: Penandatangan }
        >(`/api/v1/penandatangan/${id}`);
        const unwrapped =
          (res as { data?: Penandatangan }).data || (res as Penandatangan);
        return unwrapped ? normalizePenandatangan(unwrapped) : null;
      },
      () => penandatanganService.getAll().find((p) => p.id === id) || null,
    );
  },

  apiCreate: async (data: Partial<Penandatangan>): Promise<Penandatangan> => {
    return withApiFallback(
      async () => {
        const payload = { id: data.id || `pe-${Date.now()}`, ...data };
        const res = await apiClient.post<
          Penandatangan | { data?: Penandatangan }
        >("/api/v1/penandatangan", payload);
        const unwrapped =
          (res as { data?: Penandatangan }).data || (res as Penandatangan);
        return normalizePenandatangan(unwrapped);
      },
      async () => {
        const items = penandatanganService.getAll();
        const newItem = normalizePenandatangan({
          ...data,
          id: data.id || `pe-${Date.now()}`,
        } as Penandatangan);
        penandatanganService.saveAll([...items, newItem]);
        return newItem;
      },
    );
  },

  apiUpdate: async (
    id: string,
    data: Partial<Penandatangan>,
  ): Promise<Penandatangan> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.put<
          Penandatangan | { data?: Penandatangan }
        >(`/api/v1/penandatangan/${id}`, data);
        const unwrapped =
          (res as { data?: Penandatangan }).data || (res as Penandatangan);
        return normalizePenandatangan(unwrapped);
      },
      async () => {
        const items = penandatanganService.getAll();
        const updated = items.map((item) =>
          item.id === id ? normalizePenandatangan({ ...item, ...data }) : item,
        );
        penandatanganService.saveAll(updated);
        return updated.find((i) => i.id === id)!;
      },
    );
  },

  apiDelete: async (id: string): Promise<boolean> => {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/api/v1/penandatangan/${id}`);
        return true;
      },
      async () => {
        const items = penandatanganService.getAll();
        penandatanganService.saveAll(items.filter((item) => item.id !== id));
        return true;
      },
    );
  },

  apiBulkCreate: async (
    data: Partial<Penandatangan>[],
  ): Promise<Penandatangan[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.bulkPost<
          Penandatangan[] | { data?: Penandatangan[] }
        >("/api/v1/penandatangan", data);
        const list = Array.isArray(res) ? res : res.data || [];
        return list.map(normalizePenandatangan);
      },
      async () => {
        const items = penandatanganService.getAll();
        const normalized = data.map((d) =>
          normalizePenandatangan(d as Penandatangan),
        );
        penandatanganService.saveAll([...items, ...normalized]);
        return normalized;
      },
    );
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
