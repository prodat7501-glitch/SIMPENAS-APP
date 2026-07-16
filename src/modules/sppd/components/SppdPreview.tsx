"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintExportActions } from "@/components/ui/print-export-actions";
import type { DIPA } from "@/modules/dipa/dipa.schema";
import type { Jabatan } from "@/modules/jabatan/jabatan.schema";
import type { Pangkat } from "@/modules/pangkat/pangkat.schema";
import type { Pegawai } from "@/modules/pegawai/pegawai.schema";
import type { Penandatangan } from "@/modules/penandatangan/penandatangan.schema";
import type { Spt } from "@/modules/spt/spt.schema";
import { useDocumentTemplate } from "@/providers/TemplateProvider";
import type { Sppd } from "../sppd.schema";

interface SppdPreviewProps {
  item: Sppd | null;
  mode: "page1" | "page2";
  spts: Spt[];
  pegawais: Pegawai[];
  jabatans: Jabatan[];
  pangkats: Pangkat[];
  dipas: DIPA[];
  penandatangans: Penandatangan[];
  onClose: () => void;
}

const formatTanggalIndonesia = (dateStr: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));

export function SppdPreview({
  item,
  mode,
  spts,
  pegawais,
  jabatans,
  pangkats,
  dipas,
  penandatangans,
  onClose,
}: SppdPreviewProps) {
  const template = useDocumentTemplate();
  const spt = item ? spts.find((data) => data.id === item.sptId) : null;
  const dipa = item ? dipas.find((data) => data.id === item.dipaId) : null;
  const penandatangan = item
    ? penandatangans.find((data) => data.id === item.penandatanganId)
    : null;

  const getPegawai = (pegawaiId: string) =>
    pegawais.find((pegawai) => pegawai.id === pegawaiId);
  const pegawai = item?.personil[0]
    ? getPegawai(item.personil[0].pegawaiId)
    : null;
  const jabatan = pegawai
    ? jabatans.find((data) => data.id === pegawai.jabatanId)
    : null;
  const pangkat = pegawai
    ? pangkats.find((data) => data.id === pegawai.pangkatId)
    : null;

  if (!item) return null;

  const isSppdKomisioner =
    pegawai?.kategoriPegawai === "Ketua KPU" ||
    pegawai?.kategoriPegawai === "Anggota KPU";
  const ppkPenandatangan = penandatangans.find((data) => {
    const roleText =
      `${data.peran ?? ""} ${data.jabatanPenandatangan ?? ""}`.toLowerCase();

    return (
      data.status === "Aktif" &&
      (roleText.includes("ppk") ||
        roleText.includes("pejabat pembuat komitmen"))
    );
  });
  const effectivePenandatangan = isSppdKomisioner
    ? ppkPenandatangan ?? penandatangan
    : penandatangan;

  const manualPage2Signers = item.tandaTanganHalaman2 ?? [];
  const roman = (value: number) => {
    const romans: Array<[number, string]> = [
      [1000, "M"],
      [900, "CM"],
      [500, "D"],
      [400, "CD"],
      [100, "C"],
      [90, "XC"],
      [50, "L"],
      [40, "XL"],
      [10, "X"],
      [9, "IX"],
      [5, "V"],
      [4, "IV"],
      [1, "I"],
    ];
    let remaining = value;
    let result = "";
    romans.forEach(([number, symbol]) => {
      while (remaining >= number) {
        result += symbol;
        remaining -= number;
      }
    });
    return `${result}.`;
  };
  const page2Count = Math.max(Number(item.jumlahKolomHalaman2 ?? 6), 1);
  const trimPage2Text = (value?: string) => value?.trim() ?? "";
  const hasCustomPage2Route = manualPage2Signers.some(
    (signer) =>
      !!trimPage2Text(signer?.tibaDi) ||
      !!signer?.tanggalTiba ||
      !!trimPage2Text(signer?.berangkatDari) ||
      !!trimPage2Text(signer?.ke) ||
      !!signer?.tanggalBerangkat,
  );
  const manualPage2Count = Math.max(page2Count - 1, 0);
  const visibleManualPage2Count = manualPage2Count;
  const finalRoman = visibleManualPage2Count + 2;
  const catatanRoman = finalRoman + 1;
  const perhatianRoman = finalRoman + 2;
  const page2ValueClass =
    "whitespace-normal break-words text-[13px] leading-[1.18]";
  const renderPage2SignatureName = (value?: string) => {
    const name = value?.trim() ?? "";

    if (!name) {
      return <div className="h-[14px] border-b border-black" />;
    }

    return (
      <div className="max-h-[27px] overflow-hidden whitespace-normal break-words text-center text-[13px] leading-[1.05]">
        <span
          className="inline-block max-w-full border-b border-black px-[1mm]"
        >
          {name}
        </span>
      </div>
    );
  };
  const renderPage2Nip = (nip?: string, hasSignatureIdentity = false) => (
    <p
      className={`text-[13px] leading-[1.05] ${
        hasSignatureIdentity ? "text-center" : "text-left"
      }`}
    >
      {nip ? `NIP. ${nip}` : "NIP."}
    </p>
  );
  const page2ManualRowHeight =
    page2Count > 7 ? "h-[25mm]" : page2Count > 6 ? "h-[29mm]" : "h-[33mm]";
  const tempatKedudukan = "Komisi Pemilihan Umum Kabupaten Gorontalo";
  const tempatKedudukanHalaman2 =
    manualPage2Signers.reduce(
      (lastKe, signer) => trimPage2Text(signer?.ke) || lastKe,
      "",
    ) || tempatKedudukan;
  const normalizePage2Place = (value?: string) =>
    trimPage2Text(value).toLowerCase();
  const formatPage2Date = (value?: string) =>
    value ? formatTanggalIndonesia(value) : "";
  const getPage2ManualRoute = (index: number) => {
    const manual = manualPage2Signers[index];
    const previousKe =
      index > 0 ? trimPage2Text(manualPage2Signers[index - 1]?.ke) : "";
    const previousKeIsTempatKedudukan =
      !!previousKe &&
      normalizePage2Place(previousKe) ===
        normalizePage2Place(tempatKedudukanHalaman2);
    const tibaFallback =
      index === 0
        ? item.tempatTujuan
        : previousKeIsTempatKedudukan
          ? ""
          : previousKe;
    const tibaDi = trimPage2Text(manual?.tibaDi) || tibaFallback;
    const tanggalTiba =
      manual?.tanggalTiba || (index === 0 ? item.tanggalBerangkat : "");
    const berangkatDari =
      trimPage2Text(manual?.berangkatDari) ||
      tibaDi ||
      (index === 0 ? item.tempatTujuan : "");
    const ke =
      trimPage2Text(manual?.ke) ||
      (!hasCustomPage2Route && index === 0 ? tempatKedudukanHalaman2 : "");
    const tanggalBerangkat =
      manual?.tanggalBerangkat || (index === 0 ? item.tanggalKembali : "");

    return {
      tibaDi,
      tanggalTiba,
      berangkatDari,
      ke,
      tanggalBerangkat,
    };
  };
  const renderPage2Fields = (
    rows: Array<{
      label: string;
      value?: string;
      subLabel?: string;
      roman?: string;
    }>,
    options?: { compact?: boolean; tightRoman?: boolean },
  ) => (
    <table className="w-full table-fixed border-collapse text-[14px] leading-[1.15]">
      <colgroup>
        <col
          className={
            options?.compact ? "w-0" : options?.tightRoman ? "w-[7mm]" : "w-[12mm]"
          }
        />
        <col className={options?.compact ? "w-[31mm]" : "w-[31mm]"} />
        <col className="w-[3mm]" />
        <col />
      </colgroup>
      <tbody>
        {rows.map((row) => (
          <tr key={`${row.roman ?? ""}${row.label}`}>
            <td
              className={`py-[0.4mm] align-top ${
                options?.compact ? "px-0" : "px-[0.6mm]"
              }`}
            >
              {row.roman ?? ""}
            </td>
            <td
              className={`py-[0.4mm] align-top ${
                options?.compact ? "px-0" : "px-[0.6mm]"
              }`}
            >
              <span className="whitespace-nowrap">{row.label}</span>
              {row.subLabel ? (
                <span className="block text-[11px] leading-[1]">
                  {row.subLabel}
                </span>
              ) : null}
            </td>
            <td className="px-0 py-[0.4mm] align-top text-center">:</td>
            <td
              className={`px-[0.8mm] py-[0.4mm] align-top ${page2ValueClass}`}
              title={row.value ?? ""}
            >
              {row.value ?? ""}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print-direct">
        <div
          className="bg-white text-black w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl shadow-2xl print-container relative my-auto p-7"
        >
          <div className="absolute top-4 right-4 flex items-center gap-2 no-print">
            <PrintExportActions
              title={`SPPD ${item.nomor}${mode === "page2" ? " Halaman 2" : ""}`}
              module="SPPD"
              description={`Mencetak atau mengekspor SPPD ${item.nomor}`}
              printLabel={mode === "page1" ? "Cetak SPPD" : "Cetak Halaman 2"}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-black hover:bg-black/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {mode === "page1" && (
          <div
            className="min-h-[297mm] border-2 border-black p-5 text-[15px] leading-[1.18]"
            style={{ fontFamily: '"Bookman Old Style", Bookman, Georgia, serif' }}
          >
            <div className="grid grid-cols-[1fr_1.1fr] gap-8">
              <div className="flex items-center gap-4">
                <Image
                  src={template.logo}
                  alt="Logo KPU"
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                />
                <div className="text-[17px] font-black uppercase leading-[1.15]">
                  <p>KOMISI PEMILIHAN UMUM</p>
                  <p>KABUPATEN GORONTALO</p>
                </div>
              </div>
              <div className="space-y-3 text-[16px] leading-[1.15]">
                <div className="grid grid-cols-[110px_16px_1fr]">
                  <span>Lembar Ke</span>
                  <span>:</span>
                  <span>1 (satu)</span>
                </div>
                <div className="grid grid-cols-[110px_16px_1fr]">
                  <span>Kode No</span>
                  <span>:</span>
                  <span />
                </div>
                <div className="grid grid-cols-[110px_16px_1fr] pt-5">
                  <span>Nomor</span>
                  <span>:</span>
                  <span>{item.nomor}</span>
                </div>
              </div>
            </div>

            <h3 className="py-8 text-center text-[18px] font-black uppercase leading-none">
              SURAT PERJALANAN DINAS (SPD)
            </h3>

            <table className="w-full border-2 border-black border-collapse text-[16px] leading-[1.18]">
              <tbody>
                <tr>
                  <td className="border-2 border-black px-2 py-0.5 align-top text-center w-10">
                    1
                  </td>
                  <td className="border-2 border-black px-2 py-0.5 align-top w-[41%]">
                    Pejabat Pembuat Komitmen
                  </td>
                  <td className="border-2 border-black px-5 py-0.5 align-top font-normal">
                    {effectivePenandatangan?.nama ?? "-"}
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 py-0.5 align-top text-center">
                    2
                  </td>
                  <td className="border-2 border-black px-2 py-1 align-top leading-[1.35]">
                    Nama/NIP Pegawai yang
                    <br />
                    melaksanakan perjalanan dinas
                  </td>
                  <td className="border-2 border-black px-5 py-1 align-top space-y-2 leading-[1.35]">
                    <p>{pegawai?.nama ?? "-"}</p>
                    <p>NIP. {pegawai?.nip || "-"}</p>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 py-0.5 align-top text-center">
                    3
                  </td>
                  <td className="border-2 border-black px-2 py-1 align-top space-y-3 leading-[1.35]">
                    <p>
                      a.&nbsp;&nbsp;&nbsp; Pangkat dan Golongan
                    </p>
                    <p>
                      b.&nbsp;&nbsp;&nbsp; Jabatan/Instansi
                    </p>
                    <p className="pt-6">
                      c.&nbsp;&nbsp;&nbsp; Tingkat Biaya Perjalanan Dinas
                    </p>
                  </td>
                  <td className="border-2 border-black px-5 py-1 align-top space-y-3 leading-[1.35]">
                    <p>
                      a.&nbsp;&nbsp;{" "}
                      {pangkat
                        ? `${pangkat.namaPangkat},${pangkat.golongan}`
                        : "-"}
                    </p>
                    <p>b.&nbsp;&nbsp; {jabatan?.nama ?? "-"}</p>
                    <p className="pt-6">c.&nbsp;&nbsp; C</p>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 py-0.5 align-top text-center">
                    4
                  </td>
                  <td className="border-2 border-black px-2 py-0.5 align-top">
                    Maksud Perjalanan Dinas
                  </td>
                  <td className="border-2 border-black px-2 py-0.5 align-top min-h-24">
                    <p className="min-h-24 text-justify">{item.maksud}</p>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 py-0.5 align-top text-center">
                    5
                  </td>
                  <td className="border-2 border-black px-2 py-0.5 align-top">
                    Alat Angkutan yang dipergunakan
                  </td>
                  <td className="border-2 border-black px-5 py-0.5 align-top">
                    {item.transportasi}
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 py-0.5 align-top text-center">
                    6
                  </td>
                  <td className="border-2 border-black px-2 py-1 align-top space-y-2 leading-[1.35]">
                    <p>a.&nbsp;&nbsp;&nbsp; Tempat Berangkat</p>
                    <p>b.&nbsp;&nbsp;&nbsp; Tempat Tujuan</p>
                  </td>
                  <td className="border-2 border-black px-5 py-1 align-top space-y-2 leading-[1.35]">
                    <p>a.&nbsp;&nbsp; {item.tempatBerangkat}</p>
                    <p>b.&nbsp;&nbsp; {item.tempatTujuan}</p>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 py-0.5 align-top text-center">
                    7
                  </td>
                  <td className="border-2 border-black px-2 py-1 align-top space-y-1 leading-[1.25]">
                    <p>a.&nbsp;&nbsp;&nbsp; Lamanya Perjalanan Dinas</p>
                    <p>b.&nbsp;&nbsp;&nbsp; Tanggal berangkat</p>
                    <p>
                      c.&nbsp;&nbsp;&nbsp; Tanggal harus kembali/tiba di
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; tempat baru *)
                    </p>
                  </td>
                  <td className="border-2 border-black px-5 py-1 align-top space-y-1 leading-[1.25]">
                    <p>a.&nbsp;&nbsp; {item.lamaPerjalanan} Hari</p>
                    <p>b.&nbsp;&nbsp; {formatTanggalIndonesia(item.tanggalBerangkat)}</p>
                    <p>c.&nbsp;&nbsp; {formatTanggalIndonesia(item.tanggalKembali)}</p>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 py-0.5 align-top text-center">
                    8
                  </td>
                  <td className="border-2 border-black px-2 py-0 align-top">
                    <div className="grid grid-cols-[1fr_1fr_1fr]">
                      <span>Pengikut :</span>
                      <span>Nama</span>
                    </div>
                  </td>
                  <td className="border-2 border-black p-0 align-top">
                    <div className="grid grid-cols-2 divide-x-2 divide-black text-center">
                      <span>Tanggal Lahir</span>
                      <span>Keterangan</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 align-top text-center" />
                  <td className="border-2 border-black px-2 py-0.5 align-top h-20 leading-[1.12]">
                    <p>1.</p>
                    <p>2.</p>
                    <p>3.</p>
                    <p>4.</p>
                    <p>5.</p>
                  </td>
                  <td className="border-2 border-black p-0 align-top">
                    <div className="grid h-full grid-cols-2 divide-x-2 divide-black">
                      <span />
                      <span />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 py-0.5 align-top text-center">
                    9
                  </td>
                  <td className="border-2 border-black px-2 py-1 align-top space-y-2 leading-[1.3]">
                    <p>Pembebanan Anggaran</p>
                    <p>a.&nbsp;&nbsp;&nbsp; Instansi</p>
                    <p>b.&nbsp;&nbsp;&nbsp; Akun</p>
                  </td>
                  <td className="border-2 border-black px-5 py-1 align-top space-y-2 leading-[1.3]">
                    <p>&nbsp;</p>
                    <p>a.&nbsp;&nbsp; {item.instansi}</p>
                    <p>b.&nbsp;&nbsp; {dipa?.kodeDipa ?? "0"}</p>
                  </td>
                </tr>
                <tr>
                  <td className="border-2 border-black px-2 py-0.5 align-top text-center">
                    10
                  </td>
                  <td className="border-2 border-black px-2 py-0.5 align-top">
                    Keterangan lain-lain
                  </td>
                  <td className="border-2 border-black px-5 py-0.5 align-top">
                    ST No. {spt?.nomor ?? "-"}{" "}
                    {formatTanggalIndonesia(spt?.tanggalMulai ?? item.tanggalBerangkat)}
                  </td>
                </tr>
              </tbody>
            </table>

            <p className="pl-14 text-[15px]">Coret yang tidak perlu *)</p>

            <div className="ml-auto mt-4 w-[46%] space-y-20 text-[16px] leading-[1.2]">
              <div>
                <p>Dikeluarkan di Limboto</p>
                <p>Tanggal {formatTanggalIndonesia(item.tanggalBerangkat)}</p>
                <p>Pejabat Pembuat Komitmen</p>
              </div>
              <div>
                <p>{effectivePenandatangan?.nama ?? "-"}</p>
                <p>NIP. {effectivePenandatangan?.nip ?? "-"}</p>
              </div>
            </div>
          </div>
          )}

          {mode === "page2" && (
          <div
            className="h-[330mm] w-[215mm] p-[6mm] text-[14px] leading-[1.15] print:h-[330mm] print:w-[215mm] print:p-[6mm]"
            style={{ fontFamily: '"Bookman Old Style", Bookman, Georgia, serif' }}
          >
            <table className="w-full table-fixed border border-black border-collapse text-[14px] leading-[1.15]">
              <colgroup>
                <col className="w-1/2" />
                <col className="w-1/2" />
              </colgroup>
              <tbody>
                <tr className="h-[8mm]">
                  <td className="border-0 px-[1.5mm] py-[0.8mm] align-top text-[15px] leading-[1.1]">
                    Lampiran SPPD Tanggal :{" "}
                    {formatTanggalIndonesia(item.tanggalBerangkat)}
                  </td>
                  <td className="border-0 px-[1.5mm] py-[0.8mm] align-top text-center text-[15px] leading-[1.1]">
                    Nomor : {item.nomor}
                  </td>
                </tr>
                <tr className="h-[58mm]">
                  <td className="border border-black p-[2mm] align-top" />
                  <td className="border border-black p-[2mm] align-top">
                    {renderPage2Fields([
                      {
                        roman: "I.",
                        label: "Berangkat dari",
                        value: item.tempatBerangkat,
                      },
                      { label: "(Tempat Kedudukan)" },
                      { label: "Ke", value: item.tempatTujuan },
                      {
                        label: "Pada Tanggal",
                        value: formatTanggalIndonesia(item.tanggalBerangkat),
                      },
                      {
                        label: "Kepala",
                        value: effectivePenandatangan?.jabatanPenandatangan ?? "",
                      },
                    ])}
                    <div className="ml-[12mm] mt-[28mm] w-[78mm]">
                      <div title={effectivePenandatangan?.nama ?? ""}>
                        {renderPage2SignatureName(effectivePenandatangan?.nama)}
                      </div>
                      {renderPage2Nip(
                        effectivePenandatangan?.nip,
                        !!effectivePenandatangan?.nama ||
                          !!effectivePenandatangan?.nip,
                      )}
                    </div>
                  </td>
                </tr>
                {Array.from({ length: visibleManualPage2Count }, (_, index) => {
                  const manual = manualPage2Signers[index];
                  const route = getPage2ManualRoute(index);
                  return (
                  <tr key={roman(index + 2)} className={page2ManualRowHeight}>
                    <td className="border border-black p-[2mm] align-top">
                      <div className="h-[26mm] overflow-hidden">
                        {renderPage2Fields(
                          [
                            {
                              roman: roman(index + 2),
                              label: "Tiba di",
                              value: route.tibaDi,
                            },
                            {
                              label: "Pada Tanggal",
                              value: formatPage2Date(route.tanggalTiba),
                            },
                            { label: "Kepala", value: manual?.jabatan ?? "" },
                          ],
                          { tightRoman: true },
                        )}
                      </div>
                      <div
                        className="ml-[8mm] mt-[13mm] w-[86mm]"
                        title={manual?.nama ?? ""}
                      >
                        {renderPage2SignatureName(manual?.nama)}
                        {renderPage2Nip(manual?.nip, !!manual?.nama || !!manual?.nip)}
                      </div>
                    </td>
                    <td className="border border-black p-[2mm] align-top">
                      <div className="h-[26mm] overflow-hidden">
                        {renderPage2Fields(
                          [
                            {
                              label: "Berangkat dari",
                              value: route.berangkatDari,
                            },
                            {
                              label: "Ke",
                              value: route.ke,
                            },
                            {
                              label: "Pada Tanggal",
                              value: formatPage2Date(route.tanggalBerangkat),
                            },
                            { label: "Kepala", value: manual?.jabatan ?? "" },
                          ],
                          { compact: true },
                        )}
                      </div>
                      <div
                        className="mt-[13mm] w-[86mm]"
                        title={manual?.nama ?? ""}
                      >
                        {renderPage2SignatureName(manual?.nama)}
                        {renderPage2Nip(manual?.nip, !!manual?.nama || !!manual?.nip)}
                      </div>
                    </td>
                  </tr>
                  );
                })}
                <tr className="h-[16mm]">
                  <td className="border border-black p-[1.2mm] align-top">
                    {renderPage2Fields([
                      {
                        roman: roman(finalRoman),
                        label: "Tiba di",
                        subLabel: "(Tempat Kedudukan)",
                        value: tempatKedudukanHalaman2,
                      },
                      {
                        label: "Pada Tanggal",
                        value: formatTanggalIndonesia(item.tanggalKembali),
                      },
                    ])}
                  </td>
                  <td className="border border-black p-[1.2mm] text-justify align-top leading-[1.2]">
                    Telah diperiksa dengan keterangan bahwa perjalanan tersebut
                    atas perintahnya dan semata-mata untuk kepentingan jabatan
                    dalam waktu yang sesingkat-singkatnya
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="border border-black p-0">
                    <table className="h-[34mm] w-full table-fixed border-collapse text-center">
                      <colgroup>
                        <col className="w-1/2" />
                        <col className="w-1/2" />
                      </colgroup>
                      <tbody>
                        <tr>
                          {[0, 1].map((index) => (
                            <td
                              key={index}
                              className={`px-[2mm] py-[1.5mm] align-top ${
                                index === 0 ? "border-r border-black" : ""
                              }`}
                            >
                              <p className="leading-[1.05]">
                                Pejabat Pembuat Komitmen
                              </p>
                              <div
                                className="mt-[17mm]"
                                title={effectivePenandatangan?.nama ?? ""}
                              >
                                {renderPage2SignatureName(
                                  effectivePenandatangan?.nama,
                                )}
                                {renderPage2Nip(
                                  effectivePenandatangan?.nip,
                                  !!effectivePenandatangan?.nama ||
                                    !!effectivePenandatangan?.nip,
                                )}
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="h-[6mm] border border-black px-[2mm] leading-[1.1]">
                    {roman(catatanRoman)} &nbsp; Catatan Lain-Lain
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className="h-[24mm] border border-black px-[2mm] py-[1.5mm] leading-[1.2]">
                    <p>{roman(perhatianRoman)} &nbsp; PERHATIAN</p>
                    <p>
                      PPK yang menerbitkan SPD, pegawai yang melakukan
                      perjalanan dinas, para pejabat yang mengesahkan tanggal
                      berangkat/tiba, serta bendahara pengeluaran bertanggung
                      jawab berdasarkan peraturan-peraturan Keuangan Negara
                      apabila negara menderita rugi akibat kesalahan, kelalaian,
                      dan kealpaannya.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        @media print {
          ${mode === "page2"
            ? `
          @page {
            size: 215mm 330mm;
            margin: 0;
          }
          `
            : ""}
          body * {
            visibility: hidden;
          }
          .print-direct,
          .print-direct * {
            visibility: visible;
          }
          .print-direct {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          .print-container {
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
