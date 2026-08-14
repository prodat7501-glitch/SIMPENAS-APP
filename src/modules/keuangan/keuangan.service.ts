import type { Laporan } from "@/modules/laporan/laporan.schema";
import type { NotaDinas } from "@/modules/nota-dinas/nota-dinas.schema";
import { getLampiranCostBreakdown } from "@/modules/nota-dinas/nota-dinas-calculation";
import type { Sppd } from "@/modules/sppd/sppd.schema";
import type { Spt } from "@/modules/spt/spt.schema";
import type { DIPA } from "@/modules/dipa/dipa.schema";
import type {
  Spj,
  JenisDokumen,
  RincianKeuangan,
  RealisasiBiaya,
  DokumenKeuangan,
  PaymentCompletionInput,
} from "./keuangan.schema";
import {
  paymentCompletionInputSchema,
  realisasiBiayaSchema,
} from "./keuangan.schema";
import { penomoranService } from "@/modules/pengaturan/penomoran.service";
import {
  createPenandatanganSnapshots,
  penandatanganService,
} from "@/modules/penandatangan/penandatangan.service";
import { apiClient, withApiFallback } from "@/services/api";

const KEY = "simpenas_keuangan";
const get = (): Spj[] =>
  typeof window === "undefined"
    ? []
    : (JSON.parse(localStorage.getItem(KEY) ?? "[]") as Spj[]);
const put = (items: Spj[]) => {
  if (typeof window !== "undefined")
    localStorage.setItem(KEY, JSON.stringify(items));
};
const id = (prefix: string) =>
  `${prefix}-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now()}`;
const nextSequence = (items: Spj[], type: JenisDokumen, year: number) =>
  items
    .flatMap((item) => item.dokumen)
    .filter(
      (document) => document.jenis === type && document.tahun === String(year),
    )
    .reduce((highest, document) => {
      const parsed = Number(document.nomor.trim().split("/")[0]);
      return Number.isInteger(parsed) && parsed > 0
        ? Math.max(highest, parsed)
        : highest;
    }, 0) + 1;
const prerequisite: Partial<Record<JenisDokumen, JenisDokumen>> = {
  "Daftar Nominatif": "SPBY",
  "Tanda Terima": "Daftar Nominatif",
  Kuitansi: "Tanda Terima",
};
const INDIVIDUAL_DOCUMENT_TYPES = new Set<JenisDokumen>([
  "SPBY",
  "Tanda Terima",
  "Kuitansi",
]);
const isIndividualDocument = (jenis: JenisDokumen) =>
  INDIVIDUAL_DOCUMENT_TYPES.has(jenis);
type ChainContext = {
  reports: Laporan[];
  sppds: Sppd[];
  spts: Spt[];
  notas: NotaDinas[];
  dipas: DIPA[];
};

type SpjSourceContext = Pick<ChainContext, "sppds" | "spts" | "notas">;

const PAYMENT_PROCESS_READY_STATUSES = new Set<Spj["status"]>([
  "Validasi Selesai",
  "Proses Pembayaran",
]);

const areAllPaymentsComplete = (documents: DokumenKeuangan[]) => {
  const expectedRecipients = new Set(
    documents
      .filter((document) => document.jenis === "Tanda Terima")
      .flatMap((document) => document.rincian.map((row) => row.pegawaiId)),
  );
  const paidRecipients = new Set(
    documents
      .filter(
        (document) =>
          document.jenis === "Kuitansi" &&
          document.status === "Selesai" &&
          Boolean(document.pembayaran),
      )
      .flatMap((document) => document.rincian.map((row) => row.pegawaiId)),
  );

  return (
    expectedRecipients.size > 0 &&
    [...expectedRecipients].every((pegawaiId) => paidRecipients.has(pegawaiId))
  );
};

const isReportChainAvailable = (
  report: Laporan,
  context?: SpjSourceContext,
) => {
  if (!context) return true;
  const sppd = context.sppds.find((item) => item.id === report.sppdId);
  const spt = context.spts.find(
    (item) => item.id === report.sptId || item.id === sppd?.sptId,
  );
  const nota = context.notas.find((item) => item.id === spt?.notaDinasId);
  return Boolean(sppd && spt && nota);
};

const normalizeSpjWorkflowStatus = (
  item: Spj,
  documents: DokumenKeuangan[],
): Spj["status"] => {
  const legacyStatus = String(item.status);
  if (areAllPaymentsComplete(documents)) {
    return "Pembayaran Selesai";
  }
  if (documents.length > 0) return "Proses Pembayaran";
  if (
    [
      "Validasi SPJ Selesai",
      "Validasi Selesai",
      "Proses Pembayaran",
      "Pembayaran Selesai",
    ].includes(legacyStatus)
  ) {
    return "Validasi Selesai";
  }
  if (legacyStatus === "Validasi SPJ") return "Validasi SPJ";
  return "SPJ Diterima";
};

const toNonNegativeNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
};

const normalizeRealisasiBiaya = (
  row: Partial<RealisasiBiaya> & Pick<RealisasiBiaya, "pegawaiId">,
): RealisasiBiaya => ({
  pegawaiId: row.pegawaiId,
  notaDinasId: row.notaDinasId ?? "",
  lampiranIndex: row.lampiranIndex ?? -1,
  uangTransportHarian: toNonNegativeNumber(row.uangTransportHarian),
  penginapan: toNonNegativeNumber(row.penginapan),
  tiketPesawat: toNonNegativeNumber(row.tiketPesawat),
  transportBandaraAsal: toNonNegativeNumber(row.transportBandaraAsal),
  transportBandaraTujuan: toNonNegativeNumber(row.transportBandaraTujuan),
  diverifikasi: row.diverifikasi ?? false,
});

const buildRealisasiBiaya = (
  spj: Spj,
  context?: SpjSourceContext,
): RealisasiBiaya[] => {
  const existing = (spj.realisasiBiaya ?? []).map(normalizeRealisasiBiaya);
  if (!context) return existing;

  const sppd = context.sppds.find((item) => item.id === spj.sppdId);
  const spt = context.spts.find((item) => item.id === sppd?.sptId);
  const nota = context.notas.find((item) => item.id === spt?.notaDinasId);
  if (!spt || !nota) return existing;

  const allowedPegawaiIds = new Set(
    spt.personil.map((person) => person.pegawaiId),
  );
  return nota.lampiran.flatMap((lampiran, lampiranIndex) => {
    if (!allowedPegawaiIds.has(lampiran.pegawaiId)) return [];
    const saved = existing.find((row) => row.pegawaiId === lampiran.pegawaiId);
    return [
      normalizeRealisasiBiaya({
        ...saved,
        pegawaiId: lampiran.pegawaiId,
        notaDinasId: nota.id ?? "",
        lampiranIndex,
      }),
    ];
  });
};

const toRincian = (
  nota: NotaDinas,
  realisasiBiaya: RealisasiBiaya[],
  allowedPegawaiIds?: Set<string>,
): RincianKeuangan[] =>
  nota.lampiran.flatMap((item, index) => {
    if (allowedPegawaiIds && !allowedPegawaiIds.has(item.pegawaiId)) return [];
    const breakdown = getLampiranCostBreakdown(item, nota.jenis);
    const realisasi = realisasiBiaya.find(
      (row) => row.pegawaiId === item.pegawaiId,
    );
    const uangTransportHarian = realisasi?.uangTransportHarian ?? 0;
    const tiketPesawat = realisasi?.tiketPesawat ?? 0;
    const transportBandaraAsal = realisasi?.transportBandaraAsal ?? 0;
    const transportBandaraTujuan = realisasi?.transportBandaraTujuan ?? 0;
    const penginapan = realisasi?.penginapan ?? 0;
    const uangHarianPaketMeeting = breakdown.uangHarianPaketMeeting;
    const uangHarianFull = breakdown.uangHarianFull;
    const uangHarian = uangHarianPaketMeeting + uangHarianFull;
    const uangTransport =
      uangTransportHarian +
      tiketPesawat +
      transportBandaraAsal +
      transportBandaraTujuan;
    return [
      {
        pegawaiId: item.pegawaiId,
        notaDinasId: nota.id ?? "",
        lampiranIndex: index,
        uangTransport,
        uangHarian,
        penginapan,
        uangHarianPaketMeeting,
        uangHarianFull,
        uangTransportHarian,
        tiketPesawat,
        transportBandaraAsal,
        transportBandaraTujuan,
        jumlah: uangHarian + uangTransport + penginapan,
      },
    ];
  });

const resolveChain = (spj: Spj, context: ChainContext) => {
  const laporan = context.reports.find((item) => item.id === spj.laporanId);
  const sppd = context.sppds.find((item) => item.id === spj.sppdId);
  const spt = context.spts.find((item) => item.id === sppd?.sptId);
  const nota = context.notas.find((item) => item.id === spt?.notaDinasId);
  const dipa = context.dipas.find((item) => item.id === sppd?.dipaId);

  if (!laporan) throw new Error("Laporan referensi SPJ tidak ditemukan.");
  if (!sppd) throw new Error("SPPD referensi SPJ tidak ditemukan.");
  if (!spt) throw new Error("SPT referensi SPPD tidak ditemukan.");
  if (!nota) throw new Error("Nota Dinas referensi SPT tidak ditemukan.");

  return { laporan, sppd, spt, nota, dipa };
};

const migrateDocument = (spj: Spj, doc: DokumenKeuangan): DokumenKeuangan => ({
  ...doc,
  laporanId: doc.laporanId ?? spj.laporanId,
  sppdId: doc.sppdId ?? spj.sppdId,
  sptId: doc.sptId ?? "",
  notaDinasId: doc.notaDinasId ?? "",
  dipaId: doc.dipaId ?? "",
  parentDocumentId: doc.parentDocumentId ?? null,
  status: doc.pembayaran ? "Selesai" : (doc.status ?? "Dibuat"),
  pembayaran: doc.pembayaran ?? null,
  penandatanganSnapshots:
    doc.penandatanganSnapshots?.length > 0
      ? doc.penandatanganSnapshots
      : createPenandatanganSnapshots(
          penandatanganService.getAll(),
          doc.jenis,
          doc.tanggal,
        ),
  rincian: (doc.rincian || []).map((row, index) => ({
    ...row,
    notaDinasId: row.notaDinasId ?? "",
    lampiranIndex: row.lampiranIndex ?? index,
    uangHarianPaketMeeting: row.uangHarianPaketMeeting ?? row.uangHarian ?? 0,
    uangHarianFull: row.uangHarianFull ?? 0,
    uangTransportHarian: row.uangTransportHarian ?? row.uangTransport ?? 0,
    tiketPesawat: row.tiketPesawat ?? 0,
    transportBandaraAsal: row.transportBandaraAsal ?? 0,
    transportBandaraTujuan: row.transportBandaraTujuan ?? 0,
  })),
});

const migrateIndividualDocuments = (
  spj: Spj,
  document: DokumenKeuangan,
): DokumenKeuangan[] => {
  const migrated = migrateDocument(spj, document);

  if (!isIndividualDocument(migrated.jenis) || migrated.rincian.length <= 1) {
    return [migrated];
  }

  return migrated.rincian.map((row, index) => ({
    ...migrated,
    id: index === 0 ? migrated.id : `${migrated.id}-person-${index + 1}`,
    nomor:
      index === 0
        ? migrated.nomor
        : `${migrated.nomor}-${String(index + 1).padStart(2, "0")}`,
    rincian: [row],
    total: row.jumlah,
  }));
};

const linkIndividualDocumentParents = (
  documents: DokumenKeuangan[],
): DokumenKeuangan[] =>
  documents.map((document) => {
    if (!isIndividualDocument(document.jenis)) return document;

    const required = prerequisite[document.jenis];
    const pegawaiId = document.rincian[0]?.pegawaiId;
    if (!required || !pegawaiId) return document;

    const parent = documents.find(
      (candidate) =>
        candidate.jenis === required &&
        candidate.rincian.some((row) => row.pegawaiId === pegawaiId),
    );

    return parent ? { ...document, parentDocumentId: parent.id } : document;
  });

const reconcileDocumentAmounts = (
  document: DokumenKeuangan,
  realisasiBiaya: RealisasiBiaya[],
  context?: SpjSourceContext,
): DokumenKeuangan => {
  if (!context) return document;
  const nota = context.notas.find((item) => item.id === document.notaDinasId);
  if (!nota) return document;

  const currentPegawaiIds = new Set(
    document.rincian.map((row) => row.pegawaiId),
  );
  const spt = context.spts.find((item) => item.id === document.sptId);
  const allowedPegawaiIds =
    document.jenis === "Daftar Nominatif" && spt
      ? new Set(spt.personil.map((person) => person.pegawaiId))
      : currentPegawaiIds;
  const hasVerifiedRealisasi = [...allowedPegawaiIds].every((pegawaiId) =>
    realisasiBiaya.some(
      (row) => row.pegawaiId === pegawaiId && row.diverifikasi,
    ),
  );
  if (!hasVerifiedRealisasi) return document;
  const reconciledRincian = toRincian(nota, realisasiBiaya, allowedPegawaiIds);
  if (reconciledRincian.length === 0) return document;

  return {
    ...document,
    rincian: reconciledRincian,
    total: reconciledRincian.reduce((sum, row) => sum + row.jumlah, 0),
  };
};

const buildFinancialDocuments = (
  items: Spj[],
  target: Spj,
  spjId: string,
  jenis: JenisDokumen,
  context: ChainContext,
  existingDocuments: DokumenKeuangan[] = [],
): DokumenKeuangan[] => {
  const required = prerequisite[jenis];
  const parent = required
    ? target.dokumen.find((x) => x.jenis === required)
    : null;
  if (required && !parent)
    throw new Error(`${required} harus dibuat terlebih dahulu.`);

  const { sppd, spt, nota, dipa } = resolveChain(target, context);
  const sptPersonilIds = new Set(spt.personil.map((item) => item.pegawaiId));
  const realisasiBiaya = buildRealisasiBiaya(target, context);
  const unverifiedPerson = [...sptPersonilIds].find(
    (pegawaiId) =>
      !realisasiBiaya.some(
        (row) => row.pegawaiId === pegawaiId && row.diverifikasi,
      ),
  );
  if (unverifiedPerson) {
    throw new Error(
      "Realisasi biaya berdasarkan bukti SPJ belum diverifikasi untuk seluruh personel.",
    );
  }
  const scopedRincian = toRincian(nota, realisasiBiaya, sptPersonilIds);
  const rincian = scopedRincian.length
    ? scopedRincian
    : toRincian(nota, realisasiBiaya);
  const date = new Date();
  const baseSequence = nextSequence(items, jenis, date.getFullYear());
  const existingByPegawai = new Map(
    existingDocuments
      .map((doc) => [doc.rincian[0]?.pegawaiId, doc] as const)
      .filter(([pegawaiId]) => !!pegawaiId),
  );

  const createDocument = (
    rows: RincianKeuangan[],
    index = 0,
  ): DokumenKeuangan => {
    const seqNumber = baseSequence + index;
    const existing = existingByPegawai.get(rows[0]?.pegawaiId);
    const pegawaiId = rows[0]?.pegawaiId;
    const rowParent = required
      ? (target.dokumen.find(
          (document) =>
            document.jenis === required &&
            (!isIndividualDocument(jenis) ||
              document.rincian.some((row) => row.pegawaiId === pegawaiId)),
        ) ?? parent)
      : null;
    const rowSppd = isIndividualDocument(jenis)
      ? context.sppds.find(
          (item) =>
            item.sptId === spt.id &&
            item.personil.some((person) => person.pegawaiId === pegawaiId),
        )
      : null;
    return {
      id: existing?.id ?? id("doc"),
      spjId,
      laporanId: target.laporanId,
      sppdId: rowSppd?.id ?? sppd.id ?? target.sppdId,
      sptId: spt.id ?? "",
      notaDinasId: nota.id ?? "",
      parentDocumentId: rowParent?.id ?? null,
      jenis,
      nomor:
        existing?.nomor ??
        penomoranService.requestNumber(
          jenis,
          date.toISOString(),
          seqNumber - 1,
        ),
      tanggal: existing?.tanggal ?? date.toISOString().slice(0, 10),
      tahun: String(date.getFullYear()),
      dipaId: dipa?.id ?? sppd.dipaId ?? "",
      anggaran:
        dipa?.akunPerjalananDinas ?? "Anggaran DIPA KPU Kabupaten Gorontalo",
      mak: dipa?.kodeDipa ?? "-",
      rincian: rows,
      total: rows.reduce((sum, x) => sum + x.jumlah, 0),
      status: existing?.pembayaran
        ? ("Selesai" as const)
        : (existing?.status ?? ("Dibuat" as const)),
      pembayaran: existing?.pembayaran ?? null,
      penandatanganSnapshots:
        (existing?.penandatanganSnapshots?.length ?? 0) > 0
          ? existing!.penandatanganSnapshots
          : createPenandatanganSnapshots(
              penandatanganService.getAll(),
              jenis,
              existing?.tanggal ?? date.toISOString().slice(0, 10),
            ),
    };
  };

  return isIndividualDocument(jenis)
    ? rincian.map((row, index) => createDocument([row], index))
    : [createDocument(rincian)];
};

export const keuanganService = {
  getCompletedPaymentTotalsByDipa: (): {
    byId: Record<string, number>;
    byLegacyAccount: Record<string, number>;
  } =>
    get()
      .flatMap((item) => item.dokumen)
      .filter(
        (document) =>
          document.jenis === "Kuitansi" &&
          document.status === "Selesai" &&
          Boolean(document.pembayaran),
      )
      .reduce<{
        byId: Record<string, number>;
        byLegacyAccount: Record<string, number>;
      }>(
        (totals, document) => {
          if (document.dipaId) {
            totals.byId[document.dipaId] =
              (totals.byId[document.dipaId] ?? 0) + document.total;
            return totals;
          }

          const legacyKey = `${document.tahun}::${document.mak.trim()}`;
          totals.byLegacyAccount[legacyKey] =
            (totals.byLegacyAccount[legacyKey] ?? 0) + document.total;
          return totals;
        },
        { byId: {}, byLegacyAccount: {} },
      ),
  getDocumentNumbers: (jenis: JenisDokumen, year = new Date().getFullYear()) =>
    get()
      .flatMap((item) => item.dokumen)
      .filter(
        (document) =>
          document.jenis === jenis && document.tahun === String(year),
      )
      .map((document) => document.nomor),
  list: async (reports: Laporan[], context?: SpjSourceContext): Promise<Spj[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<Spj[] | { data?: Spj[]; items?: Spj[] }>("/api/dokumen_keuangan");
        const list = Array.isArray(res) ? res : res.data || res.items || [];
        return list;
      },
      async () => {
        const current = get();
        const verified = reports.filter(
          (item) =>
            item.status === "Terverifikasi" &&
            item.id &&
            isReportChainAvailable(item, context),
        );
        const verifiedReportIds = new Set(
          verified.map((report) => report.id).filter(Boolean),
        );
        const retained = current.filter((item) =>
          verifiedReportIds.has(item.laporanId),
        );
        const removed = current.filter(
          (item) => !verifiedReportIds.has(item.laporanId),
        );

        removed
          .flatMap((item) => item.dokumen)
          .forEach((document) =>
            penomoranService.releaseNumber(
              document.jenis,
              document.nomor,
              `Nomor ${document.jenis} dilepas karena rantai dokumen sumber SPJ sudah tidak tersedia.`,
            ),
          );

        const migrated = retained.map((item) => {
          const realisasiBiaya = buildRealisasiBiaya(item, context);
          const documents = item.dokumen.flatMap((document) =>
            migrateIndividualDocuments(item, document),
          );
          const linkedDocuments = linkIndividualDocumentParents(documents).map(
            (document) =>
              reconcileDocumentAmounts(document, realisasiBiaya, context),
          );

          return {
            ...item,
            realisasiBiaya,
            status: normalizeSpjWorkflowStatus(item, linkedDocuments),
            dokumen: linkedDocuments,
          };
        });
        const additions: Spj[] = verified
          .filter(
            (report) => !migrated.some((item) => item.laporanId === report.id),
          )
          .map((report) => {
            const spj: Spj = {
              id: id("spj"),
              laporanId: report.id!,
              sppdId: report.sppdId,
              status: "SPJ Diterima",
              checklist: {
                laporan: true,
                sppd: true,
                dokumentasi: report.dokumentasi.length > 0,
                tandaTangan: !!report.tandaTangan,
              },
              realisasiBiaya: [],
              catatan: "",
              tanggalDiterima: new Date().toISOString().slice(0, 10),
              dokumen: [],
            };
            return {
              ...spj,
              realisasiBiaya: buildRealisasiBiaya(spj, context),
            };
          });
        if (
          removed.length ||
          additions.length ||
          JSON.stringify(current) !== JSON.stringify(migrated)
        )
          put([...migrated, ...additions]);
        return [...migrated, ...additions];
      }
    );
  },
  validate: async (
    spjId: string,
    checklist: Spj["checklist"],
    realisasiBiaya: Spj["realisasiBiaya"],
    catatan: string,
    action: "mulai" | "revisi" | "selesai",
  ) => {
    return withApiFallback(
      async () => {
        const res = await apiClient.post<Spj>("/api/validasi_spj", {
          spjId,
          checklist,
          realisasiBiaya,
          catatan,
          action,
        });
        return res;
      },
      async () => {
        const items = get();
        const target = items.find((x) => x.id === spjId);
        if (!target) throw new Error("SPJ tidak ditemukan.");
        if (
          target.status === "Proses Pembayaran" ||
          target.status === "Pembayaran Selesai"
        ) {
          throw new Error(
            "Validasi tidak dapat diubah setelah proses pembayaran dimulai.",
          );
        }
        if (action === "selesai" && !Object.values(checklist).every(Boolean))
          throw new Error("Seluruh persyaratan SPJ wajib lengkap.");
        const normalizedRealisasi = realisasiBiayaSchema
          .array()
          .parse(realisasiBiaya.map(normalizeRealisasiBiaya));
        if (
          action === "selesai" &&
          (normalizedRealisasi.length === 0 ||
            normalizedRealisasi.some((row) => !row.diverifikasi))
        ) {
          throw new Error(
            "Realisasi biaya berdasarkan bukti SPJ wajib diperiksa untuk seluruh personel.",
          );
        }
        if (action === "revisi" && catatan.trim().length < 3)
          throw new Error("Catatan kekurangan wajib diisi.");
        const status =
          action === "mulai"
            ? "Validasi SPJ"
            : action === "revisi"
              ? "SPJ Diterima"
              : "Validasi Selesai";
        const updated: Spj = {
          ...target,
          checklist,
          realisasiBiaya: normalizedRealisasi,
          catatan,
          status,
        };
        put(items.map((x) => (x.id === spjId ? updated : x)));
        return updated;
      }
    );
  },
  generate: async (
    spjId: string,
    jenis: JenisDokumen,
    context: ChainContext,
  ) => {
    return withApiFallback(
      async () => {
        const res = await apiClient.post<DokumenKeuangan>("/api/dokumen_keuangan", { spjId, jenis });
        return res;
      },
      async () => {
        const items = get();
        const target = items.find((x) => x.id === spjId);
        if (!target) throw new Error("SPJ tidak ditemukan.");
        if (!PAYMENT_PROCESS_READY_STATUSES.has(target.status))
          throw new Error("Validasi SPJ belum selesai.");
        if (target.dokumen.some((x) => x.jenis === jenis))
          throw new Error(`${jenis} sudah dibuat.`);
        const documents = buildFinancialDocuments(
          items,
          target,
          spjId,
          jenis,
          context,
        );
        const updated = {
          ...target,
          status: "Proses Pembayaran" as const,
          dokumen: [...target.dokumen, ...documents],
        };
        put(items.map((x) => (x.id === spjId ? updated : x)));
        return documents[0];
      }
    );
  },
  regenerate: async (
    spjId: string,
    jenis: JenisDokumen,
    context: ChainContext,
  ) => {
    if (jenis !== "SPBY")
      throw new Error("Buat ulang saat ini hanya tersedia untuk SPBY.");
    const items = get();
    const target = items.find((x) => x.id === spjId);
    if (!target) throw new Error("SPJ tidak ditemukan.");
    if (!PAYMENT_PROCESS_READY_STATUSES.has(target.status))
      throw new Error("Validasi SPJ belum selesai.");

    const existingDocuments = target.dokumen.filter((x) => x.jenis === jenis);
    if (!existingDocuments.length)
      throw new Error(`${jenis} belum pernah dibuat.`);

    const retainedDocuments = target.dokumen.filter((x) => x.jenis !== jenis);
    const documents = buildFinancialDocuments(
      items,
      { ...target, dokumen: retainedDocuments },
      spjId,
      jenis,
      context,
      existingDocuments,
    );
    const updated = {
      ...target,
      status: "Proses Pembayaran" as const,
      dokumen: [...retainedDocuments, ...documents],
    };
    put(items.map((x) => (x.id === spjId ? updated : x)));
    return documents;
  },
  removeDocument: async (documentId: string): Promise<DokumenKeuangan> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.delete<DokumenKeuangan>(`/api/dokumen_keuangan/${documentId}`);
        return res;
      },
      async () => {
        const items = get();
        const target = items.find((spj) =>
          spj.dokumen.some((document) => document.id === documentId),
        );
        if (!target) throw new Error("Dokumen keuangan tidak ditemukan.");

        const document = target.dokumen.find((item) => item.id === documentId);
        if (!document) throw new Error("Dokumen keuangan tidak ditemukan.");

        const pegawaiId = document.rincian[0]?.pegawaiId;
        const dependent = target.dokumen.find((candidate) => {
          if (candidate.id === document.id) return false;
          if (candidate.parentDocumentId === document.id) return true;
          if (
            document.jenis === "SPBY" &&
            ["Daftar Nominatif", "Tanda Terima", "Kuitansi"].includes(
              candidate.jenis,
            )
          ) {
            return true;
          }
          if (
            document.jenis === "Daftar Nominatif" &&
            ["Tanda Terima", "Kuitansi"].includes(candidate.jenis)
          ) {
            return true;
          }
          return (
            document.jenis === "Tanda Terima" &&
            candidate.jenis === "Kuitansi" &&
            Boolean(pegawaiId) &&
            candidate.rincian.some((row) => row.pegawaiId === pegawaiId)
          );
        });

        if (dependent) {
          throw new Error(
            `${document.jenis} tidak dapat dihapus karena masih menjadi referensi ${dependent.jenis}. Hapus dokumen turunannya terlebih dahulu.`,
          );
        }

        const remainingDocuments = target.dokumen.filter(
          (item) => item.id !== documentId,
        );
        const updated: Spj = {
          ...target,
          status:
            remainingDocuments.length > 0
              ? "Proses Pembayaran"
              : "Validasi Selesai",
          dokumen: remainingDocuments,
        };
        put(items.map((item) => (item.id === target.id ? updated : item)));

        penomoranService.releaseNumber(
          document.jenis,
          document.nomor,
          `Nomor dilepas karena ${document.jenis} telah dihapus oleh Administrator.`,
        );

        return document;
      }
    );
  },
  completePayment: async (
    documentId: string,
    input: PaymentCompletionInput,
  ) => {
    return withApiFallback(
      async () => {
        const res = await apiClient.post<DokumenKeuangan>("/api/pembayaran", { documentId, ...input });
        return res;
      },
      async () => {
        const items = get();
        const target = items.find((spj) =>
          spj.dokumen.some((document) => document.id === documentId),
        );
        if (!target) throw new Error("Dokumen pembayaran tidak ditemukan.");

        const document = target.dokumen.find((item) => item.id === documentId);
        if (!document) throw new Error("Dokumen pembayaran tidak ditemukan.");
        if (document.jenis !== "Kuitansi")
          throw new Error(
            "Penyelesaian pembayaran hanya dapat dilakukan dari Kuitansi.",
          );
        if (document.status === "Selesai")
          throw new Error("Pembayaran Kuitansi ini sudah diselesaikan.");

        const payment = paymentCompletionInputSchema.parse(input);
        const updatedDocument: DokumenKeuangan = {
          ...document,
          status: "Selesai",
          pembayaran: {
            ...payment,
            dikonfirmasiPada: new Date().toISOString(),
          },
        };
        const updatedDocuments = target.dokumen.map((item) =>
          item.id === documentId ? updatedDocument : item,
        );
        const isPaymentComplete = areAllPaymentsComplete(updatedDocuments);
        const updated: Spj = {
          ...target,
          status: isPaymentComplete ? "Pembayaran Selesai" : "Proses Pembayaran",
          dokumen: updatedDocuments,
        };
        put(items.map((item) => (item.id === target.id ? updated : item)));
        return updatedDocument;
      }
    );
  },
};
