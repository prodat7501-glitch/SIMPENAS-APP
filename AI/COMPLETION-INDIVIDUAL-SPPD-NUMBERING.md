# Completion Report — Satu Personel Satu Nomor SPPD

## Status

Completed

## Scope

- Menetapkan satu SPPD individual untuk satu personel dengan nomor SPPD unik.
- Memisahkan running number SPPD dari nomor urut SPT.
- Mempertahankan sinkronisasi data perjalanan dalam seri SPT tanpa menyinkronkan nomor dan personel.
- Tidak menomori ulang dokumen existing secara otomatis.

## Root Cause

- Form membentuk nomor SPPD dari sequence nomor SPT.
- `getSharedSppdFields()` memasukkan field `nomor`, sehingga membuat atau mengubah satu SPPD menimpa nomor seluruh SPPD dengan `sptId` yang sama.
- Nomor pada form hanya diformat tetapi tidak diterbitkan secara aman melalui Numbering Service.

## Files Modified

- `src/modules/sppd/components/SppdForm.tsx`
- `src/modules/sppd/sppd.service.ts`
- `src/modules/sppd/sppd.types.ts`
- `src/modules/sppd/useSppd.ts`
- `src/modules/pengaturan/apply-existing-numbering.service.ts`
- `DOCS/PRD.md`
- `DOCS/UI-GUIDELINES.md`
- `DOCS/IMPLEMENTATION-PLAN.md`

## Business Rules Implemented

- Setiap personel SPT hanya dapat memiliki satu SPPD pada SPT tersebut.
- Setiap SPPD memperoleh nomor unik dari konfigurasi SPPD.
- Form hanya menampilkan preview; running number digunakan ketika penyimpanan berhasil.
- Nomor berikutnya memperhitungkan nomor SPPD existing dan Booking aktif pada tahun yang sama.
- Membatalkan form tidak mengonsumsi nomor.
- Update mempertahankan nomor existing.
- Penghapusan oleh Administrator melepaskan nomor melalui Numbering Service.
- Maksud, transportasi, lokasi, tanggal, DIPA, penandatangan, dan Halaman 2 tetap disinkronkan pada seri SPT yang sama; nomor dan personel tetap individual.

## Compatibility

- SPPD existing tidak dinomori ulang saat dibaca atau diedit.
- Aksi Administrator untuk menerapkan format penomoran existing kini memberikan sequence unik per SPPD/tahun dan tidak lagi mengambil sequence dari SPT.
- Relasi dokumen lain tetap menggunakan `sppdId` dan `sptId`; tidak ada perubahan kontrak relasi.

## Verification

- Prettier: Passed.
- TypeScript (`npx tsc --noEmit`): Passed.
- Targeted ESLint: Passed.
- Full ESLint: Passed dengan 0 error dan 10 warning lama di luar scope.
- `git diff --check`: Passed.
- Production build (`npm run build`): Passed, termasuk route `/sppd` dan konfigurasi PWA.

## Manual Acceptance Scenario

1. Pilih satu SPT yang memiliki lebih dari satu personel.
2. Buat SPPD personel pertama dan simpan; nomor diterbitkan dari Numbering Service.
3. Buat SPPD personel berikutnya dari SPT yang sama; nomor harus berbeda dan berurutan.
4. Ubah field perjalanan salah satu SPPD; data bersama tersinkron tetapi nomor masing-masing tetap.
5. Batalkan form baru; nomor preview tidak tercatat sebagai Terpakai.
