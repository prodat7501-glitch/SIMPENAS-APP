"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Download, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintPreview } from "@/components/ui/print-preview";
import { cn } from "@/lib/utils";
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

const uniqueText = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

const getTanggalPelaksanaan = (relatedSppds: Sppd[], spt?: Spt) => {
  const first = relatedSppds[0];
  const start = first?.tanggalBerangkat ?? spt?.tanggalMulai ?? "";
  const end = first?.tanggalKembali ?? spt?.tanggalSelesai ?? "";

  if (!start && !end) return "";
  if (!end || start === end) return formatTanggalIndonesia(start);
  return `${formatTanggalIndonesia(start)} s.d. ${formatTanggalIndonesia(end)}`;
};

const isInvalidNomor = (val?: string | null) =>
  !val ||
  val.trim() === "" ||
  val.trim() === "-" ||
  /^tanggal\b/i.test(val.trim());

const isInvalidTempat = (val?: string | null) =>
  !val ||
  val.trim() === "" ||
  val.trim() === "-" ||
  /^hari\s*\/\s*tanggal\b/i.test(val.trim());

const isInvalidHariTanggal = (val?: string | null) =>
  !val || val.trim() === "" || val.trim() === "-";

const isInvalidTanggal = (val?: string | null) =>
  !val || val.trim() === "" || val.trim() === "-";

const isInvalidSuratTugas = (val?: string | null) =>
  !val ||
  val.trim() === "" ||
  val.trim() === "-" ||
  /^nomor\b/i.test(val.trim());

const extractLineValue = (text?: string, labelPrefix?: string): string => {
  if (!text || !labelPrefix) return "";
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    const regex = new RegExp(`^${labelPrefix}\\s*[:\\t]+[ \\t]*(.*)$`, "i");
    const m = trimmed.match(regex);
    if (m && m[1]) {
      return m[1].trim();
    }
  }
  return "";
};

const dataUrlToBlob = (dataUrl: string): Blob => {
  const parts = dataUrl.split(",");
  const mimeMatch = parts[0]?.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "application/pdf";
  const bstr = atob(parts[1] || "");
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

const splitPoin = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const renderNumberedList = (value: string) => {
  const items = splitPoin(value)
    .map((item) => item.replace(/^(\d+[\s.)-]+|[-*•\s]+)/, "").trim())
    .filter(Boolean);

  if (!items.length) {
    return <p>-</p>;
  }

  return (
    <ol className="list-decimal space-y-1 pl-6 text-justify laporan-flow-list text-[12pt] leading-[1.35]">
      {items.map((point, index) => (
        <li key={`${point}-${index}`}>{point}</li>
      ))}
    </ol>
  );
};

const renderBulletList = (value: string) => {
  const items = splitPoin(value)
    .map((item) => item.replace(/^[-*•\s]+/, "").trim())
    .filter(Boolean);

  if (!items.length) {
    return <p>-</p>;
  }

  return (
    <ul className="list-disc space-y-1 pl-6 text-justify laporan-flow-list text-[12pt] leading-[1.35]">
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
    <section className="laporan-section">
      <div className="flex items-start gap-x-2">
        <span className="font-bold w-6 shrink-0 text-[12pt] leading-[1.35] laporan-section-code">{code}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold mb-1.5 text-[12pt] leading-[1.35] laporan-section-title">{title}</h3>
          {children}
        </div>
      </div>
    </section>
  );
}

function DocxViewer({
  dataUrl,
  fileName,
  className,
}: {
  dataUrl: string;
  fileName?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function renderDocx() {
      try {
        setLoading(true);
        setError(null);

        if (!containerRef.current) return;
        containerRef.current.innerHTML = "";

        let arrayBuffer: ArrayBuffer;
        if (dataUrl.startsWith("data:")) {
          const commaIdx = dataUrl.indexOf(",");
          const base64 = commaIdx !== -1 ? dataUrl.slice(commaIdx + 1) : dataUrl;
          const binaryString = atob(base64);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          arrayBuffer = bytes.buffer;
        } else {
          const res = await fetch(dataUrl);
          arrayBuffer = await res.arrayBuffer();
        }

        const docx = await import("docx-preview");
        if (isMounted && containerRef.current) {
          await docx.renderAsync(arrayBuffer, containerRef.current, undefined, {
            className: "docx-rendered-page",
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            breakPages: true,
          });
        }
      } catch (err) {
        console.error("Gagal merender dokumen docx:", err);
        if (isMounted) {
          setError(
            "Pratinjau otomatis dokumen Word tidak dapat dirender. Pastikan berkas berformat .docx standar.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    renderDocx();

    return () => {
      isMounted = false;
    };
  }, [dataUrl]);

  return (
    <div
      className={cn(
        "relative w-full rounded-xl overflow-hidden border border-border bg-slate-100 dark:bg-slate-900 shadow-inner flex flex-col",
        className,
      )}
    >
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-card min-h-[300px]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-foreground">
            Menyusun pratinjau dokumen Word ({fileName || "Dokumen"})...
          </p>
          <p className="text-[11px] text-muted-foreground">
            Mohon tunggu, isi berkas sedang diubah ke tampilan visual peramban
          </p>
        </div>
      )}
      {error && (
        <div className="p-6 text-center space-y-2 bg-card border-b border-border">
          <p className="text-xs font-bold text-danger">{error}</p>
          <p className="text-[11px] text-muted-foreground">
            Petugas dapat mengunduh berkas langsung melalui tombol &quot;Unduh Dokumen Word&quot; di atas.
          </p>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full max-h-[70vh] overflow-y-auto overflow-x-auto p-4 flex flex-col items-center text-slate-900 docx-preview-container"
      />
    </div>
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
  const pdfIframeRef = useRef<HTMLIFrameElement>(null);

  const pdfBlobUrl = useMemo(() => {
    if (!item?.fileLaporan?.dataUrl) return null;
    const dataUrl = item.fileLaporan.dataUrl;
    if (dataUrl.startsWith("data:")) {
      try {
        const blob = dataUrlToBlob(dataUrl);
        return URL.createObjectURL(blob);
      } catch (err) {
        console.error("Gagal membuat blob URL untuk pratinjau dokumen:", err);
        return dataUrl;
      }
    }
    return dataUrl;
  }, [item?.fileLaporan?.dataUrl]);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl && pdfBlobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  if (!item) return null;

  const sppd = sppds.find((x) => x.id === item.sppdId);
  const spt =
    spts.find((x) => x.id === item.sptId) ??
    spts.find((x) => x.id === sppd?.sptId);
  const relatedSppds = sppds.filter(
    (x) =>
      (item.sptId && x.sptId === item.sptId) ||
      (item.sppdId && x.id === item.sppdId) ||
      (spt?.id && x.sptId === spt.id),
  );
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

  const nomorSuratTugas = (() => {
    if (!isInvalidNomor(item.nomorSuratTugas)) {
      return item.nomorSuratTugas!.trim();
    }
    const extracted = extractLineValue(item.dasarPelaksanaan, "Nomor");
    if (!isInvalidNomor(extracted)) {
      return extracted;
    }
    return spt?.nomor || "-";
  })();

  const tanggalSuratTugas = (() => {
    if (!isInvalidTanggal(item.tanggalSuratTugas)) {
      return formatTanggalIndonesia(item.tanggalSuratTugas!.trim());
    }
    const extracted = extractLineValue(item.dasarPelaksanaan, "Tanggal");
    if (!isInvalidTanggal(extracted)) {
      return formatTanggalIndonesia(extracted);
    }
    if (spt?.tanggalMulai) {
      return formatTanggalIndonesia(spt.tanggalMulai);
    }
    return "-";
  })();

  const suratTugas = (() => {
    if (!isInvalidSuratTugas(item.suratTugas)) {
      return item.suratTugas!.trim();
    }
    const extracted = extractLineValue(item.dasarPelaksanaan, "Surat Tugas");
    if (!isInvalidSuratTugas(extracted)) {
      return extracted;
    }
    return "Sekretaris KPU";
  })();

  const tempatPelaksanaan = (() => {
    if (!isInvalidTempat(item.tempatPelaksanaan)) {
      return item.tempatPelaksanaan!.trim();
    }
    const extracted = extractLineValue(item.tempatWaktu, "Tempat Pelaksanaan");
    if (!isInvalidTempat(extracted)) {
      return extracted;
    }
    const sppdTujuan = uniqueText(relatedSppds.map((x) => x.tempatTujuan)).join(", ");
    if (!isInvalidTempat(sppdTujuan)) return sppdTujuan;
    if (!isInvalidTempat(item.tujuan)) return item.tujuan!.trim();
    return "-";
  })();

  const hariTanggalPelaksanaan = (() => {
    if (!isInvalidHariTanggal(item.hariTanggalPelaksanaan)) {
      return item.hariTanggalPelaksanaan!.trim();
    }
    const extracted = extractLineValue(item.tempatWaktu, "Hari\\s*\\/\\s*Tanggal");
    if (!isInvalidHariTanggal(extracted)) {
      return extracted;
    }
    const sppdTanggal = getTanggalPelaksanaan(relatedSppds, spt);
    if (!isInvalidHariTanggal(sppdTanggal)) return sppdTanggal;
    return "-";
  })();

  const rawJudul =
    item.judulLaporan ||
    (item as Record<string, unknown>).judul_laporan as string ||
    (item as Record<string, unknown>).judul as string ||
    "";
  const judulLaporan = rawJudul.trim() ? rawJudul.trim() : "Laporan Perjalanan Dinas";
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

  if (item.metodeLaporan === "upload") {
    if (!item.fileLaporan) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative flex flex-col w-full max-w-lg rounded-2xl bg-card text-foreground shadow-2xl border border-border p-6 text-center space-y-4">
            <h3 className="font-bold text-base text-foreground">Berkas Dokumen Laporan Belum Tersedia</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Berkas laporan yang diunggah untuk SPT {nomorSuratTugas} belum tersimpan atau tidak ditemukan dalam penyimpanan browser ini. Silakan ubah laporan dan unggah kembali berkas dokumen Anda.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Tutup
              </Button>
            </div>
          </div>
        </div>
      );
    }

    const isDriveUrl = item.fileLaporan.dataUrl.includes("drive.google.com");
    const isPdf =
      item.fileLaporan.tipe?.includes("pdf") ||
      item.fileLaporan.nama.toLowerCase().endsWith(".pdf");

    const handleDownload = () => {
      const a = document.createElement("a");
      a.href = pdfBlobUrl || item.fileLaporan!.dataUrl;
      a.download = item.fileLaporan!.nama;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    const handlePrintPdf = () => {
      // 1. Coba print langsung melalui iframe dokumen yang aktif di layar
      if (pdfIframeRef.current?.contentWindow) {
        try {
          pdfIframeRef.current.contentWindow.focus();
          pdfIframeRef.current.contentWindow.print();
          return;
        } catch (e) {
          console.warn("Direct iframe print failed, trying fallback:", e);
        }
      }

      const targetUrl = pdfBlobUrl || item.fileLaporan?.dataUrl;
      if (!targetUrl) return;

      if (isDriveUrl) {
        window.open(targetUrl.replace(/\/view.*$/, "/preview"), "_blank");
        return;
      }

      // 2. Buat iframe tersembunyi sementara untuk memicu dialog cetak
      try {
        const printFrame = document.createElement("iframe");
        printFrame.style.position = "fixed";
        printFrame.style.right = "0";
        printFrame.style.bottom = "0";
        printFrame.style.width = "0";
        printFrame.style.height = "0";
        printFrame.style.border = "0";
        printFrame.src = targetUrl;
        document.body.appendChild(printFrame);
        printFrame.onload = () => {
          try {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
          } catch {
            window.open(targetUrl, "_blank");
          } finally {
            setTimeout(() => {
              if (document.body.contains(printFrame)) {
                document.body.removeChild(printFrame);
              }
            }, 60000);
          }
        };
      } catch {
        // 3. Fallback: buka blob URL di tab baru (aman dan tidak diblokir oleh browser)
        window.open(targetUrl, "_blank");
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="relative flex flex-col w-full max-w-5xl h-[92vh] rounded-2xl bg-card text-foreground shadow-2xl border border-border overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                  isPdf
                    ? "bg-red-100 dark:bg-red-950/50 text-red-600"
                    : "bg-blue-100 dark:bg-blue-950/50 text-blue-600"
                }`}
              >
                {isPdf ? "PDF" : "DOCX"}
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-foreground truncate">
                  {item.fileLaporan.nama}
                </h2>
                <p className="text-xs text-muted-foreground truncate">
                  SPT: {nomorSuratTugas} • Tanggal Laporan: {formatTanggalIndonesia(item.tanggalLaporan)} • Status: {item.status}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={isPdf ? handlePrintPdf : () => window.print()}
                className="gap-1.5"
              >
                <Printer className="w-4 h-4" />
                {isPdf ? "Cetak PDF" : "Cetak Dokumen"}
              </Button>
              <Button
                type="button"
                variant={isPdf ? "outline" : "default"}
                size="sm"
                onClick={handleDownload}
                className={!isPdf ? "bg-blue-600 hover:bg-blue-700 text-white gap-1.5" : "gap-1.5"}
              >
                <Download className="w-4 h-4" />
                {isPdf ? "Unduh PDF" : "Unduh Dokumen Word"}
              </Button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-muted/20 space-y-6">
            {isPdf || isDriveUrl ? (
              <div className="w-full h-[68vh] rounded-xl overflow-hidden border border-border bg-white shadow-sm">
                <iframe
                  ref={pdfIframeRef}
                  src={
                    isDriveUrl
                      ? item.fileLaporan.dataUrl.replace(/\/view.*$/, "/preview")
                      : (pdfBlobUrl || item.fileLaporan.dataUrl)
                  }
                  title={item.fileLaporan.nama}
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              <DocxViewer
                dataUrl={item.fileLaporan.dataUrl}
                fileName={item.fileLaporan.nama}
                className="w-full min-h-[68vh]"
              />
            )}

            {/* Pelaksana Perjalanan Dinas & Verifikasi Notes */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-card p-4 rounded-xl border border-border text-xs space-y-2">
                <p className="font-bold text-foreground">
                  Tim Yang Melaksanakan Perjalanan Dinas:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  {daftarPelaksana.map((pegawai, index) => (
                    <li key={pegawai?.id ?? index} className="font-medium text-foreground">
                      {pegawai?.nama ?? "-"}
                      <span className="text-muted-foreground">
                        {" "}
                        ({isKomisioner(pegawai)
                          ? `Jabatan: ${getJabatanPelaksana(pegawai)}`
                          : `NIP. ${pegawai?.nip || "-"}`})
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {item.catatanVerifikasi && (
                <div className="bg-card p-4 rounded-xl border border-danger/30 text-xs space-y-1 bg-danger/5">
                  <p className="font-bold text-danger">Catatan Verifikasi:</p>
                  <p className="text-foreground leading-relaxed">
                    {item.catatanVerifikasi}
                  </p>
                </div>
              )}
            </div>

            {/* Lampiran Dokumentasi Kegiatan jika ada */}
            {item.dokumentasi && item.dokumentasi.length > 0 && (
              <div className="bg-card p-5 rounded-xl border border-border">
                <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-primary" /> Lampiran Dokumentasi Kegiatan ({item.dokumentasi.length} Foto)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {item.dokumentasi.map((foto) => (
                    <figure
                      key={foto.id}
                      className="rounded-lg overflow-hidden border border-border bg-muted/20"
                    >
                      <Image
                        src={foto.dataUrl}
                        alt={foto.nama}
                        width={320}
                        height={176}
                        unoptimized
                        className="w-full h-44 object-cover"
                      />
                    </figure>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PrintPreview
      isOpen
      title="Pratinjau Laporan Perjalanan Dinas"
      onClose={onClose}
      className="laporan-print-sheet w-[215mm] min-h-[330mm] print:overflow-visible"
    >
      <div
        className="laporan-document-content text-slate-900"
        style={{
          fontFamily: '"Bookman Old Style", Bookman, "URW Bookman", "TeX Gyre Bonum", Georgia, serif',
          fontSize: "12pt",
          lineHeight: "1.35",
          textAlign: "left",
        }}
      >
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

        <div className="text-center my-4">
          <h2 className="laporan-judul font-black uppercase whitespace-pre-line text-[13pt] leading-tight">
            {judulLaporan}
          </h2>
        </div>

        <div className="space-y-5 text-[12pt] leading-[1.35]">
          <SectionBlock code="A." title="Dasar Pelaksanaan">
            <table className="w-full text-[12pt] leading-[1.35]">
              <tbody>
                <tr>
                  <td className="w-48 align-top">Surat Tugas</td>
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
            <p className="whitespace-pre-wrap text-justify text-[12pt] leading-[1.35]">{item.maksud}</p>
          </SectionBlock>

          <SectionBlock code="C." title="Tujuan Kegiatan">
            {renderNumberedList(item.tujuan)}
          </SectionBlock>

          <SectionBlock code="D." title="Tempat dan Waktu Pelaksanaan">
            <table className="w-full text-[12pt] leading-[1.35]">
              <tbody>
                <tr>
                  <td className="w-48 align-top">Tempat Pelaksanaan</td>
                  <td className="w-4 align-top">:</td>
                  <td>{tempatPelaksanaan}</td>
                </tr>
                <tr>
                  <td className="align-top">Hari / Tanggal</td>
                  <td className="align-top">:</td>
                  <td>{hariTanggalPelaksanaan}</td>
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
            <p className="whitespace-pre-wrap text-justify laporan-closing-sentence text-[12pt] leading-[1.35]">
              {item.kalimatPenutup}
            </p>
          )}
        </div>

        <section className="mt-10 laporan-signature-section">
          <table className="w-full table-fixed border-0 text-[12pt] leading-[1.35]">
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

        <section className="mt-8 laporan-section laporan-documentation-section">
          <div className="flex items-start gap-x-2">
            <span className="font-bold w-6 shrink-0 laporan-section-code">G.</span>
            <div className="flex-1 min-w-0">
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
          </div>
        </section>
      </div>
      <style jsx global>{`
        .laporan-print-sheet {
          width: 215mm !important;
          min-height: 330mm !important;
          padding: 14mm 20mm 20mm 20mm !important;
        }

        .laporan-print-sheet > .pt-10 {
          padding-top: 0 !important;
        }

        .laporan-document-content {
          font-family: "Bookman Old Style", Bookman, "URW Bookman", "TeX Gyre Bonum", Georgia, serif !important;
          font-size: 12pt !important;
          line-height: 1.35 !important;
          display: block !important;
          width: 100% !important;
        }

        .laporan-document-content p,
        .laporan-document-content td,
        .laporan-document-content th,
        .laporan-document-content li,
        .laporan-document-content ol,
        .laporan-document-content ul {
          font-family: "Bookman Old Style", Bookman, "URW Bookman", "TeX Gyre Bonum", Georgia, serif !important;
          font-size: 12pt !important;
          line-height: 1.35 !important;
        }

        .laporan-section-code,
        .laporan-section-title {
          font-family: "Bookman Old Style", Bookman, "URW Bookman", "TeX Gyre Bonum", Georgia, serif !important;
          font-size: 12pt !important;
          font-weight: 700 !important;
          line-height: 1.35 !important;
        }

        .laporan-judul {
          font-family: "Bookman Old Style", Bookman, "URW Bookman", "TeX Gyre Bonum", Georgia, serif !important;
          font-size: 13pt !important;
          font-weight: 900 !important;
        }

        .docx-preview-container .docx-wrapper {
          background: transparent !important;
          padding: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          width: 100% !important;
        }

        .docx-preview-container .docx-wrapper > section.docx {
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
          margin-bottom: 24px !important;
          background: white !important;
          color: black !important;
          max-width: 100% !important;
          overflow-x: auto !important;
        }

        @media print {
          @page {
            size: 215mm 330mm;
            margin: ${template.margin}mm;
          }

          body * {
            visibility: hidden;
          }

          .print-direct,
          .print-direct * {
            visibility: visible;
          }

          .print-direct {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          .laporan-print-sheet.print-container {
            box-sizing: border-box !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 0 !important;
            max-height: none !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            page-break-after: auto !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }

          .laporan-print-sheet > .pt-10 {
            padding-top: 0 !important;
            margin: 0 !important;
            display: block !important;
          }

          .laporan-document-content {
            font-family: "Bookman Old Style", Bookman, "URW Bookman", "TeX Gyre Bonum", Georgia, serif !important;
            font-size: 12pt !important;
            line-height: 1.35 !important;
            display: block !important;
            width: 100% !important;
          }

          .laporan-document-content p,
          .laporan-document-content td,
          .laporan-document-content th,
          .laporan-document-content li,
          .laporan-document-content ol,
          .laporan-document-content ul {
            font-family: "Bookman Old Style", Bookman, "URW Bookman", "TeX Gyre Bonum", Georgia, serif !important;
            font-size: 12pt !important;
            line-height: 1.35 !important;
          }

          .laporan-section-code,
          .laporan-section-title {
            font-family: "Bookman Old Style", Bookman, "URW Bookman", "TeX Gyre Bonum", Georgia, serif !important;
            font-size: 12pt !important;
            font-weight: 700 !important;
            line-height: 1.35 !important;
          }

          .laporan-judul {
            font-family: "Bookman Old Style", Bookman, "URW Bookman", "TeX Gyre Bonum", Georgia, serif !important;
            font-size: 13pt !important;
            font-weight: 900 !important;
          }

          .laporan-section {
            break-inside: auto !important;
            page-break-inside: auto !important;
          }

          .laporan-section-code,
          .laporan-section-title {
            break-after: avoid !important;
            page-break-after: avoid !important;
          }

          .laporan-flow-list,
          .laporan-flow-list li {
            break-inside: auto !important;
            page-break-inside: auto !important;
          }

          .laporan-closing-sentence {
            break-inside: auto !important;
            page-break-inside: auto !important;
          }

          .laporan-signature-section {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .laporan-documentation-section {
            break-before: page !important;
            page-break-before: always !important;
            break-inside: auto !important;
            page-break-inside: auto !important;
            margin-top: 0 !important;
          }

          .laporan-signature-row {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .laporan-print-sheet figure {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </PrintPreview>
  );
}
