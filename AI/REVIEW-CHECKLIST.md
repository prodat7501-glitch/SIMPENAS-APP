# REVIEW-CHECKLIST.md

# SIMPENAS — Engineering Review Checklist

Version: 1.0

---

# PURPOSE

Dokumen ini menjadi **Quality Gate** sebelum setiap perubahan diterima (accept), di-merge, atau dilanjutkan ke phase berikutnya.

Seluruh implementasi WAJIB direview terhadap:

- PRD
- UI Guideline
- Implementation Plan
- AGENTS.md
- ANTIGRAVITY.md / CODEX.md (sesuai AI yang digunakan)

---

# REVIEW PROCESS

Urutan review:

1. Business Review
2. UI Review
3. Engineering Review
4. Code Quality Review
5. Performance Review
6. Security Review
7. Final Acceptance

Seluruh tahap harus lulus sebelum perubahan diterima.

---

# 1. BUSINESS REVIEW

## Requirement

- [ ] Requirement berasal dari PRD.
- [ ] Functional Requirement (FR) sesuai.
- [ ] Business Process (BP) sesuai.
- [ ] Business Rules (BR) sesuai.
- [ ] Validation Rules (VR) sesuai.
- [ ] Acceptance Criteria (AC) terpenuhi.

---

## Workflow

- [ ] Workflow tidak berubah.
- [ ] Approval Flow sesuai.
- [ ] Role sesuai.
- [ ] Permission sesuai.
- [ ] Status Dokumen sesuai.

---

# 2. UI REVIEW

## Design System

- [ ] Menggunakan Design Token.
- [ ] Tidak hardcode warna.
- [ ] Tidak hardcode spacing.
- [ ] Tidak hardcode radius.
- [ ] Tidak hardcode shadow.

---

## Layout

- [ ] Responsive Desktop.
- [ ] Responsive Tablet.
- [ ] Responsive Mobile.
- [ ] Sidebar konsisten.
- [ ] Header konsisten.
- [ ] Breadcrumb benar.

---

## Component

- [ ] Reusable.
- [ ] Konsisten dengan UI Guideline.
- [ ] State lengkap (loading, empty, error, success).
- [ ] Accessibility diperhatikan.

---

# 3. ENGINEERING REVIEW

## Architecture

- [ ] Mengikuti Feature-Based Architecture.
- [ ] Tidak membuat struktur baru tanpa alasan.
- [ ] Folder sesuai Engineering SOT.

---

## Reuse

- [ ] Reuse Component.
- [ ] Reuse Hook.
- [ ] Reuse Service.
- [ ] Reuse Store.
- [ ] Reuse Schema.
- [ ] Reuse Utility.

---

## Layer

- [ ] Component hanya UI.
- [ ] Business Logic di Hook.
- [ ] API di Service.
- [ ] State di Store.
- [ ] Validasi di Schema.

---

# 4. CODE QUALITY REVIEW

- [ ] TypeScript Strict.
- [ ] Tidak menggunakan any.
- [ ] Tidak ada duplicate code.
- [ ] Tidak ada magic number.
- [ ] Tidak ada magic string.
- [ ] Tidak ada console.log produksi.
- [ ] Nama variabel deskriptif.
- [ ] Fungsi memiliki satu tanggung jawab.
- [ ] Import tertata.

---

# 5. PERFORMANCE REVIEW

- [ ] Dynamic Import jika diperlukan.
- [ ] Lazy Loading jika diperlukan.
- [ ] TanStack Query digunakan untuk server state.
- [ ] Zustand digunakan untuk client state.
- [ ] Tidak ada render berulang yang tidak perlu.
- [ ] Tidak ada fetch berulang yang tidak diperlukan.

---

# 6. SECURITY REVIEW

- [ ] Route dilindungi.
- [ ] RBAC sesuai PRD.
- [ ] Permission sesuai Role.
- [ ] Tidak ada data sensitif di client.
- [ ] Session ditangani dengan benar.

---

# 7. TESTING REVIEW

- [ ] Build berhasil.
- [ ] Type Check berhasil.
- [ ] Lint berhasil.
- [ ] Manual Testing dilakukan.
- [ ] UAT sesuai Acceptance Criteria.

---

# 8. DOCUMENT REVIEW

- [ ] README module diperbarui (jika diperlukan).
- [ ] Perubahan sesuai SOT.
- [ ] Tidak ada requirement baru tanpa persetujuan.

---

# FINAL ACCEPTANCE

## Status

- [ ] Accepted
- [ ] Revision Required
- [ ] Rejected

---

## Reviewer

Nama:

Tanggal:

Catatan:

---

# QUALITY GATE

Implementasi hanya dapat dilanjutkan ke phase berikutnya apabila seluruh checklist telah dinyatakan **Accepted**.
