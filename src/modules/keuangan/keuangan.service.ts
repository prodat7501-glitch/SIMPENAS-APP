import type { Laporan } from "@/modules/laporan/laporan.schema";
import type {
  LampiranItem,
  NotaDinas,
} from "@/modules/nota-dinas/nota-dinas.schema";
import type { Sppd } from "@/modules/sppd/sppd.schema";
import type { Spt } from "@/modules/spt/spt.schema";
import type { DIPA } from "@/modules/dipa/dipa.schema";
import type {
  Spj,
  JenisDokumen,
  RincianKeuangan,
  DokumenKeuangan,
} from "./keuangan.schema";
import { penomoranService } from "@/modules/pengaturan/penomoran.service";

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
const sequence = (items: Spj[], type: JenisDokumen) =>
  items.flatMap((x) => x.dokumen).filter((x) => x.jenis === type).length + 1;
const prerequisite: Partial<Record<JenisDokumen, JenisDokumen>> = {
  "Daftar Nominatif": "SPBY",
  "Tanda Terima": "Daftar Nominatif",
  Kuitansi: "Tanda Terima",
};
type ChainContext = {
  reports: Laporan[];
  sppds: Sppd[];
  spts: Spt[];
  notas: NotaDinas[];
  dipas: DIPA[];
};

const toRincian = (
  notaDinasId: string,
  items: LampiranItem[],
): RincianKeuangan[] =>
  items.map((item, index) => ({
      pegawaiId: item.pegawaiId,
      notaDinasId,
      lampiranIndex: index,
      uangTransport:
        item.uangTransport +
        item.tiketPesawat +
        item.transportBandaraAsal +
        item.transportBandaraTujuan,
      uangHarian: item.uangHarian * item.volume,
      penginapan: item.penginapan * item.volume,
      jumlah: item.total,
    }));

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
  parentDocumentId: doc.parentDocumentId ?? null,
  rincian: doc.rincian.map((row, index) => ({
    ...row,
    notaDinasId: row.notaDinasId ?? "",
    lampiranIndex: row.lampiranIndex ?? index,
  })),
});

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
  const lampiranSpt = nota.lampiran.filter((item) =>
    sptPersonilIds.has(item.pegawaiId),
  );
  const rincian = toRincian(
    nota.id ?? "",
    lampiranSpt.length ? lampiranSpt : nota.lampiran,
  );
  const date = new Date();
  const baseSequence = sequence(items, jenis);
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
    const seq = String(seqNumber).padStart(3, "0");
    const existing = existingByPegawai.get(rows[0]?.pegawaiId);
    const rowSppd =
      jenis === "SPBY"
        ? context.sppds.find(
            (item) =>
              item.sptId === spt.id &&
              item.personil.some(
                (person) => person.pegawaiId === rows[0]?.pegawaiId,
              ),
          )
        : null;
    return {
      id: existing?.id ?? id("doc"),
      spjId,
      laporanId: target.laporanId,
      sppdId: rowSppd?.id ?? sppd.id ?? target.sppdId,
      sptId: spt.id ?? "",
      notaDinasId: nota.id ?? "",
      parentDocumentId: parent?.id ?? null,
      jenis,
      nomor:
        existing?.nomor ??
        (jenis === "SPBY"
          ? penomoranService.requestNumber(
              "SPBY",
              date.toISOString(),
              seqNumber - 1,
            )
          : `${seq}/${jenis.replaceAll(" ", "-").toUpperCase()}/KPU-KAB-GTLO/${date.getFullYear()}`),
      tanggal: existing?.tanggal ?? date.toISOString().slice(0, 10),
      tahun: String(date.getFullYear()),
      anggaran: dipa?.program ?? "Anggaran DIPA KPU Kabupaten Gorontalo",
      mak: dipa?.kodeDipa ?? "-",
      rincian: rows,
      total: rows.reduce((sum, x) => sum + x.jumlah, 0),
      status: "Dibuat" as const,
    };
  };

  return jenis === "SPBY"
    ? rincian.map((row, index) => createDocument([row], index))
    : [createDocument(rincian)];
};

export const keuanganService = {
  list: async (reports: Laporan[]) => {
    const current = get();
    const migrated = current.map((item) => ({
      ...item,
      dokumen: item.dokumen.map((doc) => migrateDocument(item, doc)),
    }));
    const verified = reports.filter(
      (item) => item.status === "Terverifikasi" && item.id,
    );
    const additions: Spj[] = verified
      .filter((report) => !migrated.some((item) => item.laporanId === report.id))
      .map((report) => ({
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
        catatan: "",
        tanggalDiterima: new Date().toISOString().slice(0, 10),
        dokumen: [],
      }));
    if (additions.length || JSON.stringify(current) !== JSON.stringify(migrated))
      put([...migrated, ...additions]);
    return [...migrated, ...additions];
  },
  validate: async (
    spjId: string,
    checklist: Spj["checklist"],
    catatan: string,
    action: "mulai" | "revisi" | "selesai",
  ) => {
    const items = get();
    const target = items.find((x) => x.id === spjId);
    if (!target) throw new Error("SPJ tidak ditemukan.");
    if (action === "selesai" && !Object.values(checklist).every(Boolean))
      throw new Error("Seluruh persyaratan SPJ wajib lengkap.");
    if (action === "revisi" && catatan.trim().length < 3)
      throw new Error("Catatan kekurangan wajib diisi.");
    const status =
      action === "mulai"
        ? "Validasi SPJ"
        : action === "revisi"
          ? "SPJ Perlu Dilengkapi"
          : "Validasi SPJ Selesai";
    const updated: Spj = { ...target, checklist, catatan, status };
    put(items.map((x) => (x.id === spjId ? updated : x)));
    return updated;
  },
  generate: async (
    spjId: string,
    jenis: JenisDokumen,
    context: ChainContext,
  ) => {
    const items = get();
    const target = items.find((x) => x.id === spjId);
    if (!target) throw new Error("SPJ tidak ditemukan.");
    if (target.status !== "Validasi SPJ Selesai")
      throw new Error("Validasi SPJ belum selesai.");
    if (target.dokumen.some((x) => x.jenis === jenis))
      throw new Error(`${jenis} sudah dibuat.`);
    const documents = buildFinancialDocuments(items, target, spjId, jenis, context);
    const updated = {
      ...target,
      dokumen: [...target.dokumen, ...documents],
    };
    put(items.map((x) => (x.id === spjId ? updated : x)));
    return documents[0];
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
    if (target.status !== "Validasi SPJ Selesai")
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
      dokumen: [...retainedDocuments, ...documents],
    };
    put(items.map((x) => (x.id === spjId ? updated : x)));
    return documents;
  },
};
