# PROMPTS.md

# SIMPENAS — AI Prompt Operations Manual

Version : 1.0

---

# PURPOSE

Dokumen ini berisi prompt standar untuk seluruh AI Coding Agent (Antigravity, Codex, ChatGPT, Claude Code, Cursor Agent, dan AI lain) agar proses pengembangan Frontend SIMPENAS selalu mengikuti Source of Truth (SOT).

Seluruh AI wajib membaca:

- AGENTS.md
- ANTIGRAVITY.md (jika menggunakan Antigravity)
- CODEX.md (jika menggunakan Codex)
- DOCS/01-PRD.md
- DOCS/02-UI-Guideline.md
- DOCS/03-Implementation-Plan.md

---

# MASTER EXECUTION PROMPT

Gunakan prompt ini pada awal setiap sesi.

```text
Baca dan patuhi seluruh aturan pada AGENTS.md.

Jika Anda adalah Antigravity, baca juga ANTIGRAVITY.md.
Jika Anda adalah Codex, baca juga CODEX.md.

Kemudian baca seluruh dokumen pada folder DOCS:

- 01-PRD.md
- 02-UI-Guideline.md
- 03-Implementation-Plan.md

Ikuti Execution Protocol:

DISCOVER
↓
ANALYZE
↓
PLAN
↓
IMPLEMENT
↓
VERIFY
↓
REPORT

Jangan membuat asumsi.
Jangan menambah fitur.
Jangan mengubah Business Rule.
Jangan mengubah UI Guideline.
Jangan mengubah arsitektur.
Selalu gunakan reusable component jika tersedia.
Tampilkan PLAN sebelum IMPLEMENT.
```

---

# PHASE 0 — PROJECT ANALYSIS

```text
Lakukan DISCOVER dan ANALYZE terhadap repository.

Tugas:

- Analisis struktur folder.
- Analisis reusable component.
- Analisis hook.
- Analisis service.
- Analisis store.
- Analisis schema.
- Analisis types.
- Analisis route.
- Analisis dependency.

Jangan menulis kode.

Tampilkan:

1. Ringkasan Project.
2. Struktur Module.
3. Risiko.
4. Kesiapan Project.
5. Checklist sebelum implementasi.

Tunggu persetujuan.
```

---

# PHASE 1 — PROJECT FOUNDATION

```text
Implementasikan Foundation sesuai Implementation Plan.

Kerjakan hanya:

- Next.js 15
- TypeScript Strict
- Tailwind CSS v4
- shadcn/ui
- ESLint
- Prettier
- Husky
- lint-staged
- next-themes
- next-pwa
- Folder Structure
- Providers
- Layout

Jangan mengerjakan halaman bisnis.

Setelah selesai:

VERIFY

REPORT

Tunggu persetujuan.
```

---

# PHASE 2 — AUTHENTICATION

```text
Implementasikan Authentication.

Scope:

- Login
- Logout
- Session
- Middleware
- Protected Route
- RBAC

Gunakan Mock API.

Jangan mengimplementasikan Dashboard.

Setelah selesai tampilkan REPORT.
```

---

# PHASE 3 — DASHBOARD

```text
Implementasikan Dashboard.

Role:

- Administrator
- Supervisor
- Pegawai
- Sub Bagian Keuangan

Gunakan Mock Data.

Kerjakan:

- Sidebar
- Header
- Statistic
- Notification
- Activity
- Quick Action

Tunggu persetujuan.
```

---

# PHASE 4 — SHARED COMPONENTS

```text
Bangun seluruh reusable component berdasarkan UI Guideline.

Minimal:

Button

Input

Select

Date Picker

Table

Dialog

Drawer

Card

Badge

Toast

Alert

Tabs

Accordion

Upload

Signature

Skeleton

Loading

Empty State

Print Preview

Jangan mengerjakan Modul Bisnis.

REPORT.

Tunggu persetujuan.
```

---

# PHASE 5 — MASTER DATA

```text
Implementasikan Master Data.

Urutan:

Pegawai

↓

Jabatan

↓

Unit Kerja

↓

Pangkat

↓

DIPA

↓

Penandatangan

↓

SBM

Setiap module wajib memiliki:

Page

Component

Hook

Store

Service

Schema

Validation

REPORT.

Tunggu persetujuan.
```

---

# PHASE 6 — NOTA DINAS

```text
Implementasikan Nota Dinas.

Scope:

CRUD

Ambil Nomor

Lampiran

Preview

Print

Approval Status

Jangan mengimplementasikan SPT.

REPORT.
```

---

# PHASE 7 — SPT

```text
Implementasikan SPT.

Scope:

Ambil Nomor

Menimbang Dinamis

Dasar Dinamis

Kegiatan Dinamis

Approval

Preview

Print

REPORT.
```

---

# PHASE 8 — SPPD

```text
Implementasikan SPPD.

Scope:

Ambil Nomor

Transportasi

Tujuan

Tanggal

Durasi Otomatis

Akun DIPA

Approval

Preview

Print

REPORT.
```

---

# PHASE 9 — LAPORAN

```text
Implementasikan Laporan Perjalanan.

Scope:

Editor

Upload Multi Foto

Signature

Preview

Approval

REPORT.
```

---

# PHASE 10 — KEUANGAN

```text
Implementasikan:

Validasi SPJ

SPBY

Daftar Nominatif

Tanda Terima

Kuitansi

Gunakan Template Dokumen.

REPORT.
```

---

# PHASE 11 — REKAPITULASI

```text
Implementasikan:

Dashboard Rekap

Chart

Table

Export PDF

Export Excel

REPORT.
```

---

# PHASE 12 — PENGATURAN

```text
Implementasikan:

Template Dokumen

Penandatangan

Profil

Notifikasi

Log Aktivitas

Manajemen Dokumen

REPORT.
```

---

# PHASE 13 — POLISHING

```text
Lakukan:

Responsive

Dark Mode

Accessibility

Loading

Skeleton

Performance

Lazy Loading

REPORT.
```

---

# PHASE 14 — QA

```text
Lakukan QA.

Verifikasi:

PRD

UI Guideline

Implementation Plan

Periksa:

BP

BR

FR

VR

AC

Tampilkan:

Bug

Technical Debt

Improvement

REPORT.
```

---

# PHASE 15 — REFACTOR

```text
Lakukan Refactor.

Tidak boleh mengubah:

Business Rule

Workflow

UI

Permission

Route

Target:

Clean Code

Performance

Maintainability

REPORT.
```

---

# PHASE 16 — PRODUCTION READY

```text
Lakukan Final Verification.

Pastikan:

Build Success

TypeScript Success

ESLint Success

No Duplicate Component

No Duplicate Hook

No Duplicate Service

No Duplicate Store

No Duplicate Schema

Responsive

PWA

REPORT FINAL.
```

---

# BUG FIX PROMPT

```text
Analisis bug terlebih dahulu.

Jangan langsung memperbaiki.

Tampilkan:

Root Cause

File Terdampak

Rencana Perbaikan

Tunggu persetujuan.

Setelah disetujui baru lakukan implementasi.
```

---

# REFACTOR PROMPT

```text
Lakukan ANALYZE.

Cari:

Duplicate Component

Duplicate Hook

Duplicate Service

Duplicate Utility

Duplicate Store

Jangan mengubah Business Logic.

Tampilkan PLAN sebelum IMPLEMENT.
```

---

# CODE REVIEW PROMPT

```text
Review seluruh source code.

Periksa:

Architecture

Clean Code

Performance

Maintainability

Security

TypeScript

Reusable Component

Design Token

RBAC

Berikan rekomendasi tanpa mengubah kode.
```

---

# FINAL REPORT FORMAT

Setiap tugas harus diakhiri dengan format berikut:

```text
## SUMMARY

Module:

Business Process:

Functional Requirement:

Files Created:

Files Modified:

Reusable Component:

Hook:

Service:

Store:

Schema:

Validation:

Route:

Permission:

Testing:

Notes:
```

---

# GOLDEN RULE

AI tidak boleh menulis satu baris kode pun sebelum:

1. Membaca AGENTS.md.
2. Membaca file AI yang sesuai (ANTIGRAVITY.md atau CODEX.md).
3. Membaca seluruh dokumen pada folder DOCS.
4. Menyelesaikan DISCOVER.
5. Menyelesaikan ANALYZE.
6. Menampilkan PLAN.
7. Mendapat persetujuan apabila diminta.

Seluruh implementasi harus konsisten dengan:

- Business Source of Truth (PRD)
- Design Source of Truth (UI Guideline)
- Engineering Source of Truth (Implementation Plan)

Apabila terdapat konflik atau requirement yang tidak ditemukan, AI wajib menghentikan implementasi dan meminta klarifikasi sebelum melanjutkan.
