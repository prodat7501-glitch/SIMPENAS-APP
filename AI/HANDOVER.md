# HANDOVER.md

# SIMPENAS — AI & Developer Handover Procedure

Version: 1.0

---

# PURPOSE

Dokumen ini mengatur proses serah terima pekerjaan antara:

- Antigravity
- OpenAI Codex
- ChatGPT
- Developer
- QA

Tujuannya agar setiap perpindahan pekerjaan tetap konsisten dengan Source of Truth (SOT).

---

# HANDOVER PRINCIPLES

Sebelum serah terima:

- Semua perubahan telah disimpan.
- Build berhasil.
- Tidak ada error TypeScript.
- Tidak ada error ESLint.
- Review Checklist telah dilakukan.

---

# HANDOVER FLOW

```text
DISCOVER
    ↓
IMPLEMENT
    ↓
SELF REVIEW
    ↓
REVIEW CHECKLIST
    ↓
COMMIT
    ↓
HANDOVER
    ↓
NEXT AGENT / DEVELOPER
```

---

# HANDOVER PACKAGE

Setiap handover harus menyertakan informasi berikut.

## Phase

Contoh:

Phase 8 — SPPD

---

## Status

- In Progress
- Ready for Review
- Completed
- Blocked

---

## Modul

Daftar modul yang dikerjakan.

---

## Business Process

Daftar BP yang terkait.

---

## Functional Requirement

Daftar FR yang telah diimplementasikan.

---

## Files Created

Daftar file baru.

---

## Files Modified

Daftar file yang diubah.

---

## Components

Reusable Component yang digunakan atau dibuat.

---

## Hooks

Daftar Hook.

---

## Services

Daftar Service.

---

## Stores

Daftar Store.

---

## Schemas

Daftar Schema.

---

## Routes

Daftar Route yang ditambahkan atau diubah.

---

## Outstanding Issues

Tuliskan semua hal yang belum selesai.

Contoh:

- Backend API belum tersedia.
- Menggunakan Mock Data.
- Menunggu keputusan Product Owner.

---

## Risks

Tuliskan risiko yang diketahui.

---

## Notes

Catatan penting untuk penerus pekerjaan.

---

# NEXT AGENT RESPONSIBILITY

AI atau Developer berikutnya WAJIB:

1. Membaca AGENTS.md.
2. Membaca file AI yang sesuai (ANTIGRAVITY.md atau CODEX.md).
3. Membaca PRD.
4. Membaca UI Guideline.
5. Membaca Implementation Plan.
6. Membaca Handover.
7. Menganalisis kode yang sudah ada.
8. Melanjutkan hanya pada ruang lingkup yang diserahkan.

Tidak boleh mengulang implementasi yang sudah selesai tanpa alasan yang jelas.

---

# BLOCKER REPORT

Jika pekerjaan terhenti, gunakan format berikut.

## Blocker

Deskripsi masalah.

## Dampak

Pengaruh terhadap implementasi.

## Penyebab

Alasan teknis atau bisnis.

## Solusi yang Diusulkan

Langkah penyelesaian.

## Keputusan yang Dibutuhkan

Hal yang memerlukan persetujuan.

---

# COMPLETION REPORT

Setelah phase selesai, gunakan format berikut.

## Phase

## Status

## Modul

## BP

## FR

## File Dibuat

## File Diubah

## Reusable Component

## Hook

## Service

## Store

## Schema

## Route

## Testing

## Outstanding Issues

## Catatan

---

# HANDOVER RULES

- Jangan menyerahkan pekerjaan dengan build yang gagal.
- Jangan menyerahkan pekerjaan yang melanggar SOT.
- Jangan menyerahkan pekerjaan tanpa Completion Report.
- Jangan mengubah scope phase berikutnya.
- Semua perubahan harus dapat ditelusuri ke PRD, UI Guideline, dan Implementation Plan.

---

# FINAL RULE

Setiap AI maupun Developer yang menerima handover bertanggung jawab untuk memverifikasi kembali hasil pekerjaan sebelum melanjutkan implementasi.

Apabila ditemukan ketidaksesuaian dengan Source of Truth, implementasi harus dihentikan hingga masalah diselesaikan atau dokumen SOT diperbarui.
