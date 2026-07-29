# Completion Report — Financial Document Print Layout F4

## Phase

Penyempurnaan Pratinjau Cetak Dokumen Keuangan

## Status

Completed

## Modul

- SPBY
- Daftar Nominatif
- Tanda Terima
- Kuitansi
- Shared Print Preview

## BP

- BP-06 — Administrasi Keuangan dan Pembayaran

## FR

- FR-046 s.d. FR-050
- FR-078
- FR-083
- FR-116

## File Dibuat

- `AI/COMPLETION-FINANCIAL-PRINT-LAYOUT-F4.md`

## File Diubah

- `src/modules/keuangan/components/DokumenPreview.tsx`
- `src/components/ui/print-preview.tsx`
- `src/app/globals.css`
- `DOCS/PRD.md`
- `DOCS/UI-GUIDELINES.md`
- `DOCS/IMPLEMENTATION-PLAN.md`

## Reusable Component

- `PrintPreview` ditambah kontrak `printPageSize` untuk menyisipkan metadata ukuran halaman pada media print.
- `AutoScaleSignatureName` digunakan untuk nama Bendahara, penerima uang muka, dan PPK pada SPBY.
- `RecipientSignature` tetap menerapkan aturan NIP berdasarkan kategori penerima.

## Hook

Tidak ada hook yang diubah.

## Service

Tidak ada service atau business logic yang diubah.

## Store

Tidak ada store atau data yang diubah.

## Schema

Tidak ada schema yang diubah.

## Route

Tidak ada route produksi yang ditambah atau diubah.

## Testing

- `npx.cmd tsc --noEmit` — Passed.
- `npx.cmd eslint src/components/ui/print-preview.tsx src/modules/keuangan/components/DokumenPreview.tsx` — Passed.
- `npm.cmd run build` — Passed; Next.js 16.2.10 webpack dan PWA berhasil dikompilasi.
- Chrome headless `Page.printToPDF` dengan `preferCSSPageSize` — Passed.
- SPBY — 1 halaman F4 portrait (`609.12 x 935.04 pt`), tanpa border luar; alamat satu baris; Tanggal/Nomor berdekatan; tiga identitas tanda tangan satu baris dan NIP sejajar.
- Daftar Nominatif — 1 halaman F4 landscape (`935.04 x 609.12 pt`) dengan delapan baris stress-test.
- Tanda Terima — 1 halaman F4 portrait; bullet, perkalian, dan nominal setiap komponen sejajar secara vertikal.
- Kuitansi — 1 halaman F4 portrait, tanpa border luar; tanggal pelunasan menampilkan `21 Juli 2026` dari snapshot konfirmasi pembayaran.
- Seluruh PDF hasil uji dirender menjadi PNG dan diperiksa secara visual; artefak serta route verifikasi sementara sudah dihapus.

## Outstanding Issues

- Opsi bernama **Use page size to select paper source** merupakan kontrol driver/browser dan tidak dapat dicentang lewat aplikasi web. Dokumen kini memasok metadata ukuran F4 yang benar agar opsi tersebut dapat bekerja ketika tersedia pada dialog cetak.
- Printer fisik tetap harus mempunyai ukuran F4/Folio `215 x 330 mm` pada driver.

## Catatan

- Tidak ada perubahan workflow, sumber data, atau kalkulasi keuangan.
- Tanggal Kuitansi tidak memakai tanggal dokumen sebagai fallback; sebelum pembayaran dikonfirmasi, kolom tanggal pelunasan tetap kosong.
- Source of Truth diperbarui menjadi PRD 1.41, UI Guideline 1.18, dan Implementation Plan 1.28.
