# Regression QA Report — Bug Sprints 1-10

## Phase

Regression QA — QA-001 sampai QA-011

## Status

Completed

## Modul

- Template Dokumen
- Approval
- SPT
- SPPD
- PWA
- Authentication
- Pengaturan Penomoran
- Keuangan
- Manajemen Dokumen
- Log Aktivitas
- Notifikasi

## BP

- BP-01 — Nota Dinas
- BP-02 — SPT
- BP-03 — SPPD
- BP-06 — Dokumen Keuangan
- BP-07 — Manajemen Dokumen
- BP-09 — Workflow Approval
- BP-10 — Workflow Notifikasi
- BR-09 — Audit Trail

## FR

- FR-001 s.d. FR-006 — Authentication
- FR-025 s.d. FR-032 — SPT
- FR-033 s.d. FR-039 — SPPD
- FR-046 s.d. FR-050 — Dokumen Keuangan
- FR-054 — Notifikasi
- FR-055 s.d. FR-057 — Arsip dan Export
- FR-058 — Log Aktivitas
- NFR-08 — PWA
- NFR-09 — Document Generation
- NFR-10 — Audit & Logging

## File Dibuat

- `AI/REGRESSION-QA-REPORT-BUG-SPRINTS-1-10.md`

## File Diubah

- `AI/QA-REPORT-PHASE-14.md`

## Reusable Component

- `DocumentTemplate`
- `TemplateProvider`
- `PrintPreview`
- `EmptyState`
- `LoadingOverlay`
- `Badge`
- `Table`

## Hook

- `useApproval`
- `useSpt`
- `useSppd`
- `useLaporan`
- `useKeuangan`
- `useNotificationStore`
- `useActivityStore`
- `useDocumentTemplate`

## Service

- `AuthService`
- `approvalService`
- `penomoranService`
- `keuanganService`
- `downloadGeneratedPdf`
- `exportExcel`

## Store

- `useAuthStore`
- `useActivityStore`
- `useNotificationStore`
- feature stores terkait master/transaksi/keuangan

## Schema

- `loginSchema`
- `approvalDecisionSchema`
- `sptSchema`
- `sppdSchema`
- `dokumenKeuanganSchema`
- `spjSchema`
- `penomoranSchema`

## Route

- `/login`
- `/approval`
- `/pengaturan`
- `/pengaturan/template`
- `/nota-dinas`
- `/spt`
- `/sppd`
- `/laporan`
- `/spj`
- `/spby`
- `/daftar-nominatif`
- `/tanda-terima`
- `/kuitansi`
- `/dokumen`
- `/log-aktivitas`
- `/notifikasi`

## Testing

- `npx.cmd tsc --noEmit --incremental false` — PASS
- `npm.cmd run lint` — PASS, 0 error, 21 warning non-blocking
- `npm.cmd run build` — PASS
- PWA manifest/icon validation — PASS
- Static source verification QA-001 sampai QA-011 — PASS
- Route protection static review `src/proxy.ts` — PASS
- In-app browser visual QA — NOT RUN
- Manual UAT perangkat nyata — NOT RUN

## Defect Status

| ID     | Defect                        | Regression Status |
| ------ | ----------------------------- | ----------------- |
| QA-001 | Template direct URL guard     | Fixed             |
| QA-002 | Approval SPT                  | Fixed             |
| QA-003 | Relasi Nota Dinas ke SPT      | Fixed             |
| QA-004 | PWA Asset                     | Fixed             |
| QA-005 | Login password validation     | Fixed             |
| QA-006 | Pengaturan Penomoran          | Fixed             |
| QA-007 | Template Provider             | Fixed             |
| QA-008 | Financial Document Chain      | Fixed             |
| QA-009 | Document Archive PDF download | Fixed             |
| QA-010 | Audit Log coverage            | Fixed             |
| QA-011 | Notification persistence      | Fixed             |

## Outstanding Issues

- Backend API belum tersedia; sebagian service masih mock/localStorage.
- Belum ada automated unit/integration/E2E test runner.
- QA visual lintas browser dan UAT perangkat nyata belum dilakukan.
- ESLint masih memiliki warning non-blocking pada demo/legacy component.

## Catatan

Regression QA tidak menambahkan fitur baru. Perubahan hanya memperbarui dokumen QA berdasarkan hasil verifikasi ulang terhadap PRD, UI Guideline, Implementation Plan, QA Report, REVIEW-CHECKLIST, dan HANDOVER.
