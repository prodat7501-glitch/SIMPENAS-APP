"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { PrintPreview } from "@/components/ui/print-preview";
import { useDocumentTemplate } from "@/providers/TemplateProvider";
import type { DIPA } from "@/modules/dipa/dipa.schema";
import type { Jabatan } from "@/modules/jabatan/jabatan.schema";
import type { Laporan } from "@/modules/laporan/laporan.schema";
import type { NotaDinas } from "@/modules/nota-dinas/nota-dinas.schema";
import { getLampiranCostLines } from "@/modules/nota-dinas/nota-dinas-calculation";
import type { Pangkat } from "@/modules/pangkat/pangkat.schema";
import type { Pegawai } from "@/modules/pegawai/pegawai.schema";
import { sortByPegawaiOrder } from "@/modules/pegawai/pegawai-order";
import type { Penandatangan } from "@/modules/penandatangan/penandatangan.schema";
import { snapshotToPenandatangan } from "@/modules/penandatangan/penandatangan.service";
import type { Sppd } from "@/modules/sppd/sppd.schema";
import type { Spt } from "@/modules/spt/spt.schema";
import type { DokumenKeuangan, RincianKeuangan } from "../keuangan.schema";
import { formatRupiahTerbilang } from "@/lib/formatters";
import { buildFinancialDocumentDescription } from "../keuangan-document-description";

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

const formatNominatifCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID").format(value);

const formatKuitansiCurrency = (value: number) =>
  `Rp ${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;

const normalize = (value: string) => value.toLowerCase();

const findSigner = (items: Penandatangan[], keywords: string[]) =>
  items.find((item) => {
    const text = normalize(`${item.jabatanPenandatangan} ${item.peran}`);
    return (
      item.status === "Aktif" && keywords.some((key) => text.includes(key))
    );
  });

const isKomisionerKpu = (pegawai?: Pegawai) => {
  const kategori = normalize(pegawai?.kategoriPegawai ?? "");
  return (
    kategori.includes("komisioner") ||
    kategori.includes("ketua kpu") ||
    kategori.includes("anggota kpu")
  );
};

const getRecipientNip = (pegawai?: Pegawai) =>
  pegawai && !isKomisionerKpu(pegawai) && pegawai.nip ? pegawai.nip : undefined;

const getAutoScaleFontSize = (
  name: string,
  maxWidthMm: number,
  maxFontSizePt = 11.5,
  minFontSizePt = 6,
) => {
  const availableWidthPt = maxWidthMm * (72 / 25.4);
  const estimatedFontSize =
    availableWidthPt / (Math.max(name.length, 1) * 0.62);
  return Math.min(maxFontSizePt, Math.max(minFontSizePt, estimatedFontSize));
};

function SignatureName({ name, nip }: { name: string; nip?: string }) {
  return (
    <div className="space-y-0.5">
      <p className="font-semibold underline underline-offset-2">{name}</p>
      {nip && <p>NIP. {nip}</p>}
    </div>
  );
}

function AutoScaleSignatureName({
  name,
  nip,
  maxNameWidthMm,
}: {
  name: string;
  nip?: string;
  maxNameWidthMm: number;
}) {
  return (
    <div className="space-y-0.5 overflow-hidden">
      <p
        className="whitespace-nowrap font-semibold underline underline-offset-2"
        style={{
          width: `${maxNameWidthMm}mm`,
          fontSize: `${getAutoScaleFontSize(name, maxNameWidthMm, 11.5, 4)}pt`,
          lineHeight: "5mm",
        }}
      >
        {name}
      </p>
      {nip && <p className="whitespace-nowrap">NIP. {nip}</p>}
    </div>
  );
}

function RecipientSignature({
  recipient,
  fallback,
  maxNameWidthMm,
  align = "center",
}: {
  recipient?: Pegawai;
  fallback: string;
  maxNameWidthMm: number;
  align?: "left" | "center";
}) {
  const name = recipient?.nama ?? fallback;
  const nip = getRecipientNip(recipient);
  const isLeftAligned = align === "left";

  return (
    <div
      className={`space-y-0.5 ${isLeftAligned ? "text-left" : "text-center"}`}
    >
      <p
        className={`${isLeftAligned ? "" : "mx-auto"} whitespace-nowrap font-semibold underline underline-offset-2`}
        style={{
          width: `${maxNameWidthMm}mm`,
          fontSize: `${getAutoScaleFontSize(name, maxNameWidthMm)}pt`,
          height: "5mm",
          lineHeight: "5mm",
        }}
      >
        {name}
      </p>
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
  const ppk = findSigner(penandatangans, ["ppk", "pejabat pembuat komitmen"]);
  const jumlah = rincian?.jumlah ?? document.total;
  const tanggalDokumen = formatTanggalIndonesia(document.tanggal);
  const bulanTahunDokumen = formatBulanTahunIndonesia(document.tanggal);
  const dasarPembayaran = buildFinancialDocumentDescription({
    purpose: sppd?.maksud ?? laporan?.maksud,
    destination: sppd?.tempatTujuan ?? laporan?.tempatPelaksanaan,
    durationDays: sppd?.lamaPerjalanan,
    departureDate: sppd?.tanggalBerangkat,
    returnDate: sppd?.tanggalKembali,
    sptNumber: spt?.nomor,
    sptDate: spt?.tanggalMulai,
    sppdNumber: sppd?.nomor,
    sppdDate: sppd?.tanggalBerangkat,
  });

  return (
    <div className="spby-print-sheet bg-white text-[13px] leading-[1.25] text-black">
      <div className="spby-document">
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
              <p
                className="mx-auto whitespace-nowrap pt-4 italic"
                style={{
                  width: "125mm",
                  fontSize: `${getAutoScaleFontSize(
                    `Alamat : ${template.alamat}`,
                    125,
                    11.5,
                    7,
                  )}pt`,
                }}
              >
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
          <div className="mx-auto mt-1 grid w-fit grid-cols-[auto_auto] gap-x-[8mm] text-[15px]">
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

        <main className="spby-main border-b-4 border-black px-1 py-7">
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
              <p>{dipa?.akunPerjalananDinas ?? document.anggaran}</p>
              <p>Kode</p>
              <p>:</p>
              <p>{document.mak}</p>
            </div>
          </div>
        </main>

        <footer className="spby-signature-grid px-1 pt-2 text-[14px]">
          <div className="spby-signature-block">
            <div>
              <p>Setuju/lunas dibayar,</p>
              <p>tanggal {bulanTahunDokumen}</p>
            </div>
            <p>Bendahara Pengeluaran</p>
            <div aria-hidden="true" />
            <AutoScaleSignatureName
              name={bendahara?.nama ?? "Bendahara Pengeluaran"}
              nip={bendahara?.nip}
              maxNameWidthMm={58}
            />
          </div>
          <div className="spby-signature-block">
            <p>Diterima tanggal {bulanTahunDokumen}</p>
            <p>Penerima Uang/Uang Muka Kerja</p>
            <div aria-hidden="true" />
            <AutoScaleSignatureName
              name={penerima?.nama ?? "Penerima"}
              nip={getRecipientNip(penerima)}
              maxNameWidthMm={58}
            />
          </div>
          <div className="spby-signature-block">
            <p>Limboto, {bulanTahunDokumen}</p>
            <div>
              <p>a.n Kuasa Pengguna Anggaran</p>
              <p>Pejabat Pembuat Komitmen</p>
            </div>
            <div aria-hidden="true" />
            <AutoScaleSignatureName
              name={ppk?.nama ?? "Pejabat Pembuat Komitmen"}
              nip={ppk?.nip}
              maxNameWidthMm={58}
            />
          </div>
        </footer>
      </div>

      <style jsx global>{`
        .spby-print-sheet {
          box-sizing: border-box;
          width: 215mm;
          height: 330mm;
          overflow: hidden;
          padding: 8mm;
          font-family: Arial, Helvetica, sans-serif;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .spby-document {
          display: grid;
          grid-template-rows: auto auto auto minmax(0, 1fr) 62mm;
          width: 100%;
          height: 314mm;
          overflow: hidden;
        }
        .spby-main {
          min-height: 0;
          overflow: hidden;
        }
        .spby-signature-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          column-gap: 7mm;
          overflow: hidden;
        }
        .spby-signature-block {
          display: grid;
          grid-template-rows: 12mm 13mm 24mm 11mm;
          min-width: 0;
          align-content: start;
        }
        @page {
          size: 215mm 330mm;
          margin: 0;
        }
        @media print {
          .spby-print-preview {
            width: 215mm !important;
            min-height: 330mm !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
          .spby-print-preview > .pt-10 {
            padding-top: 0 !important;
          }
          .spby-print-sheet {
            width: 215mm !important;
            height: 330mm !important;
            overflow: hidden !important;
            break-inside: avoid;
            page-break-inside: avoid;
            break-after: avoid;
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}

type TandaTerimaCostItem = {
  key: string;
  label: string;
  quantity: number;
  unitAmount: number;
  total: number;
};

const buildTandaTerimaCosts = (
  lampiran: NotaDinas["lampiran"][number] | undefined,
  fallback: DokumenKeuangan["rincian"][number] | undefined,
  jenis: NotaDinas["jenis"] = "Luar Kota",
): TandaTerimaCostItem[] => {
  const uangHarian = lampiran
    ? getLampiranCostLines(lampiran, jenis)
        .filter(
          (item) =>
            (item.key === "uangHarian" || item.key === "uangHarianFull") &&
            item.subtotal > 0,
        )
        .map((item) => ({
          key: item.key,
          label: item.label,
          quantity: item.quantity,
          unitAmount: item.rate,
          total: item.subtotal,
        }))
    : [];
  const realisasi = [
    {
      key: "uangTransportHarian",
      label: "Uang Transport Harian",
      amount: fallback?.uangTransportHarian ?? 0,
    },
    {
      key: "penginapan",
      label: "Penginapan",
      amount: fallback?.penginapan ?? 0,
    },
    {
      key: "tiketPesawat",
      label: "Tiket Pesawat",
      amount: fallback?.tiketPesawat ?? 0,
    },
    {
      key: "transportBandaraAsal",
      label: "Transport Bandara Asal",
      amount: fallback?.transportBandaraAsal ?? 0,
    },
    {
      key: "transportBandaraTujuan",
      label: "Transport Bandara Tujuan",
      amount: fallback?.transportBandaraTujuan ?? 0,
    },
  ]
    .filter((item) => item.amount > 0)
    .map((item) => ({
      key: item.key,
      label: item.label,
      quantity: 1,
      unitAmount: item.amount,
      total: item.amount,
    }));

  if (uangHarian.length || realisasi.length) {
    return [...uangHarian, ...realisasi];
  }

  if (!lampiran) {
    const fallbackCosts = [
      {
        key: "uangTransport",
        label: "Uang Transport",
        amount: fallback?.uangTransport ?? 0,
      },
      {
        key: "uangHarian",
        label: "Uang Harian",
        amount: fallback?.uangHarian ?? 0,
      },
      {
        key: "penginapan",
        label: "Penginapan",
        amount: fallback?.penginapan ?? 0,
      },
    ];

    const available = fallbackCosts
      .filter((item) => item.amount > 0)
      .map((item) => ({
        key: item.key,
        label: item.label,
        quantity: 1,
        unitAmount: item.amount,
        total: item.amount,
      }));

    if (available.length || !fallback?.jumlah) return available;

    return [
      {
        key: "biayaPerjalanan",
        label: "Biaya Perjalanan Dinas",
        quantity: 1,
        unitAmount: fallback.jumlah,
        total: fallback.jumlah,
      },
    ];
  }

  return [];
};

function TandaTerimaPreview({
  document,
  pegawais,
  penandatangans,
  spts,
  sppds,
  reports,
  notas,
}: {
  document: DokumenKeuangan;
  pegawais: Pegawai[];
  penandatangans: Penandatangan[];
  spts: Spt[];
  sppds: Sppd[];
  reports: Laporan[];
  notas: NotaDinas[];
}) {
  const rincian = document.rincian[0];
  const penerima = pegawais.find((item) => item.id === rincian?.pegawaiId);
  const spt = spts.find((item) => item.id === document.sptId);
  const sppd =
    sppds.find(
      (item) =>
        item.sptId === document.sptId &&
        item.personil.some((person) => person.pegawaiId === rincian?.pegawaiId),
    ) ?? sppds.find((item) => item.id === document.sppdId);
  const laporan = reports.find((item) => item.id === document.laporanId);
  const nota = notas.find((item) => item.id === document.notaDinasId);
  const indexedLampiran = nota?.lampiran[rincian?.lampiranIndex ?? -1];
  const lampiran =
    indexedLampiran?.pegawaiId === rincian?.pegawaiId
      ? indexedLampiran
      : nota?.lampiran.find((item) => item.pegawaiId === rincian?.pegawaiId);
  const costs = buildTandaTerimaCosts(lampiran, rincian, nota?.jenis);
  const bendahara = findSigner(penandatangans, ["bendahara"]);
  const ppk = findSigner(penandatangans, ["ppk", "pejabat pembuat komitmen"]);
  const total = rincian?.jumlah ?? document.total;
  const tanggalPerjalanan = sppd?.tanggalBerangkat ?? document.tanggal;
  const keterangan = buildFinancialDocumentDescription({
    purpose: sppd?.maksud ?? laporan?.maksud ?? lampiran?.uraian,
    destination: sppd?.tempatTujuan ?? laporan?.tempatPelaksanaan,
    durationDays: sppd?.lamaPerjalanan,
    departureDate: sppd?.tanggalBerangkat ?? document.tanggal,
    returnDate: sppd?.tanggalKembali,
    sptNumber: spt?.nomor,
    sptDate: spt?.tanggalMulai,
    sppdNumber: sppd?.nomor,
    sppdDate: sppd?.tanggalBerangkat,
  });

  return (
    <div className="tanda-terima-print-sheet bg-white text-black">
      <div className="tanda-terima-document">
        <div className="tanda-terima-reference">
          <div className="grid grid-cols-[17mm_4mm_1fr]">
            <span>MAK</span>
            <span>:</span>
            <span>{document.mak}</span>
            <span>BKU</span>
            <span>:</span>
            <span />
          </div>
        </div>

        <h1 className="tanda-terima-title">RINCIAN BIAYA PERJALANAN DINAS</h1>

        <div className="tanda-terima-sppd-info">
          <span>Lampiran SPD Nomor</span>
          <span>:</span>
          <span>{sppd?.nomor ?? "-"}</span>
          <span>Tanggal</span>
          <span>:</span>
          <span>{formatTanggalIndonesia(tanggalPerjalanan)}</span>
        </div>

        <table className="tanda-terima-table">
          <colgroup>
            <col className="w-[10mm]" />
            <col className="w-[80mm]" />
            <col className="w-[38mm]" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th>NO</th>
              <th>PERINCIAN BIAYA</th>
              <th>JUMLAH</th>
              <th>KETERANGAN</th>
            </tr>
          </thead>
          <tbody>
            <tr className="tanda-terima-detail-row">
              <td className="text-center align-top">1.</td>
              <td className="align-top">
                <div className="space-y-[1.5mm]">
                  {costs.map((cost) => (
                    <div
                      key={cost.key}
                      className="tanda-terima-cost-row grid grid-cols-[4mm_1fr_7mm_4mm_7mm_23mm] items-baseline"
                    >
                      <span aria-hidden="true">•</span>
                      <span
                        className="whitespace-nowrap"
                        style={{
                          fontSize: `${getAutoScaleFontSize(cost.label, 33, 11.5, 5.5)}pt`,
                        }}
                      >
                        {cost.label}
                      </span>
                      <span className="text-center">{cost.quantity}</span>
                      <span className="text-center">x</span>
                      <span>Rp</span>
                      <span
                        className="whitespace-nowrap text-right tabular-nums"
                        style={{
                          fontSize: `${getAutoScaleFontSize(formatNominatifCurrency(cost.unitAmount), 22, 11.5, 7)}pt`,
                        }}
                      >
                        {formatNominatifCurrency(cost.unitAmount)}
                      </span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="align-top">
                <div className="space-y-[1.5mm]">
                  {costs.map((cost) => (
                    <div
                      key={cost.key}
                      className="tanda-terima-cost-row grid grid-cols-[7mm_1fr] items-baseline"
                    >
                      <span>Rp</span>
                      <span
                        className="whitespace-nowrap text-right tabular-nums"
                        style={{
                          fontSize: `${getAutoScaleFontSize(formatNominatifCurrency(cost.total), 29, 11.5, 7)}pt`,
                        }}
                      >
                        {formatNominatifCurrency(cost.total)}
                      </span>
                    </div>
                  ))}
                </div>
              </td>
              <td className="align-top text-justify">{keterangan}</td>
            </tr>
            <tr className="tanda-terima-total-row">
              <td />
              <td>JUMLAH</td>
              <td>
                <div className="grid grid-cols-[8mm_1fr]">
                  <span>Rp</span>
                  <span
                    className="whitespace-nowrap text-right tabular-nums"
                    style={{
                      fontSize: `${getAutoScaleFontSize(formatNominatifCurrency(total), 28, 11.5, 7)}pt`,
                    }}
                  >
                    {formatNominatifCurrency(total)}
                  </span>
                </div>
              </td>
              <td />
            </tr>
            <tr className="tanda-terima-terbilang-row">
              <td colSpan={4}>{formatRupiahTerbilang(total)}</td>
            </tr>
          </tbody>
        </table>

        <section className="tanda-terima-receipt-grid">
          <p className="tanda-terima-receipt-date">
            Limboto, {formatBulanTahunIndonesia(document.tanggal)}
          </p>
          <div className="tanda-terima-receipt-column tanda-terima-receipt-left">
            <p>Telah dibayar sejumlah</p>
            <div className="tanda-terima-receipt-amount">
              <span>Rp</span>
              <span>{formatNominatifCurrency(total)}</span>
            </div>
            <p>Bendahara Pengeluaran</p>
            <div />
            <SignatureName
              name={bendahara?.nama ?? "Bendahara Pengeluaran"}
              nip={bendahara?.nip}
            />
          </div>
          <div className="tanda-terima-receipt-column tanda-terima-receipt-right">
            <p>Telah menerima jumlah uang sebesar</p>
            <div className="tanda-terima-receipt-amount">
              <span>Rp</span>
              <span>{formatNominatifCurrency(total)}</span>
            </div>
            <p>Yang Menerima</p>
            <div />
            <RecipientSignature
              recipient={penerima}
              fallback="Penerima"
              maxNameWidthMm={82}
              align="left"
            />
          </div>
        </section>

        <section className="tanda-terima-settlement">
          <h2>PERHITUNGAN SPD RAMPUNG</h2>
          <div className="mx-auto mt-[5mm] grid w-[118mm] grid-cols-[76mm_9mm_1fr] gap-y-[2mm]">
            <span>Ditetapkan sejumlah</span>
            <span>Rp</span>
            <span className="text-right">{formatNominatifCurrency(total)}</span>
            <span>Yang telah dibayarkan semula</span>
            <span>Rp</span>
            <span className="text-right">{formatNominatifCurrency(total)}</span>
            <span>Sisa kurang/lebih</span>
            <span>Rp</span>
            <span className="text-right">-</span>
          </div>
          <div className="ml-auto mt-[4mm] w-[102mm] text-left">
            <p>Pejabat Pembuat Komitmen</p>
            <div className="h-[18mm]" />
            <SignatureName
              name={ppk?.nama ?? "Pejabat Pembuat Komitmen"}
              nip={ppk?.nip}
            />
          </div>
        </section>
      </div>

      <style jsx global>{`
        .tanda-terima-print-preview > .no-print {
          z-index: 50;
        }
        .tanda-terima-print-sheet {
          box-sizing: border-box;
          width: 215mm;
          min-height: 330mm;
          padding: 12mm 13mm 10mm;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11.5pt;
          line-height: 1.22;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .tanda-terima-document {
          width: 100%;
        }
        .tanda-terima-reference {
          margin-left: auto;
          width: 61mm;
          font-size: 10.5pt;
          font-weight: 700;
          line-height: 1.7;
        }
        .tanda-terima-title {
          margin-top: 5mm;
          text-align: center;
          font-size: 15pt;
          font-weight: 800;
        }
        .tanda-terima-sppd-info {
          display: grid;
          grid-template-columns: 48mm 6mm 1fr;
          margin: 4mm 0 1.5mm;
          line-height: 1.5;
        }
        .tanda-terima-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
        }
        .tanda-terima-table th,
        .tanda-terima-table td {
          border: 1.2px solid #000;
          padding: 1.2mm 1mm;
        }
        .tanda-terima-table th {
          height: 9mm;
          text-align: center;
          font-weight: 800;
        }
        .tanda-terima-detail-row {
          height: 73mm;
        }
        .tanda-terima-cost-row {
          height: 6mm;
          min-height: 6mm;
          line-height: 5mm;
        }
        .tanda-terima-total-row {
          height: 8mm;
        }
        .tanda-terima-terbilang-row {
          height: 9mm;
          background: #d9d9d9;
        }
        .tanda-terima-receipt-grid {
          display: grid;
          grid-template-columns: 1fr 1.25fr;
          grid-template-rows: 9mm auto;
          column-gap: 38mm;
          min-height: 67mm;
          padding: 0 1mm;
        }
        .tanda-terima-receipt-date {
          grid-column: 2;
          grid-row: 1;
          align-self: center;
        }
        .tanda-terima-receipt-left {
          grid-column: 1;
          grid-row: 2;
        }
        .tanda-terima-receipt-right {
          grid-column: 2;
          grid-row: 2;
        }
        .tanda-terima-receipt-column {
          display: grid;
          grid-template-rows: 7mm 8mm 9mm 21mm auto;
          align-content: start;
        }
        .tanda-terima-receipt-amount {
          display: grid;
          grid-template-columns: 10mm 1fr;
          align-items: start;
        }
        .tanda-terima-settlement {
          border-top: 1.2px solid #000;
          padding-top: 4mm;
        }
        .tanda-terima-settlement h2 {
          text-align: center;
          font-size: 12.5pt;
          font-weight: 400;
        }
        @page {
          size: 215mm 330mm;
          margin: 0;
        }

        @media print {
          .tanda-terima-print-preview {
            width: 215mm !important;
            min-height: 330mm !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .tanda-terima-print-preview > .pt-10 {
            padding-top: 0 !important;
          }
          .tanda-terima-print-sheet {
            width: 215mm !important;
            min-height: 330mm !important;
            break-after: avoid;
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}

function KuitansiPreview({
  document,
  pegawais,
  penandatangans,
  spts,
  sppds,
  reports,
  notas,
}: {
  document: DokumenKeuangan;
  pegawais: Pegawai[];
  penandatangans: Penandatangan[];
  spts: Spt[];
  sppds: Sppd[];
  reports: Laporan[];
  notas: NotaDinas[];
}) {
  const rincian = document.rincian[0];
  const penerima = pegawais.find((item) => item.id === rincian?.pegawaiId);
  const spt = spts.find((item) => item.id === document.sptId);
  const sppd =
    sppds.find(
      (item) =>
        item.sptId === document.sptId &&
        item.personil.some((person) => person.pegawaiId === rincian?.pegawaiId),
    ) ?? sppds.find((item) => item.id === document.sppdId);
  const laporan = reports.find((item) => item.id === document.laporanId);
  const nota = notas.find((item) => item.id === document.notaDinasId);
  const indexedLampiran = nota?.lampiran[rincian?.lampiranIndex ?? -1];
  const lampiran =
    indexedLampiran?.pegawaiId === rincian?.pegawaiId
      ? indexedLampiran
      : nota?.lampiran.find((item) => item.pegawaiId === rincian?.pegawaiId);
  const ppk = findSigner(penandatangans, ["ppk", "pejabat pembuat komitmen"]);
  const bendahara = findSigner(penandatangans, ["bendahara"]);
  const pejabatPengadaan = findSigner(penandatangans, [
    "pejabat pengadaan barang",
  ]);
  const total = rincian?.jumlah ?? document.total;
  const untukPembayaran = buildFinancialDocumentDescription({
    purpose: sppd?.maksud ?? laporan?.maksud ?? lampiran?.uraian,
    destination: sppd?.tempatTujuan ?? laporan?.tempatPelaksanaan,
    durationDays: sppd?.lamaPerjalanan,
    departureDate: sppd?.tanggalBerangkat ?? document.tanggal,
    returnDate: sppd?.tanggalKembali,
    sptNumber: spt?.nomor,
    sptDate: spt?.tanggalMulai,
    sppdNumber: sppd?.nomor,
    sppdDate: sppd?.tanggalBerangkat,
  });
  const bulanTahun = formatBulanTahunIndonesia(document.tanggal);
  const tanggalPembayaran = document.pembayaran?.tanggalPembayaran
    ? formatTanggalIndonesia(document.pembayaran.tanggalPembayaran)
    : "";

  return (
    <div className="kuitansi-print-sheet bg-white text-black">
      <article className="kuitansi-frame">
        <section className="kuitansi-main-section">
          <h1 className="kuitansi-up-title">KUITANSI PEMBAYARAN UP</h1>

          <div className="kuitansi-meta">
            <span>TA</span>
            <span>:</span>
            <span>{document.tahun}</span>
            <span>Nomor Bukti</span>
            <span>:</span>
            <span className="break-words">{document.nomor}</span>
            <span>Mata Anggaran</span>
            <span>:</span>
            <span>{document.mak}</span>
          </div>

          <h2 className="kuitansi-document-title">
            KUITANSI / BUKTI PEMBAYARAN
          </h2>

          <div className="kuitansi-fields">
            <span>Sudah terima dari</span>
            <span>:</span>
            <div>
              <p>Kuasa Pengguna Anggaran / Pembuat Komitmen</p>
              <p className="mt-[2mm]">
                Komisi Pemilihan Umum Kabupaten Gorontalo
              </p>
            </div>

            <span>Jumlah Uang</span>
            <span>:</span>
            <p className="font-black">{formatKuitansiCurrency(total)}</p>

            <span>Terbilang</span>
            <span>:</span>
            <p className="font-black italic">{formatRupiahTerbilang(total)}</p>

            <span>Untuk Pembayaran</span>
            <span>:</span>
            <p className="kuitansi-payment-description">{untukPembayaran}</p>
          </div>

          <div className="kuitansi-recipient">
            <p>Limboto, {bulanTahun}</p>
            <p className="mt-[2mm]">Penerima Uang</p>
            <div className="h-[20mm]" />
            <RecipientSignature
              recipient={penerima}
              fallback="Penerima Uang"
              maxNameWidthMm={64}
            />
          </div>
        </section>

        <section className="kuitansi-approval-section">
          <div>
            <p>Setuju dibebankan pada mata anggaran berkenaan</p>
            <p className="mt-[1mm]">An. Kuasa Pengguna Anggaran</p>
            <p className="mt-[1mm]">Pejabat Pembuat Komitmen</p>
            <div className="h-[15mm]" />
            <SignatureName
              name={ppk?.nama ?? "Pejabat Pembuat Komitmen"}
              nip={ppk?.nip}
            />
          </div>
          <div>
            <div className="grid grid-cols-[1fr_auto] gap-x-[5mm]">
              <span>Lunas dibayar, Tanggal :</span>
              <span>{tanggalPembayaran}</span>
            </div>
            <p className="mt-[7mm]">Bendahara Pengeluaran</p>
            <div className="h-[15mm]" />
            <SignatureName
              name={bendahara?.nama ?? "Bendahara Pengeluaran"}
              nip={bendahara?.nip}
            />
          </div>
        </section>

        <section className="kuitansi-responsibility-section">
          <p>
            Barang / Pekerjaan tersebut telah diterima/diselesaikan dengan
            lengkap dan baik
          </p>
          <p className="mt-[2mm]">Pejabat Pengadaan Barang</p>
          <div className="h-[18mm]" />
          <SignatureName
            name={pejabatPengadaan?.nama ?? "Pejabat Pengadaan Barang"}
            nip={pejabatPengadaan?.nip}
          />
        </section>
      </article>

      <style jsx global>{`
        .kuitansi-print-preview > .no-print {
          z-index: 50;
        }
        .kuitansi-print-sheet {
          box-sizing: border-box;
          width: 215mm;
          height: 330mm;
          overflow: hidden;
          padding: 15mm 5.5mm 17mm;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11.5pt;
          line-height: 1.22;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .kuitansi-frame {
          display: grid;
          grid-template-rows: 203mm 46mm 48mm;
          width: 100%;
          height: 297mm;
          border: 0;
          overflow: hidden;
        }
        .kuitansi-main-section {
          position: relative;
          padding: 11mm 0.5mm 0;
        }
        .kuitansi-up-title {
          text-align: center;
          font-size: 14pt;
          font-weight: 800;
        }
        .kuitansi-meta {
          display: grid;
          grid-template-columns: 33mm 6mm 1fr;
          row-gap: 3mm;
          width: 91mm;
          margin: 10mm 0 0 auto;
          padding-right: 22mm;
        }
        .kuitansi-document-title {
          margin-top: 11mm;
          text-align: center;
          font-size: 15pt;
          font-weight: 900;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .kuitansi-fields {
          display: grid;
          grid-template-columns: 40mm 6mm 1fr;
          row-gap: 7mm;
          margin-top: 11mm;
        }
        .kuitansi-payment-description {
          line-height: 1.35;
          text-align: justify;
          overflow-wrap: anywhere;
        }
        .kuitansi-recipient {
          width: 66mm;
          margin: 7mm 15mm 0 auto;
          text-align: center;
        }
        .kuitansi-approval-section {
          display: grid;
          grid-template-columns: 55% 45%;
          border-top: 1.2px solid #000;
          border-bottom: 1.2px solid #000;
          padding: 1mm 0.5mm;
        }
        .kuitansi-approval-section > div:last-child {
          padding-left: 1mm;
        }
        .kuitansi-responsibility-section {
          padding: 6mm 0.5mm 0;
        }
        @page {
          size: 215mm 330mm;
          margin: 0;
        }

        @media print {
          .kuitansi-print-preview {
            width: 215mm !important;
            min-height: 330mm !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .kuitansi-print-preview > .pt-10 {
            padding-top: 0 !important;
          }
          .kuitansi-print-sheet {
            width: 215mm !important;
            height: 330mm !important;
            overflow: hidden !important;
            break-inside: avoid;
            page-break-inside: avoid;
            break-after: avoid;
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}

type NominatifStyle = CSSProperties & {
  "--nominatif-scale": number;
  "--nominatif-scale-width": string;
  "--nominatif-row-height": string;
  "--nominatif-font-size": string;
};

type NominatifLampiranRow = RincianKeuangan;

type NominatifAmountColumn = {
  key: string;
  label: string;
  paymentLabel: string;
  getValue: (row: NominatifLampiranRow) => number;
};

const NOMINATIF_AMOUNT_COLUMNS: NominatifAmountColumn[] = [
  {
    key: "uangHarian",
    label: "Harian Paket Meeting",
    paymentLabel: "Uang Harian Paket Meeting",
    getValue: (row) => row.uangHarianPaketMeeting,
  },
  {
    key: "uangHarianFull",
    label: "Uang Harian Full",
    paymentLabel: "Uang Harian Full",
    getValue: (row) => row.uangHarianFull,
  },
  {
    key: "uangTransportHarian",
    label: "Uang Transport Harian",
    paymentLabel: "Uang Transport Harian",
    getValue: (row) => row.uangTransportHarian,
  },
  {
    key: "penginapan",
    label: "Penginapan",
    paymentLabel: "Penginapan",
    getValue: (row) => row.penginapan,
  },
  {
    key: "tiketPesawat",
    label: "Tiket Pesawat",
    paymentLabel: "Tiket Pesawat",
    getValue: (row) => row.tiketPesawat,
  },
  {
    key: "transportBandaraAsal",
    label: "Bandara Asal",
    paymentLabel: "Transport Bandara Asal",
    getValue: (row) => row.transportBandaraAsal,
  },
  {
    key: "transportBandaraTujuan",
    label: "Bandara Tujuan",
    paymentLabel: "Transport Bandara Tujuan",
    getValue: (row) => row.transportBandaraTujuan,
  },
];

const getNominatifAutoScale = (
  rows: NominatifLampiranRow[],
  getPegawaiName: (pegawaiId: string) => string,
  columnCount: number,
) => {
  const rowDensityScale =
    rows.length <= 3 ? 1 : Math.max(0.58, 1 - (rows.length - 3) * 0.045);
  const longestName = rows.reduce(
    (longest, row) => Math.max(longest, getPegawaiName(row.pegawaiId).length),
    0,
  );
  const longTextScale =
    longestName <= 36 ? 1 : Math.max(0.86, 1 - (longestName - 36) * 0.006);
  const columnDensityScale =
    columnCount <= 8 ? 1 : Math.max(0.58, 1 - (columnCount - 8) * 0.055);
  const estimatedContentHeightMm = 143 + rows.length * 19;
  const pageHeightScale = Math.max(
    0.58,
    Math.min(1, 203 / estimatedContentHeightMm),
  );

  return Math.min(
    rowDensityScale,
    longTextScale,
    columnDensityScale,
    pageHeightScale,
  );
};

function NominatifPreview({
  document,
  pegawais,
  jabatans,
  pangkats,
  penandatangans,
  spts,
  sppds,
  reports,
  dipas,
}: {
  document: DokumenKeuangan;
  pegawais: Pegawai[];
  jabatans: Jabatan[];
  pangkats: Pangkat[];
  penandatangans: Penandatangan[];
  spts: Spt[];
  sppds: Sppd[];
  reports: Laporan[];
  dipas: DIPA[];
}) {
  const pegawai = (id: string) => pegawais.find((item) => item.id === id);
  const name = (id: string) => pegawai(id)?.nama ?? "-";
  const nip = (id: string) => getRecipientNip(pegawai(id));
  const jabatan = (id: string) => {
    const person = pegawai(id);
    return jabatans.find((item) => item.id === person?.jabatanId)?.nama ?? "-";
  };
  const pangkat = (id: string) => {
    const person = pegawai(id);
    const pangkatPegawai = pangkats.find(
      (item) => item.id === person?.pangkatId,
    );
    if (pangkatPegawai) {
      return `${pangkatPegawai.namaPangkat} / ${pangkatPegawai.golongan}`;
    }
    return "-";
  };
  const spt = spts.find((item) => item.id === document.sptId);
  const sppd = sppds.find((item) => item.id === document.sppdId);
  const laporan = reports.find((item) => item.id === document.laporanId);
  const dipa = dipas.find(
    (item) =>
      item.id === document.dipaId ||
      item.id === sppd?.dipaId ||
      item.kodeDipa === document.mak,
  );
  const kpa = findSigner(penandatangans, ["kuasa pengguna anggaran", "kpa"]);
  const bendahara = findSigner(penandatangans, ["bendahara"]);
  const lampiranRows = sortByPegawaiOrder(
    document.rincian,
    (row) => row.pegawaiId,
    pegawais,
  );
  const amountColumns = NOMINATIF_AMOUNT_COLUMNS.filter((column) =>
    lampiranRows.some((row) => column.getValue(row) > 0),
  );
  const tahunAnggaran = dipa?.tahunAnggaran ?? document.tahun;
  const totalColumnIndex = 5 + amountColumns.length;
  const signatureColumnIndex = totalColumnIndex + 1;
  const totalFormula =
    amountColumns.length > 0
      ? `${totalColumnIndex} = ${amountColumns
          .map((_, index) => index + 5)
          .join(" + ")}`
      : String(totalColumnIndex);
  const amountColumnWidth = `${Math.max(
    22,
    Math.min(34, 112 / Math.max(amountColumns.length, 1)),
  )}mm`;
  const scale = getNominatifAutoScale(
    lampiranRows,
    name,
    5 + amountColumns.length,
  );
  const nominatifStyle: NominatifStyle = {
    "--nominatif-scale": scale,
    "--nominatif-scale-width": `${100 / scale}%`,
    "--nominatif-row-height": `${Math.max(12, 19 * scale)}mm`,
    "--nominatif-font-size": `${Math.max(10, 13 * scale)}px`,
  };
  const tanggalKegiatan =
    sppd?.tanggalBerangkat ??
    laporan?.tanggalSuratTugas ??
    spt?.tanggalMulai ??
    document.tanggal;
  const tempatTujuan =
    sppd?.tempatTujuan ?? laporan?.tempatPelaksanaan ?? "Tempat tujuan";
  const maksud =
    sppd?.maksud ??
    laporan?.maksud ??
    "perjalanan dinas sesuai dokumen pertanggungjawaban";
  const jenisPembayaran = amountColumns.length
    ? amountColumns.map((column) => column.paymentLabel).join(", ")
    : "Biaya";
  const uraianPembayaran = buildFinancialDocumentDescription({
    paymentItems: jenisPembayaran,
    purpose: maksud,
    destination: tempatTujuan,
    durationDays: sppd?.lamaPerjalanan,
    departureDate: tanggalKegiatan,
    returnDate: sppd?.tanggalKembali ?? spt?.tanggalSelesai ?? tanggalKegiatan,
  });

  return (
    <div
      className="nominatif-print-sheet bg-white p-[5mm] text-black print:m-0"
      style={nominatifStyle}
    >
      <div className="nominatif-auto-scale">
        <section className="nominatif-top-grid">
          <div className="nominatif-top-left">
            <div className="flex h-[15mm] items-center justify-center border-b border-black">
              <p className="text-[18px] font-black uppercase">
                APBN TAHUN {tahunAnggaran}
              </p>
            </div>
            <div className="grid grid-cols-[68mm_6mm_1fr] gap-y-2 px-9 pt-3 text-[13px] font-black uppercase">
              <span>KABUPATEN</span>
              <span>:</span>
              <span>GORONTALO</span>
              <span>KODE SATUAN KERJA</span>
              <span>:</span>
              <span>659520</span>
            </div>
          </div>

          <div className="nominatif-top-center">
            <h1 className="border-b border-black py-1 text-center text-[15px] font-black uppercase">
              DAFTAR NOMINATIF PEMBAYARAN
            </h1>
            <p className="px-2 pt-1 text-center text-[13px] font-black leading-[1.2]">
              {uraianPembayaran}
            </p>
          </div>

          <div className="nominatif-top-right">
            <div className="grid grid-cols-[40mm_6mm_1fr] gap-y-7 px-1 pt-5 text-[12px] font-black uppercase">
              <span>TAHUN ANGGARAN</span>
              <span>:</span>
              <span>{tahunAnggaran}</span>
              <span>NO. BUKTI</span>
              <span>:</span>
              <span>{document.nomor || "      /      / K"}</span>
              <span>MAK</span>
              <span>:</span>
              <span>{document.mak}</span>
            </div>
          </div>
        </section>

        <table className="nominatif-table">
          <colgroup>
            <col className="w-[8mm]" />
            <col className="w-[63mm]" />
            <col className="w-[35mm]" />
            <col className="w-[34mm]" />
            {amountColumns.map((column) => (
              <col key={column.key} style={{ width: amountColumnWidth }} />
            ))}
            <col className="w-[42mm]" />
            <col className="w-[57mm]" />
          </colgroup>
          <thead>
            <tr className="h-[16mm]">
              <th>No</th>
              <th>Nama</th>
              <th>Jabatan</th>
              <th>Gol. Ruang</th>
              {amountColumns.map((column) => (
                <th key={column.key}>
                  {column.label}
                  <br />
                  (Rp.)
                </th>
              ))}
              <th>
                Jumlah
                <br />
                Yang di Bayarkan
                <br />
                (Rp.)
              </th>
              <th>Tanda Tangan</th>
            </tr>
            <tr className="nominatif-index-row">
              <td>1</td>
              <td>2</td>
              <td>3</td>
              <td>4</td>
              {amountColumns.map((column, index) => (
                <td key={column.key}>{index + 5}</td>
              ))}
              <td>{totalFormula}</td>
              <td>{signatureColumnIndex}</td>
            </tr>
          </thead>
          <tbody>
            {lampiranRows.map((row, index) => (
              <tr
                key={`${row.pegawaiId}-${index}`}
                className="nominatif-data-row"
              >
                <td className="text-center">{index + 1}</td>
                <td className="font-medium uppercase">
                  <p>{name(row.pegawaiId)}</p>
                  {nip(row.pegawaiId) && (
                    <p className="mt-0.5 whitespace-nowrap text-[0.82em] font-normal normal-case">
                      NIP. {nip(row.pegawaiId)}
                    </p>
                  )}
                </td>
                <td className="text-center">{jabatan(row.pegawaiId)}</td>
                <td className="text-center">{pangkat(row.pegawaiId)}</td>
                {amountColumns.map((column) => (
                  <td key={column.key} className="text-right">
                    {column.getValue(row) > 0
                      ? formatNominatifCurrency(column.getValue(row))
                      : ""}
                  </td>
                ))}
                <td className="text-right">
                  {formatNominatifCurrency(row.jumlah)}
                </td>
                <td className="align-top">{index + 1}.</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="nominatif-total-row">
              <td className="text-center">-</td>
              <td className="text-center font-black">JUMLAH</td>
              <td />
              <td />
              {amountColumns.map((column) => (
                <td key={column.key} className="text-right font-black">
                  {formatNominatifCurrency(
                    lampiranRows.reduce(
                      (total, row) => total + column.getValue(row),
                      0,
                    ),
                  )}
                </td>
              ))}
              <td className="text-right font-black">
                {formatNominatifCurrency(
                  lampiranRows.reduce((total, row) => total + row.jumlah, 0),
                )}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>

        <footer className="grid grid-cols-2 px-[42mm] pt-[7mm] text-center text-[13px] leading-[1.3]">
          <div>
            <p>Mengetahui / Menyetujui</p>
            <p>Kuasa Pengguna Anggaran</p>
            <p>Satker KPU Kabupaten Gorontalo</p>
            <div className="h-[22mm]" />
            <SignatureName
              name={kpa?.nama ?? "Kuasa Pengguna Anggaran"}
              nip={kpa?.nip}
            />
          </div>
          <div>
            <p>Limboto, {formatBulanTahunIndonesia(document.tanggal)}</p>
            <p>Satker KPU Kabupaten Gorontalo</p>
            <p>Bendahara Pengeluaran</p>
            <div className="h-[22mm]" />
            <SignatureName
              name={bendahara?.nama ?? "Bendahara Pengeluaran"}
              nip={bendahara?.nip}
            />
          </div>
        </footer>
      </div>

      <style jsx global>{`
        .nominatif-print-preview > .no-print {
          z-index: 50;
        }
        .nominatif-print-preview > .pt-10 {
          position: relative;
          z-index: 1;
        }
        .nominatif-print-sheet {
          width: 330mm;
          height: 215mm;
          overflow: hidden;
          font-family: Arial, Helvetica, sans-serif;
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
        .nominatif-auto-scale {
          width: var(--nominatif-scale-width);
          transform: scale(var(--nominatif-scale));
          transform-origin: top left;
        }
        .nominatif-top-grid {
          display: grid;
          grid-template-columns: 36.5% 33% 30.5%;
          height: 56mm;
          border: 1.5px solid #000;
          border-bottom: 0;
        }
        .nominatif-top-left,
        .nominatif-top-center,
        .nominatif-top-right {
          border-right: 1.5px solid #000;
        }
        .nominatif-top-right {
          border-right: 0;
        }
        .nominatif-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          font-size: var(--nominatif-font-size);
          line-height: 1.15;
        }
        .nominatif-table th,
        .nominatif-table td {
          border: 1.5px solid #000;
          padding: 1.4mm 1.2mm;
          vertical-align: middle;
        }
        .nominatif-table th {
          text-align: center;
          font-size: calc(var(--nominatif-font-size) * 1.02);
          font-weight: 900;
        }
        .nominatif-index-row td {
          background: #bfbfbf;
          padding: 0.5mm 1mm;
          text-align: center;
          font-size: calc(var(--nominatif-font-size) * 0.72);
          font-style: italic;
        }
        .nominatif-data-row {
          height: var(--nominatif-row-height);
        }
        .nominatif-total-row {
          height: 10mm;
          background: #d9d9d9;
        }
        .nominatif-total-row td:nth-child(5),
        .nominatif-total-row td:nth-child(6),
        .nominatif-total-row td:nth-child(7) {
          background: #fff;
        }

        @media print {
          @page {
            size: 330mm 215mm;
            margin: 0;
          }
          .nominatif-print-preview {
            width: 330mm !important;
            min-height: 215mm !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          .nominatif-print-preview > .pt-10 {
            padding-top: 0 !important;
          }
          .nominatif-print-sheet {
            width: 330mm !important;
            height: 215mm !important;
            overflow: hidden !important;
            padding: 5mm !important;
            break-inside: avoid;
            page-break-inside: avoid;
            break-after: avoid;
            page-break-after: avoid;
          }
        }
      `}</style>
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

  const effectivePenandatangans = document.penandatanganSnapshots.length
    ? [
        ...document.penandatanganSnapshots.map(snapshotToPenandatangan),
        ...penandatangans,
      ]
    : penandatangans;

  return (
    <PrintPreview
      isOpen
      title={`Pratinjau ${document.jenis}`}
      onClose={onClose}
      printPageSize={
        document.jenis === "Daftar Nominatif" ? "330mm 215mm" : "215mm 330mm"
      }
      className={
        document.jenis === "SPBY"
          ? "spby-print-preview min-h-[330mm] w-[231mm] max-w-[calc(100vw-2rem)] overflow-x-auto p-[8mm] print:p-0"
          : document.jenis === "Daftar Nominatif"
            ? "nominatif-print-preview min-h-[215mm] w-[330mm] max-w-[calc(100vw-2rem)] overflow-x-auto p-[8mm] print:p-0"
            : document.jenis === "Tanda Terima"
              ? "tanda-terima-print-preview min-h-[330mm] w-[231mm] max-w-[calc(100vw-2rem)] overflow-x-auto p-[8mm] print:p-0"
              : document.jenis === "Kuitansi"
                ? "kuitansi-print-preview min-h-[330mm] w-[226mm] max-w-[calc(100vw-2rem)] overflow-x-auto p-[5.5mm] print:p-0"
                : undefined
      }
    >
      {document.jenis === "SPBY" ? (
        <SpbyPreview
          document={document}
          pegawais={pegawais}
          penandatangans={effectivePenandatangans}
          spts={spts}
          sppds={sppds}
          reports={reports}
          dipas={dipas}
        />
      ) : document.jenis === "Daftar Nominatif" ? (
        <NominatifPreview
          document={document}
          pegawais={pegawais}
          jabatans={jabatans}
          pangkats={pangkats}
          penandatangans={effectivePenandatangans}
          spts={spts}
          sppds={sppds}
          reports={reports}
          dipas={dipas}
        />
      ) : document.jenis === "Tanda Terima" ? (
        <TandaTerimaPreview
          document={document}
          pegawais={pegawais}
          penandatangans={effectivePenandatangans}
          spts={spts}
          sppds={sppds}
          reports={reports}
          notas={notas}
        />
      ) : document.jenis === "Kuitansi" ? (
        <KuitansiPreview
          document={document}
          pegawais={pegawais}
          penandatangans={effectivePenandatangans}
          spts={spts}
          sppds={sppds}
          reports={reports}
          notas={notas}
        />
      ) : null}
    </PrintPreview>
  );
}
