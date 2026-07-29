# COMPLETION REPORT — Kalkulasi Lampiran Nota Dinas Luar Daerah

> Catatan koreksi 19 Juli 2026: batas maksimum Uang Harian Full dan sinkronisasi seluruh subtotal Nota Dinas ke dokumen keuangan telah digantikan oleh aturan realisasi bukti SPJ pada `COMPLETION-SPJ-ACTUAL-COST-SOURCE.md`. Ketentuan Paket Meeting yang sebelumnya mengikuti durasi juga telah digantikan oleh volume manual pada `COMPLETION-NOTA-DINAS-MANUAL-MEETING-DAYS.md`.

## Phase

Perbaikan kalkulasi Lampiran Nota Dinas dan sinkronisasi dokumen keuangan.

## Status

Completed — Ready for Review.

## Modul

- Nota Dinas
- Approval Nota Dinas
- Validasi SPJ dan Dokumen Keuangan
- SPBY
- Daftar Nominatif
- Tanda Terima
- Kuitansi

## BP

- BP-01 — Pembuatan dan Approval Nota Dinas
- BP-05 — Validasi SPJ dan Pembayaran
- BP-06 — Proses Dokumen Keuangan

## FR

- FR-022 — Lampiran mengikuti jenis Nota Dinas.
- FR-023 — Tarif dapat berasal dari Master Standar Biaya Masukan.
- FR-024 — Rincian biaya dihitung otomatis.
- FR-047 — Daftar Nominatif dihasilkan dari rincian sumber.
- FR-078 — Dokumen keuangan mengikuti granularitas personel/kolektif.
- FR-095 — Kalkulasi Luar Daerah menggunakan volume per komponen dan subtotal yang sama pada dokumen keuangan.

## File Dibuat

- `src/modules/nota-dinas/nota-dinas-calculation.ts`
- `AI/COMPLETION-NOTA-DINAS-LUAR-DAERAH-CALCULATION.md`

## File Diubah

- `src/modules/nota-dinas/nota-dinas.schema.ts`
- `src/modules/nota-dinas/nota-dinas.service.ts`
- `src/modules/nota-dinas/components/NotaDinasForm.tsx`
- `src/app/(dashboard)/nota-dinas/page.tsx`
- `src/modules/approval/components/ApprovalDetail.tsx`
- `src/modules/keuangan/keuangan.service.ts`
- `src/modules/keuangan/useKeuangan.ts`
- `src/modules/keuangan/components/DokumenPreview.tsx`
- `DOCS/PRD.md`
- `DOCS/IMPLEMENTATION-PLAN.md`

## Reusable Component

- Komponen UI yang sudah ada tetap digunakan: `Input`, `Select`, `Alert`, `Dialog`, dan `PrintExportActions`.
- Tidak ada arsitektur UI baru.

## Hook

- `useKeuangan` sekarang memasukkan signature total rincian Nota Dinas pada query key agar perubahan sumber memicu rekonsiliasi dokumen keuangan.

## Service

- `nota-dinas-calculation.ts` menjadi kalkulator tunggal tarif, volume, subtotal, dan total.
- `notaDinasService` menormalisasi data lama serta menghitung ulang subtotal dan total biaya.
- `keuanganService` menggunakan breakdown yang sama dan merekonsiliasi rincian dokumen mock terhadap Nota Dinas sumber.

## Store

- Tidak ada store baru.

## Schema

- Menambahkan `uangHarianFull`.
- Menambahkan `volumeUangHarianFull` dengan validasi bilangan bulat 0 sampai 2.
- Field lama tetap dipertahankan untuk kompatibilitas data.

## Route

- Tidak ada route baru.
- Route terdampak: `/nota-dinas`, `/approval`, `/spj`, `/spby`, `/daftar-nominatif`, `/tanda-terima`, dan `/kuitansi`.

## Aturan Kalkulasi

Untuk Luar Daerah:

- Tiket Pesawat = tarif × 2 kali.
- Uang Harian Paket Meeting = tarif × durasi kegiatan.
- Uang Harian Full = tarif × 0–2 hari opsional.
- Transport = tarif × durasi kegiatan.
- Penginapan = tarif × `max(durasi kegiatan - 1, 0)` malam.
- Transport Bandara Asal = tarif × 2 kali.
- Transport Bandara Tujuan = tarif × 2 kali.
- Total = jumlah seluruh subtotal.

Komponen dengan subtotal nol tidak ditampilkan pada preview/cetak Nota Dinas maupun kolom Daftar Nominatif.

## Testing

- Uji kalkulator 3 hari: meeting 3, transport 3, penginapan 2, tiket 2, bandara asal 2, bandara tujuan 2, dan full 2 — lulus.
- `npx tsc --noEmit` — lulus.
- ESLint seluruh file perubahan — lulus tanpa warning/error.
- `npm run lint` — lulus dengan 10 warning lama pada Demo Components dan SPT; tidak berasal dari perubahan ini.
- `npm run build` — lulus; 33 static pages berhasil dibentuk dan konfigurasi PWA berhasil dikompilasi.
- Smoke test `GET /nota-dinas` pada development server aktif — HTTP 200 dan guard mengarahkan ke `/login`.
- Verifikasi browser terintegrasi belum dapat dilakukan karena layanan browser tidak tersedia pada sesi ini.

## Outstanding Issues

- Backend API belum tersedia; persistence dan rekonsiliasi masih menggunakan localStorage/mock service.
- Nilai tiket/bandara pada data lama sekarang ditafsirkan sebagai tarif satu kali. Data historis yang sebelumnya diisi sebagai nilai total pulang-pergi perlu ditinjau satu kali oleh pengguna.
- QA visual form dan hasil cetak perlu dikonfirmasi pengguna pada browser/printer fisik.

## Risiko

- Perubahan tarif atau durasi pada Nota Dinas sumber akan memperbarui nominal dokumen keuangan mock ketika daftar SPJ dimuat. Ini disengaja untuk menjaga satu sumber nominal, tetapi dokumen historis perlu diverifikasi sebelum digunakan sebagai arsip final.

## Catatan

- Tidak ada perubahan workflow, role, approval, penomoran, maupun relasi Document ID.
- Source of Truth diperbarui ke PRD versi 1.16 dan Implementation Plan versi 1.3.
