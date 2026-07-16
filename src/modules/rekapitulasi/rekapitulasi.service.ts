import type { Spj } from "@/modules/keuangan/keuangan.schema";
import type { NotaDinas } from "@/modules/nota-dinas/nota-dinas.schema";
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
export function buildRekap(
  sppds: Sppd[],
  pegawais: Pegawai[],
  notas: NotaDinas[],
  spjs: Spj[],
  spts: Spt[],
): RekapRow[] {
  return sppds.flatMap((sppd) =>
    sppd.personil.map(({ pegawaiId }, index) => {
      const employee = pegawais.find((x) => x.id === pegawaiId);
      const spt = spts.find((item) => item.id === sppd.sptId);
      const note = notas.find((item) => item.id === spt?.notaDinasId);
      const detail = note?.lampiran.find((x) => x.pegawaiId === pegawaiId);
      const paid = spjs.some(
        (x) =>
          x.sppdId === sppd.id && x.dokumen.some((d) => d.jenis === "Kuitansi"),
      );
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
        biaya: paid ? (detail?.total ?? 0) : 0,
        status: paid ? "Pembayaran Selesai" : sppd.status,
        bulan: monthLabel(sppd.tanggalBerangkat),
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
    const current = map.get(x.bulan) ?? {
      label: x.bulan,
      perjalanan: 0,
      hari: 0,
      biaya: 0,
    };
    current.perjalanan += 1;
    current.hari += x.jumlahHari;
    current.biaya += x.biaya;
    map.set(x.bulan, current);
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
