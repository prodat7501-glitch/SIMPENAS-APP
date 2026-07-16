"use client";
import { PrintPreview } from "@/components/ui/print-preview";
import type { RekapRow } from "../rekapitulasi.types";
import { formatRupiah } from "@/lib/formatters";
export function RekapPrintPreview({
  open,
  rows,
  onClose,
}: {
  open: boolean;
  rows: RekapRow[];
  onClose: () => void;
}) {
  return (
    <PrintPreview
      isOpen={open}
      onClose={onClose}
      title="Export PDF Rekapitulasi"
    >
      <header className="text-center border-b-2 border-black pb-3">
        <h2 className="font-bold">KOMISI PEMILIHAN UMUM</h2>
        <h1 className="text-lg font-black">KABUPATEN GORONTALO</h1>
      </header>
      <div className="text-center my-6">
        <h2 className="font-black underline">REKAPITULASI PERJALANAN DINAS</h2>
        <p className="text-xs">
          Dicetak: {new Date().toLocaleDateString("id-ID")}
        </p>
      </div>
      <table className="w-full border-collapse text-[9px]">
        <thead>
          <tr>
            {[
              "No",
              "SPPD",
              "Pegawai",
              "Tujuan",
              "Tanggal",
              "Hari",
              "Biaya",
              "Status",
            ].map((x) => (
              <th key={x} className="border border-black p-1">
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((x, i) => (
            <tr key={x.id}>
              <td className="border border-black p-1">{i + 1}</td>
              <td className="border border-black p-1">{x.nomorSppd}</td>
              <td className="border border-black p-1">{x.namaPegawai}</td>
              <td className="border border-black p-1">{x.tujuan}</td>
              <td className="border border-black p-1">
                {x.tanggalBerangkat} – {x.tanggalKembali}
              </td>
              <td className="border border-black p-1 text-center">
                {x.jumlahHari}
              </td>
              <td className="border border-black p-1 text-right">
                {formatRupiah(x.biaya)}
              </td>
              <td className="border border-black p-1">{x.status}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td
              colSpan={5}
              className="border border-black p-1 font-bold text-right"
            >
              TOTAL
            </td>
            <td className="border border-black p-1 font-bold text-center">
              {rows.reduce((s, x) => s + x.jumlahHari, 0)}
            </td>
            <td className="border border-black p-1 font-bold text-right">
              {formatRupiah(rows.reduce((s, x) => s + x.biaya, 0))}
            </td>
            <td className="border border-black" />
          </tr>
        </tfoot>
      </table>
    </PrintPreview>
  );
}
