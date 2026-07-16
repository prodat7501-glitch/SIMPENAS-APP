# Completion Report — Bug Sprint 3 / QA-005

## Phase

Bug Sprint 3 — Login Validation

## Status

Completed — Ready for Review

## Modul

- Mock Authentication

## BP

- UF-01 — Login

## FR

- FR-001 — Login menggunakan username dan password.
- VR Authentication — Password wajib sesuai.
- AC-01 — Login gagal jika kredensial tidak sesuai.

## File Dibuat

- `AI/COMPLETION-BUG-SPRINT-3-QA-005.md`

## File Diubah

- `src/services/auth.service.ts`
- `src/stores/auth.store.ts`
- `src/hooks/useAuth.ts`
- `AI/QA-REPORT-PHASE-14.md`
- `AI/FINAL-PRODUCTION-READINESS.md`

## Reusable Component

- Login UI tetap digunakan tanpa perubahan.

## Hook

- `useAuth` meneruskan password dari `LoginInput`.

## Service

- `AuthService.login` memverifikasi username, password hash, dan role.

## Store

- Auth store meneruskan password tanpa menyimpannya ke persisted session.

## Schema

- Reuse `loginSchema`; tidak ada perubahan validation contract.

## Route

- `/login` tidak berubah.

## Testing

- Username benar + password benar: PASS.
- Username benar + password salah: PASS, ditolak.
- Username salah: PASS, ditolak.
- Role tidak sesuai: PASS, ditolak.
- ESLint: PASS.
- TypeScript: PASS.
- Production build: PASS, 30 halaman.
- `git diff --check`: PASS.

## Outstanding Issues

- Ini tetap Mock Authentication; backend authentication belum tersedia.
- Hash SHA-256 di client hanya mencegah penyimpanan password mock sebagai plaintext dan bukan pengganti password hashing server-side.
- Defect lain tidak dikerjakan.

## Risiko

- Kredensial mock tersedia dalam bundle frontend dan tidak boleh dipakai untuk production authentication.

## Catatan

- `MOCK_USERS` tidak diubah.
- UI login tidak diubah.
- Session shape dan backend contract tidak diubah.
- Password tidak disimpan pada Zustand persist maupun session object.
- Pekerjaan berhenti setelah QA-005.
