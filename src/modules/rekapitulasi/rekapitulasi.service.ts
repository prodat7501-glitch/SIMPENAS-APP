import type { DokumenKeuangan, Spj } from "@/modules/keuangan/keuangan.schema";
import type { Pegawai } from "@/modules/pegawai/pegawai.schema";
import type { Sppd } from "@/modules/sppd/sppd.schema";
import type { Spt } from "@/modules/spt/spt.schema";
import { downloadBlobFile, requestDownloadFileName } from "@/lib/download-file";
import { useActivityStore } from "@/stores/activity.store";
import type { ChartPoint, RekapFilters, RekapRow } from "./rekapitulasi.types";

const monthLabel = (date: string) =>
  new Intl.DateTimeFormat("id-ID", { month: "short", year: "numeric" }).format(
    new Date(date),
  );

interface KuitansiCandidate {
  document: DokumenKeuangan;
  spj: Spj;
}

const isCompletedPayment = (document: DokumenKeuangan) =>
  document.status === "Selesai" &&
  Boolean(document.pembayaran?.tanggalPembayaran);

const resolveKuitansi = (
  candidates: KuitansiCandidate[],
  sppd: Sppd,
  spt: Spt | undefined,
  pegawaiId: string,
  sppds: Sppd[],
) => {
  const scored = candidates.flatMap((candidate) => {
    const { document, spj } = candidate;
    if (!document.rincian.some((row) => row.pegawaiId === pegawaiId)) {
      return [];
    }

    const documentSppd = sppds.find((item) => item.id === document.sppdId);
    const spjSppd = sppds.find((item) => item.id === spj.sppdId);
    let relationScore = 0;

    if (document.sppdId === sppd.id) relationScore = 50;
    else if (document.sptId && document.sptId === sppd.sptId) {
      relationScore = 40;
    } else if (documentSppd?.sptId === sppd.sptId) relationScore = 30;
    else if (spjSppd?.sptId === sppd.sptId) relationScore = 20;
    else if (
      document.notaDinasId &&
      document.notaDinasId === spt?.notaDinasId
    ) {
      relationScore = 10;
    }

    if (!relationScore) return [];

    return [
      {
        ...candidate,
        score: relationScore + (isCompletedPayment(document) ? 100 : 0),
      },
    ];
  });

  return scored.sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    return (
      right.document.pembayaran?.tanggalPembayaran ?? right.document.tanggal
    ).localeCompare(
      left.document.pembayaran?.tanggalPembayaran ?? left.document.tanggal,
    );
  })[0]?.document;
};

export function buildRekap(
  sppds: Sppd[],
  pegawais: Pegawai[],
  spjs: Spj[],
  spts: Spt[],
): RekapRow[] {
  const kuitansi = spjs.flatMap((spj) =>
    spj.dokumen.flatMap((document) =>
      document.jenis === "Kuitansi" ? [{ document, spj }] : [],
    ),
  );

  return sppds.flatMap((sppd) =>
    sppd.personil.map(({ pegawaiId }, index) => {
      const employee = pegawais.find((x) => x.id === pegawaiId);
      const spt = spts.find((item) => item.id === sppd.sptId);
      const receipt = resolveKuitansi(kuitansi, sppd, spt, pegawaiId, sppds);
      const paymentRow = receipt?.rincian.find(
        (row) => row.pegawaiId === pegawaiId,
      );
      const paid = Boolean(receipt && isCompletedPayment(receipt));
      const paymentDate = paid
        ? receipt?.pembayaran?.tanggalPembayaran
        : undefined;
      return {
        id: `${sppd.id}-${pegawaiId}-${index}`,
        sppdId: sppd.id ?? "",
        nomorSppd: sppd.nomor,
        pegawaiId,
        namaPegawai: employee?.nama ?? pegawaiId,
        tujuan: sppd.tempatTujuan,
        tanggalBerangkat: sppd.tanggalBerangkat,
        tanggalKembali: sppd.tanggalKembali,
        jumlahHari: sppd.lamaPerjalanan,
        biaya: paid ? (paymentRow?.jumlah ?? receipt.total) : 0,
        status: paid
          ? "Pembayaran Selesai"
          : receipt
            ? "Menunggu Pembayaran"
            : sppd.status,
        bulan: monthLabel(sppd.tanggalBerangkat),
        bulanPembayaran: paymentDate ? monthLabel(paymentDate) : "",
      };
    }),
  );
}
export function filterRekap(rows: RekapRow[], filters: RekapFilters) {
  return rows.filter(
    (x) =>
      (!filters.dari || x.tanggalBerangkat >= filters.dari) &&
      (!filters.sampai || x.tanggalKembali <= filters.sampai) &&
      (!filters.pegawaiId || x.pegawaiId === filters.pegawaiId) &&
      (!filters.tujuan ||
        x.tujuan.toLowerCase().includes(filters.tujuan.toLowerCase())),
  );
}
export function chartRekap(rows: RekapRow[]): ChartPoint[] {
  const map = new Map<string, ChartPoint>();
  rows.forEach((x) => {
    const travelPoint = map.get(x.bulan) ?? {
      label: x.bulan,
      perjalanan: 0,
      hari: 0,
      biaya: 0,
    };
    travelPoint.perjalanan += 1;
    travelPoint.hari += x.jumlahHari;
    map.set(x.bulan, travelPoint);

    if (x.biaya > 0 && x.bulanPembayaran) {
      const paymentPoint = map.get(x.bulanPembayaran) ?? {
        label: x.bulanPembayaran,
        perjalanan: 0,
        hari: 0,
        biaya: 0,
      };
      paymentPoint.biaya += x.biaya;
      map.set(x.bulanPembayaran, paymentPoint);
    }
  });
  return [...map.values()];
}
export function exportExcel(rows: RekapRow[]) {
  const esc = (value: string | number) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  const headers = [
    "Nomor SPPD",
    "Pegawai",
    "Tujuan",
    "Tanggal Berangkat",
    "Tanggal Kembali",
    "Jumlah Hari",
    "Total Biaya",
    "Status",
  ];
  const body = rows
    .map(
      (x) =>
        `<tr>${[x.nomorSppd, x.namaPegawai, x.tujuan, x.tanggalBerangkat, x.tanggalKembali, x.jumlahHari, x.biaya, x.status].map((v) => `<td>${esc(v)}</td>`).join("")}</tr>`,
    )
    .join("");
  const html = `<html><head><meta charset="UTF-8"></head><body><table><thead><tr>${headers.map((x) => `<th>${x}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></body></html>`;
  const fileName = requestDownloadFileName(
    `rekapitulasi-${new Date().toISOString().slice(0, 10)}`,
    "xls",
  );

  if (!fileName) {
    return;
  }

  downloadBlobFile(
    new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" }),
    fileName,
  );
  useActivityStore.getState().add({
    action: "Export",
    module: "Rekapitulasi",
    description: `Export Excel ${fileName} berisi ${rows.length} baris`,
    user: "Pengguna aktif",
  });
}
