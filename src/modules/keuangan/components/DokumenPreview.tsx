"use client";

import Image from "next/image";
import { PrintPreview } from "@/components/ui/print-preview";
import { DocumentTemplate } from "@/components/document/DocumentTemplate";
import { useDocumentTemplate } from "@/providers/TemplateProvider";
import type { DIPA } from "@/modules/dipa/dipa.schema";
import type { Jabatan } from "@/modules/jabatan/jabatan.schema";
import type { Laporan } from "@/modules/laporan/laporan.schema";
import type { NotaDinas } from "@/modules/nota-dinas/nota-dinas.schema";
import type { Pangkat } from "@/modules/pangkat/pangkat.schema";
import type { Pegawai } from "@/modules/pegawai/pegawai.schema";
import type { Penandatangan } from "@/modules/penandatangan/penandatangan.schema";
import type { Sppd } from "@/modules/sppd/sppd.schema";
import type { Spt } from "@/modules/spt/spt.schema";
import type { DokumenKeuangan } from "../keuangan.schema";
import { formatRupiah, formatRupiahTerbilang } from "@/lib/formatters";

const formatTanggalIndonesia = (dateStr?: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatBulanTahunIndonesia = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatSpbyCurrency = (value: number) =>
  `Rp. ${new Intl.NumberFormat("id-ID").format(value)},00`;

const normalize = (value: string) => value.toLowerCase();

const findSigner = (items: Penandatangan[], keywords: string[]) =>
  items.find((item) => {
    const text = normalize(`${item.jabatanPenandatangan} ${item.peran}`);
    return item.status === "Aktif" && keywords.some((key) => text.includes(key));
  });

function SignatureName({
  name,
  nip,
}: {
  name: string;
  nip?: string;
}) {
  return (
    <div className="space-y-0.5">
      <p className="font-semibold underline underline-offset-2">{name}</p>
      {nip && <p>NIP. {nip}</p>}
    </div>
  );
}

function SpbyPreview({
  document,
  pegawais,
  penandatangans,
  spts,
  sppds,
  reports,
  dipas,
}: {
  document: DokumenKeuangan;
  pegawais: Pegawai[];
  penandatangans: Penandatangan[];
  spts: Spt[];
  sppds: Sppd[];
  reports: Laporan[];
  notas: NotaDinas[];
  dipas: DIPA[];
}) {
  const template = useDocumentTemplate();
  const rincian = document.rincian[0];
  const penerima = pegawais.find((item) => item.id === rincian?.pegawaiId);
  const sppd = sppds.find((item) => item.id === document.sppdId);
  const spt = spts.find((item) => item.id === document.sptId);
  const laporan = reports.find((item) => item.id === document.laporanId);
  const dipa = dipas.find((item) => item.kodeDipa === document.mak);
  const bendahara = findSigner(penandatangans, ["bendahara"]);
  const ppk = findSigner(penandatangans, [
    "ppk",
    "pejabat pembuat komitmen",
  ]);
  const jumlah = rincian?.jumlah ?? document.total;
  const tanggalDokumen = formatTanggalIndonesia(document.tanggal);
  const bulanTahunDokumen = formatBulanTahunIndonesia(document.tanggal);
  const tujuan = sppd?.tempatTujuan ?? laporan?.tempatPelaksanaan ?? "-";
  const uraian =
    sppd?.maksud ||
    laporan?.maksud ||
    "Melaksanakan perjalanan dinas sesuai dokumen perjalanan dinas.";
  const dasarPembayaran = [
    `Bayar Biaya Perjalanan dinas dalam rangka ${uraian}`,
    `di ${tujuan}${sppd?.lamaPerjalanan ? ` selama ${sppd.lamaPerjalanan} hari` : ""}`,
    sppd?.tanggalBerangkat
      ? `pada tanggal ${formatTanggalIndonesia(sppd.tanggalBerangkat)}.`
      : "",
    spt?.nomor
      ? `Sesuai dengan SPT Nomor ${spt.nomor}, tanggal ${formatTanggalIndonesia(spt.tanggalMulai)}`
      : "",
    sppd?.nomor
      ? `dan SPD Nomor ${sppd.nomor} Tanggal ${formatTanggalIndonesia(sppd.tanggalBerangkat)}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="-m-[20mm] bg-white p-0 text-[13px] leading-[1.25] text-black print:m-0">
      <div className="min-h-[297mm] border border-black">
        <header className="border-b border-black">
          <div className="grid grid-cols-[95px_1fr_95px] items-center px-2 pb-4 pt-5">
            <div className="flex justify-center">
              <Image
                src={template.logo}
                alt="Logo KPU"
                width={76}
                height={76}
                className="h-[76px] w-[76px] object-contain"
              />
            </div>
            <div className="space-y-2 text-center">
              <h1 className="text-[22px] font-black uppercase tracking-wide">
                KOMISI PEMILIHAN UMUM
              </h1>
              <p className="text-[22px] font-black uppercase tracking-wide">
                KABUPATEN GORONTALO
              </p>
              <p className="pt-4 text-[15px] italic">
                Alamat : {template.alamat}
              </p>
            </div>
            <div />
          </div>
          <div className="flex justify-between px-1 pb-1 text-[14px] italic">
            <span>Telp. ( 0435 ) 881101-881078</span>
            <span>Fax ( 0435 ) 881101</span>
          </div>
        </header>

        <section className="border-b border-black py-9 text-center">
          <h2 className="text-[22px] font-black uppercase underline underline-offset-2">
            Surat Perintah Bayar
          </h2>
          <div className="mt-1 flex justify-center gap-40 text-[15px]">
            <span>Tanggal : {tanggalDokumen}</span>
            <span>Nomor : {document.nomor}</span>
          </div>
        </section>

        <section className="border-b-4 border-double border-black">
          <div className="border-b border-black px-1 py-2 text-[14px]">
            <p>
              Saya yang bertanda tangan di bawah ini selaku Pejabat Pembuat
              Komitmen memerintahkan Bendahara Pengeluaran
            </p>
            <p>
              agar melakukan pembayaran sejumlah :{" "}
              <span className="font-black italic">
                {formatSpbyCurrency(jumlah)}
              </span>
            </p>
          </div>
          <p className="px-2 py-2 text-[14px]">
            {formatRupiahTerbilang(jumlah)}
          </p>
        </section>

        <main className="min-h-[510px] border-b-4 border-black px-1 py-7">
          <div className="grid grid-cols-[150px_12px_1fr] gap-x-3 text-[14px]">
            <p>Kepada</p>
            <p>:</p>
            <p className="font-semibold uppercase">
              {penerima?.nama ?? "Penerima belum tersedia"}
            </p>

            <p>Untuk pembayaran</p>
            <p>:</p>
            <p className="text-justify">{dasarPembayaran}</p>
          </div>

          <div className="mt-32 text-[14px]">
            <p>Atas dasar :</p>
            <div className="mt-6 grid grid-cols-[24px_360px_12px_1fr] gap-y-3">
              <span className="text-center">1.</span>
              <span>Kuitansi / bukti pembelian</span>
              <span>:</span>
              <span>................................................</span>
              <span className="text-center">2.</span>
              <span>Nota/ bukti penerimaan barang / jasa /</span>
              <span>:</span>
              <span>................................................</span>
              <span />
              <span>( bukti lainnya )</span>
              <span />
              <span />
            </div>
          </div>

          <div className="mt-20 text-[14px]">
            <p>Dibebankan pada :</p>
            <div className="grid grid-cols-[165px_12px_1fr]">
              <p>
                Kegiatan, <i>output, MAK</i>
              </p>
              <p>:</p>
              <p>{dipa?.program ?? document.anggaran}</p>
              <p>Kode</p>
              <p>:</p>
              <p>{document.mak}</p>
            </div>
          </div>
        </main>

        <footer className="grid grid-cols-3 gap-8 px-1 pt-2 text-[14px]">
          <div>
            <p>Setuju/lunas dibayar,</p>
            <p>tanggal {bulanTahunDokumen}</p>
            <p className="mt-2">Bendahara Pengeluaran</p>
            <div className="h-24" />
            <SignatureName
              name={bendahara?.nama ?? "Bendahara Pengeluaran"}
              nip={bendahara?.nip}
            />
          </div>
          <div>
            <p>Diterima tanggal {bulanTahunDokumen}</p>
            <p className="mt-8">Penerima Uang/Uang Muka Kerja</p>
            <div className="h-28" />
            <SignatureName name={penerima?.nama ?? "Penerima"} />
          </div>
          <div>
            <p>Limboto, {bulanTahunDokumen}</p>
            <p>a.n Kuasa Pengguna Anggaran</p>
            <p>Pejabat Pembuat Komitmen</p>
            <div className="h-24" />
            <SignatureName
              name={ppk?.nama ?? "Pejabat Pembuat Komitmen"}
              nip={ppk?.nip}
            />
          </div>
        </footer>
      </div>
    </div>
  );
}

export function DokumenPreview({
  document,
  pegawais,
  jabatans,
  pangkats,
  penandatangans = [],
  spts = [],
  sppds = [],
  reports = [],
  notas = [],
  dipas = [],
  onClose,
}: {
  document: DokumenKeuangan | null;
  pegawais: Pegawai[];
  jabatans: Jabatan[];
  pangkats: Pangkat[];
  penandatangans?: Penandatangan[];
  spts?: Spt[];
  sppds?: Sppd[];
  reports?: Laporan[];
  notas?: NotaDinas[];
  dipas?: DIPA[];
  onClose: () => void;
}) {
  if (!document) return null;
  const name = (id: string) => pegawais.find((x) => x.id === id)?.nama ?? "-";
  const jabatan = (id: string) => {
    const p = pegawais.find((x) => x.id === id);
    return jabatans.find((x) => x.id === p?.jabatanId)?.nama ?? "-";
  };
  const pangkat = (id: string) => {
    const p = pegawais.find((x) => x.id === id);
    const g = pangkats.find((x) => x.id === p?.pangkatId);
    return g ? `${g.namaPangkat} / ${g.golongan}` : "-";
  };

  return (
    <PrintPreview
      isOpen
      title={`Pratinjau ${document.jenis}`}
      onClose={onClose}
      className={document.jenis === "SPBY" ? "p-[8mm]" : undefined}
    >
      {document.jenis === "SPBY" ? (
        <SpbyPreview
          document={document}
          pegawais={pegawais}
          penandatangans={penandatangans}
          spts={spts}
          sppds={sppds}
          reports={reports}
          notas={notas}
          dipas={dipas}
        />
      ) : (
        <DocumentTemplate>
          <div className="my-6 text-center">
            <h2 className="font-black underline">
              {document.jenis.toUpperCase()}
            </h2>
            <p className="text-xs">Nomor: {document.nomor}</p>
          </div>
          <section className="mb-4 grid grid-cols-2 gap-2 text-[10px]">
            <p>
              <b>Nota Dinas ID:</b> {document.notaDinasId}
            </p>
            <p>
              <b>SPT ID:</b> {document.sptId}
            </p>
            <p>
              <b>SPPD ID:</b> {document.sppdId}
            </p>
            <p>
              <b>Laporan ID:</b> {document.laporanId}
            </p>
            {document.parentDocumentId && (
              <p className="col-span-2">
                <b>Dokumen Induk:</b> {document.parentDocumentId}
              </p>
            )}
          </section>
          {document.jenis === "Kuitansi" && (
            <section className="space-y-4 border-2 border-black p-6 text-sm">
              <p>
                <b>Sudah terima dari:</b> Bendahara Pengeluaran KPU Kabupaten
                Gorontalo
              </p>
              <p>
                <b>Jumlah uang:</b> {formatRupiah(document.total)}
              </p>
              <p>
                <b>Terbilang:</b> {formatRupiahTerbilang(document.total)}
              </p>
              <p>
                <b>Untuk pembayaran:</b> Biaya perjalanan dinas sesuai dokumen{" "}
                {document.nomor}
              </p>
            </section>
          )}
          {["Daftar Nominatif", "Tanda Terima"].includes(document.jenis) && (
            <h3 className="mb-3 text-sm font-bold">
              {document.jenis === "Daftar Nominatif"
                ? `Tahun ${document.tahun} - MAK ${document.mak}`
                : "Perincian Biaya Perjalanan Dinas"}
            </h3>
          )}
          <table className="mt-6 w-full border-collapse text-[10px]">
            <thead>
              <tr>
                {[
                  "No",
                  "Nama Penerima",
                  ...(document.jenis === "Daftar Nominatif"
                    ? [
                        "Jabatan",
                        "Pangkat/Gol",
                        "Transport",
                        "Harian",
                        "Penginapan",
                      ]
                    : []),
                  "Jumlah",
                  "Tanda Tangan",
                ].map((h) => (
                  <th key={h} className="border border-black p-1">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {document.rincian.map((r, i) => (
                <tr key={`${r.pegawaiId}-${i}`}>
                  <td className="border border-black p-1">{i + 1}</td>
                  <td className="border border-black p-1">
                    {name(r.pegawaiId)}
                  </td>
                  {document.jenis === "Daftar Nominatif" && (
                    <>
                      <td className="border border-black p-1">
                        {jabatan(r.pegawaiId)}
                      </td>
                      <td className="border border-black p-1">
                        {pangkat(r.pegawaiId)}
                      </td>
                      <td className="border border-black p-1 text-right">
                        {formatRupiah(r.uangTransport)}
                      </td>
                      <td className="border border-black p-1 text-right">
                        {formatRupiah(r.uangHarian)}
                      </td>
                      <td className="border border-black p-1 text-right">
                        {formatRupiah(r.penginapan)}
                      </td>
                    </>
                  )}
                  <td className="border border-black p-1 text-right">
                    {formatRupiah(r.jumlah)}
                  </td>
                  <td className="border border-black p-1">{i + 1}. ........</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={document.jenis === "Daftar Nominatif" ? 7 : 2}
                  className="border border-black p-1 text-right font-bold"
                >
                  TOTAL
                </td>
                <td className="border border-black p-1 text-right font-bold">
                  {formatRupiah(document.total)}
                </td>
                <td className="border border-black" />
              </tr>
            </tfoot>
          </table>
          <footer className="mt-12 grid grid-cols-2 text-center text-sm">
            <div>
              <p>Bendahara Pengeluaran</p>
              <div className="h-20" />
              <p className="font-bold underline">________________</p>
            </div>
            <div>
              <p>Gorontalo, {document.tanggal}</p>
              <p>Pejabat Pembuat Komitmen</p>
              <div className="h-16" />
              <p className="font-bold underline">________________</p>
            </div>
          </footer>
        </DocumentTemplate>
      )}
    </PrintPreview>
  );
}
