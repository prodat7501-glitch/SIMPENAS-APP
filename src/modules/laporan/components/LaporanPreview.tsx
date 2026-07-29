"use client";

import Image from "next/image";
import { PrintPreview } from "@/components/ui/print-preview";
import { DocumentTemplate } from "@/components/document/DocumentTemplate";
import type { Jabatan } from "@/modules/jabatan/jabatan.schema";
import type { Pegawai } from "@/modules/pegawai/pegawai.schema";
import { sortByPegawaiOrder } from "@/modules/pegawai/pegawai-order";
import type { Sppd } from "@/modules/sppd/sppd.schema";
import type { Spt } from "@/modules/spt/spt.schema";
import { useDocumentTemplate } from "@/providers/TemplateProvider";
import type { Laporan } from "../laporan.schema";

const formatTanggalIndonesia = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const splitPoin = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const renderNumberedList = (value: string) => {
  const items = splitPoin(value);

  if (!items.length) {
    return <p>-</p>;
  }

  return (
    <ol className="list-decimal space-y-1 pl-5 text-justify laporan-flow-list">
      {items.map((point, index) => (
        <li key={`${point}-${index}`}>{point}</li>
      ))}
    </ol>
  );
};

const renderBulletList = (value: string) => {
  const items = splitPoin(value);

  if (!items.length) {
    return <p>-</p>;
  }

  return (
    <ul className="list-disc space-y-1 pl-5 text-justify laporan-flow-list">
      {items.map((point, index) => (
        <li key={`${point}-${index}`}>{point}</li>
      ))}
    </ul>
  );
};

function SectionBlock({
  code,
  title,
  children,
}: {
  code: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid grid-cols-[24px_1fr] gap-x-2 laporan-section">
      <h3 className="font-bold laporan-section-code">{code}</h3>
      <div>
        <h3 className="font-bold mb-1 laporan-section-title">{title}</h3>
        {children}
      </div>
    </section>
  );
}

export function LaporanPreview({
  item,
  spts,
  sppds,
  pegawais,
  jabatans,
  onClose,
}: {
  item: Laporan | null;
  spts: Spt[];
  sppds: Sppd[];
  pegawais: Pegawai[];
  jabatans: Jabatan[];
  onClose: () => void;
}) {
  const template = useDocumentTemplate();

  if (!item) return null;

  const sppd = sppds.find((x) => x.id === item.sppdId);
  const spt = spts.find((x) => x.id === item.sptId) ??
    spts.find((x) => x.id === sppd?.sptId);
  const pelaksana =
    sortByPegawaiOrder(
      spt?.personil ?? [],
      (person) => person.pegawaiId,
      pegawais,
    )
      .map(({ pegawaiId }) => pegawais.find((pegawai) => pegawai.id === pegawaiId))
      .filter(Boolean);
  const fallbackPegawai = pegawais.find((x) => x.id === item.pelaksanaId);
  const daftarPelaksana = pelaksana.length
    ? pelaksana
    : fallbackPegawai
      ? [fallbackPegawai]
      : [];
  const nomorSuratTugas = item.nomorSuratTugas || spt?.nomor || "-";
  const tanggalSuratTugas = item.tanggalSuratTugas || "-";
  const suratTugas = item.suratTugas || "Sekretaris KPU";
  const judulLaporan = item.judulLaporan || "Laporan Perjalanan Dinas";
  const tempatLaporan = item.tempatLaporan || "Limboto";
  const isKomisioner = (pegawai?: Pegawai) =>
    pegawai?.kategoriPegawai === "Ketua KPU" ||
    pegawai?.kategoriPegawai === "Anggota KPU";
  const getJabatanPelaksana = (pegawai?: Pegawai) =>
    jabatans.find((jabatan) => jabatan.id === pegawai?.jabatanId)?.nama ||
    pegawai?.kategoriPegawai ||
    "-";
  const isLaporanKomisioner =
    daftarPelaksana.length > 0 && daftarPelaksana.every(isKomisioner);

  return (
    <PrintPreview
      isOpen
      title="Pratinjau Laporan Perjalanan Dinas"
      onClose={onClose}
      printPageSize="215mm 330mm"
      className="laporan-print-sheet w-[215mm] min-h-[330mm] print:overflow-visible"
    >
      <DocumentTemplate includeHeader={false}>
        <header
          className={
            isLaporanKomisioner
              ? "flex flex-col items-center border-b-[3px] border-double border-black pb-3 text-center"
              : "grid grid-cols-[64px_1fr_64px] items-center border-b-[3px] border-double border-black pb-3 text-center"
          }
        >
          <Image
            src={template.logo}
            alt="Logo instansi"
            width={56}
            height={56}
            className={`h-14 w-14 object-contain ${
              isLaporanKomisioner ? "mb-2" : ""
            }`}
          />
          <div>
            <h1 className="text-base font-black uppercase tracking-wide leading-tight">
              KOMISI PEMILIHAN UMUM
            </h1>
            <p className="text-base font-black uppercase tracking-wide leading-tight">
              KABUPATEN GORONTALO
            </p>
            <p className="mt-1 text-[10px] italic text-gray-500">
              {template.alamat}
            </p>
          </div>
          {!isLaporanKomisioner && <span aria-hidden />}
        </header>

        <div className="text-center my-6">
          <h2 className="font-black uppercase">{judulLaporan}</h2>
        </div>

        <div className="space-y-5 text-sm">
          <SectionBlock code="A." title="Dasar Pelaksanaan">
            <table className="text-sm">
              <tbody>
                <tr>
                  <td className="w-40 align-top">Surat Tugas</td>
                  <td className="w-4 align-top">:</td>
                  <td>{suratTugas}</td>
                </tr>
                <tr>
                  <td className="align-top">Nomor</td>
                  <td className="align-top">:</td>
                  <td>{nomorSuratTugas}</td>
                </tr>
                <tr>
                  <td className="align-top">Tanggal</td>
                  <td className="align-top">:</td>
                  <td>{tanggalSuratTugas}</td>
                </tr>
              </tbody>
            </table>
          </SectionBlock>

          <SectionBlock code="B." title="Maksud">
            <p className="whitespace-pre-wrap text-justify">{item.maksud}</p>
          </SectionBlock>

          <SectionBlock code="C." title="Tujuan Kegiatan">
            {renderNumberedList(item.tujuan)}
          </SectionBlock>

          <SectionBlock code="D." title="Tempat dan Waktu Pelaksanaan">
            <table className="text-sm">
              <tbody>
                <tr>
                  <td className="w-40 align-top">Tempat Pelaksanaan</td>
                  <td className="w-4 align-top">:</td>
                  <td>{item.tempatPelaksanaan}</td>
                </tr>
                <tr>
                  <td className="align-top">Hari / Tanggal</td>
                  <td className="align-top">:</td>
                  <td>{item.hariTanggalPelaksanaan}</td>
                </tr>
              </tbody>
            </table>
          </SectionBlock>

          <SectionBlock code="E." title="Materi">
            {renderBulletList(item.materi)}
          </SectionBlock>

          <SectionBlock code="F." title="Hasil Pelaksanaan">
            {renderNumberedList(item.hasilPelaksanaan)}
          </SectionBlock>

          {item.kalimatPenutup.trim() && (
            <p className="whitespace-pre-wrap text-justify laporan-closing-sentence">
              {item.kalimatPenutup}
            </p>
          )}
        </div>

        <section className="mt-10 laporan-signature-section">
          <table className="w-full table-fixed border-0 text-sm">
            <colgroup>
              <col className="w-[68%]" />
              <col className="w-[32%]" />
            </colgroup>
            <tbody>
              <tr>
                <td className="border-0 pb-3 pr-8 align-top">
                  <p>
                    {tempatLaporan}, {formatTanggalIndonesia(item.tanggalLaporan)}
                  </p>
                  <p className="mt-1 font-bold">
                    Tim Yang Melaksanakan Perjalanan Dinas
                  </p>
                </td>
                <td className="border-0 pb-3 align-top" />
              </tr>
              {daftarPelaksana.map((pegawai, index) => (
                <tr
                  key={pegawai?.id ?? `${pegawai?.nama}-${index}`}
                  className="laporan-signature-row"
                >
                  <td className="border-0 py-3 pr-8 align-middle">
                    <p className="font-bold leading-snug">
                      {index + 1}. {pegawai?.nama ?? "-"}
                    </p>
                    <p className="pl-4 leading-snug">
                      {isKomisioner(pegawai)
                        ? `Jabatan: ${getJabatanPelaksana(pegawai)}`
                        : `NIP. ${pegawai?.nip || "-"}`}
                    </p>
                  </td>
                  <td className="border-0 py-3 align-middle">
                    <span className="tracking-[0.16em]">
                      ............................
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {item.catatanVerifikasi && (
          <div className="mt-8 border p-3 text-xs">
            <strong>Catatan verifikasi:</strong> {item.catatanVerifikasi}
          </div>
        )}

        <section className="mt-12 grid grid-cols-[24px_1fr] gap-x-2 laporan-section laporan-documentation-section">
          <h3 className="font-bold laporan-section-code">G.</h3>
          <div>
            <h3 className="font-bold mb-4 laporan-section-title">Dokumentasi</h3>
            <div className="grid grid-cols-2 gap-4">
              {item.dokumentasi.map((foto) => (
                <figure key={foto.id}>
                  <Image
                    src={foto.dataUrl}
                    alt={foto.nama}
                    width={320}
                    height={176}
                    unoptimized
                    className="w-full h-44 object-cover border"
                  />
                </figure>
              ))}
            </div>
          </div>
        </section>
      </DocumentTemplate>
      <style jsx global>{`
        .laporan-print-sheet > .pt-10 > div {
          font-family: "Bookman Old Style", Bookman, Georgia, serif !important;
        }

        .laporan-print-sheet {
          width: 215mm !important;
          min-height: 330mm !important;
        }

        @media print {
          @page {
            size: 215mm 330mm;
            margin: ${template.margin}mm;
          }

          .laporan-print-sheet {
            box-sizing: border-box;
            width: 100% !important;
            min-height: 0 !important;
            page-break-after: auto;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            overflow: visible !important;
          }

          .laporan-print-sheet > .pt-10 {
            padding-top: 0 !important;
          }

          .laporan-section {
            break-inside: auto;
            page-break-inside: auto;
          }

          .laporan-section-code,
          .laporan-section-title {
            break-after: avoid;
            page-break-after: avoid;
          }

          .laporan-flow-list,
          .laporan-flow-list li {
            break-inside: auto;
            page-break-inside: auto;
          }

          .laporan-closing-sentence {
            break-inside: auto;
            page-break-inside: auto;
          }

          .laporan-signature-section {
            break-inside: auto;
            page-break-inside: auto;
          }

          .laporan-documentation-section {
            break-before: page;
            page-break-before: always;
            break-inside: auto;
            page-break-inside: auto;
            margin-top: 0 !important;
          }

          .laporan-signature-row {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .laporan-print-sheet figure {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </PrintPreview>
  );
}
