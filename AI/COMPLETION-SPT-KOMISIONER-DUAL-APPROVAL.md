# Completion Report — Dual Approval SPT Komisioner

## Phase

Perbaikan kewenangan Approval SPT Komisioner dan tugas Dashboard.

## Status

Completed — Ready for Review.

## Modul

- Approval
- SPT
- Dashboard Tugas Perjalanan Saya
- Notifikasi

## BP

- BP-02 — Pembuatan dan Approval Surat Perintah Tugas
- BP-09 — Approval Dokumen

## FR

- FR-066 — Penandatangan dan approver SPT sesuai kelompok personel serta scope Kasubbag sumber.
- FR-100 — Tugas dan notifikasi personal berdasarkan identitas pegawai.

## File Dibuat

- `AI/COMPLETION-SPT-KOMISIONER-DUAL-APPROVAL.md`

## File Diubah

- `src/modules/approval/approval-access.ts`
- `src/modules/approval/approval.service.ts`
- `DOCS/PRD.md`
- `DOCS/IMPLEMENTATION-PLAN.md`

## Reusable Component

- `TravelTaskPanel` tetap digunakan tanpa perubahan UI.
- `ApprovalTable` dan `ApprovalDetail` tetap digunakan tanpa perubahan UI.

## Hook

- `useApproval()` tetap memuat inbox dengan `refetchOnMount: "always"` dan menggunakan identitas akun sebagai query key.

## Service

- `canUserApproveSpt()` menjadi resolver tunggal untuk inbox `/approval`, validasi keputusan, serta tugas Dashboard.
- SPT Komisioner dapat diproses Ketua KPU atau Kasubbag pembuat/penandatangan Nota Dinas sumber.
- Identitas Ketua mengutamakan kecocokan Master Pejabat Penandatangan dan memakai kategori/jabatan Master Pegawai sebagai fallback.
- `travel-task.service.ts` menggunakan resolver yang sama sehingga tugas dan notifikasi tidak memiliki aturan terpisah.

## Store

- Tidak ada perubahan store.

## Schema

- Tidak ada perubahan schema.

## Route

- `/approval`
- `/dashboard`

## Testing

- `npx tsc --noEmit`: berhasil, 0 error.
- ESLint modul Approval dan Travel Task: berhasil, 0 error/warning.
- `npm run lint`: berhasil, 0 error; terdapat 10 warning existing pada Demo Components dan `SptForm` yang tidak terkait perubahan.
- `npm run build`: berhasil pada Next.js 16.2.10, Webpack, dan PWA production.
- Source review: Kasubbag lain yang bukan pembuat/penandatangan Nota Dinas tetap ditolak.
- Source review: penandatangan dokumen SPT Komisioner tetap Ketua KPU.

## Outstanding Issues

- Backend belum tersedia; data akun, pegawai, approval, tugas, dan notifikasi masih menggunakan persistence browser/mock.
- UAT perlu dilakukan menggunakan akun Ketua KPU dan akun Kasubbag sumber pada data lokal pengguna.

## Catatan

- Akun Ketua dan Kasubbag harus memiliki role aplikasi `Supervisor`.
- Akun harus terhubung ke Master Pegawai melalui `pegawaiId`.
- Ketua KPU harus berkategori atau berjabatan Ketua KPU pada Master Pegawai.
- Kasubbag sumber ditentukan dari `createdByPegawaiId` atau snapshot penandatangan Nota Dinas.
