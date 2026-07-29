"use client";
import { useCallback, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useKeuangan } from "@/modules/keuangan/useKeuangan";
import { useLaporan } from "@/modules/laporan/useLaporan";
import { useNotaDinas } from "@/modules/nota-dinas/useNotaDinas";
import { usePegawai } from "@/modules/pegawai/usePegawai";
import { sortByPegawaiOrder } from "@/modules/pegawai/pegawai-order";
import { useSppd } from "@/modules/sppd/useSppd";
import { useSpt } from "@/modules/spt/useSpt";
import {
  downloadGeneratedPdf,
  type PdfDocumentInput,
} from "@/lib/document-pdf";
import { formatRupiah, formatTableDate } from "@/lib/formatters";
import { useDocumentTemplate } from "@/providers/TemplateProvider";

type ArchiveDoc = {
  id: string;
  nomor: string;
  jenis: string;
  tanggal: string;
  status: string;
  buildPdf: () => PdfDocumentInput;
};

export default function DokumenPage() {
  const template = useDocumentTemplate();
  const { items: laporan, isLoading: laporanLoading } = useLaporan();
  const { items: sppd } = useSppd();
  const { items: spt } = useSpt();
  const { items: notaDinas } = useNotaDinas();
  const { items: pegawai } = usePegawai();
  const { items: spj } = useKeuangan(laporan, undefined, !laporanLoading);
  const [search, setSearch] = useState("");
  const [jenis, setJenis] = useState("");
  const getPegawai = useCallback(
    (pegawaiId: string) =>
      pegawai.find((item) => item.id === pegawaiId)?.nama ?? pegawaiId,
    [pegawai],
  );
  const docs = useMemo(
    (): ArchiveDoc[] => [
      ...sppd.map((x) => {
        const relatedSpt = spt.find((item) => item.id === x.sptId);
        const relatedNota = notaDinas.find(
          (item) => item.id === relatedSpt?.notaDinasId,
        );
        return {
          id: x.id!,
          nomor: x.nomor,
          jenis: "SPPD",
          tanggal: x.tanggalBerangkat,
          status: x.status,
          buildPdf: () => ({
            title: "Surat Perintah Perjalanan Dinas",
            subtitle: `Nomor: ${x.nomor}`,
            filename: `SPPD-${x.nomor}`,
            template,
            sections: [
              {
                title: "Referensi Dokumen",
                lines: [
                  `SPPD ID: ${x.id ?? "-"}`,
                  `SPT: ${relatedSpt?.nomor ?? x.sptId}`,
                  `Nota Dinas: ${relatedNota?.nomor ?? "-"}`,
                ],
              },
              {
                title: "Data Perjalanan",
                lines: [
                  `Maksud: ${x.maksud}`,
                  `Transportasi: ${x.transportasi}`,
                  `Berangkat: ${x.tempatBerangkat}`,
                  `Tujuan: ${x.tempatTujuan}`,
                  `Tanggal: ${x.tanggalBerangkat} s.d. ${x.tanggalKembali}`,
                  `Lama Perjalanan: ${x.lamaPerjalanan} hari`,
                  `Personil: ${sortByPegawaiOrder(
                    x.personil,
                    (person) => person.pegawaiId,
                    pegawai,
                  )
                    .map((p) => getPegawai(p.pegawaiId))
                    .join(", ")}`,
                ],
              },
            ],
          }),
        };
      }),
      ...laporan.map((x) => {
        const relatedSppd = sppd.find((item) => item.id === x.sppdId);
        return {
          id: x.id!,
          nomor: sppd.find((s) => s.id === x.sppdId)?.nomor ?? x.id!,
          jenis: "Laporan",
          tanggal: x.tanggalLaporan,
          status: x.status,
          buildPdf: () => ({
            title: "Laporan Perjalanan Dinas",
            subtitle: `Referensi SPPD: ${relatedSppd?.nomor ?? x.sppdId}`,
            filename: `Laporan-${relatedSppd?.nomor ?? x.id}`,
            template,
            sections: [
              {
                title: "Identitas",
                lines: [
                  `Laporan ID: ${x.id ?? "-"}`,
                  `SPPD ID: ${x.sppdId}`,
                  `Pelaksana: ${getPegawai(x.pelaksanaId)}`,
                  `Tanggal Laporan: ${x.tanggalLaporan}`,
                ],
              },
              {
                title: "Uraian",
                lines: [
                  `Dasar: ${x.dasarPelaksanaan}`,
                  `Maksud: ${x.maksud}`,
                  `Tujuan: ${x.tujuan}`,
                  `Tempat/Waktu: ${x.tempatWaktu}`,
                  `Materi: ${x.materi}`,
                  `Hasil: ${x.hasilPelaksanaan}`,
                  `Dokumentasi: ${x.dokumentasi.length} foto`,
                ],
              },
            ],
          }),
        };
      }),
      ...spj.flatMap((x) =>
        x.dokumen.map((d) => ({
          id: d.id,
          nomor: d.nomor,
          jenis: d.jenis,
          tanggal: d.tanggal,
          status: d.status,
          buildPdf: () => ({
            title: d.jenis,
            subtitle: `Nomor: ${d.nomor}`,
            filename: `${d.jenis}-${d.nomor}`,
            template,
            sections: [
              {
                title: "Referensi Dokumen",
                lines: [
                  `SPJ ID: ${d.spjId}`,
                  `Laporan ID: ${d.laporanId}`,
                  `SPPD ID: ${d.sppdId}`,
                  `SPT ID: ${d.sptId}`,
                  `Nota Dinas ID: ${d.notaDinasId}`,
                  `Dokumen Induk: ${d.parentDocumentId ?? "-"}`,
                ],
              },
              {
                title: "Anggaran",
                lines: [
                  `Tahun: ${d.tahun}`,
                  `Anggaran: ${d.anggaran}`,
                  `MAK: ${d.mak}`,
                  `Total: ${formatRupiah(d.total)}`,
                ],
              },
              {
                title: "Rincian Penerima",
                lines: sortByPegawaiOrder(
                  d.rincian,
                  (row) => row.pegawaiId,
                  pegawai,
                ).map(
                  (r, index) =>
                    `${index + 1}. ${getPegawai(r.pegawaiId)} - Transport ${formatRupiah(r.uangTransport)}, Harian ${formatRupiah(r.uangHarian)}, Penginapan ${formatRupiah(r.penginapan)}, Jumlah ${formatRupiah(r.jumlah)}`,
                ),
              },
            ],
          }),
        })),
      ),
    ],
    [sppd, spt, notaDinas, laporan, spj, pegawai, getPegawai, template],
  );
  const rows = docs.filter(
    (x) =>
      (!search || x.nomor.toLowerCase().includes(search.toLowerCase())) &&
      (!jenis || x.jenis === jenis),
  );
  const download = (doc: (typeof docs)[number]) => {
    downloadGeneratedPdf(doc.buildPdf());
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold">Manajemen Dokumen</h1>
        <p className="text-xs text-muted-foreground">
          Arsip digital dokumen perjalanan dinas dan keuangan.
        </p>
      </div>
      <div className="grid md:grid-cols-[1fr_220px] gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nomor dokumen..."
          leftIcon={<Search className="w-4 h-4" />}
        />
        <Select value={jenis} onChange={(e) => setJenis(e.target.value)}>
          <option value="">Semua Jenis</option>
          {[...new Set(docs.map((x) => x.jenis))].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </Select>
      </div>
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Download</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((x) => (
              <TableRow key={`${x.jenis}-${x.id}`}>
                <TableCell className="font-mono font-bold">{x.nomor}</TableCell>
                <TableCell>{x.jenis}</TableCell>
                <TableCell>{formatTableDate(x.tanggal)}</TableCell>
                <TableCell>
                  <Badge variant="info">{x.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => download(x)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
