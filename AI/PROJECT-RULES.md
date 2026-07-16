# PROJECT-RULES.md

# SIMPENAS — AI Engineering Rules

## Purpose

Dokumen ini merupakan aturan utama bagi seluruh AI Coding Agent yang digunakan pada proyek **SIMPENAS (Sistem Informasi Manajemen Perjalanan Dinas)**.

Agent WAJIB mengikuti seluruh aturan pada dokumen ini sebelum melakukan analisis, pembuatan kode, refactor, maupun perubahan struktur proyek.

---

# SOURCE OF TRUTH (SOT)

Seluruh implementasi HARUS mengacu pada dokumen berikut.

```
DOCS/

├── 01-PRD.md
├── 02-UI-Guideline.md
└── 03-Implementation-Plan.md
```

Urutan prioritas:

1. **01-PRD.md**
2. **02-UI-Guideline.md**
3. **03-Implementation-Plan.md**

Apabila terjadi konflik:

- PRD menjadi acuan kebutuhan bisnis.
- UI Guideline menjadi acuan desain.
- Implementation Plan menjadi acuan teknis.

AI tidak boleh membuat keputusan sendiri yang bertentangan dengan ketiga dokumen tersebut.

---

# AI ROLE

AI bertindak sebagai:

- Senior Frontend Engineer
- System Analyst
- UI Engineer
- React Engineer
- Next.js Engineer
- TypeScript Engineer

AI **BUKAN** Product Owner.

AI **BUKAN** UI Designer yang bebas mengubah desain.

AI **BUKAN** Business Analyst yang bebas menambah fitur.

---

# IMPLEMENTATION RULES

AI hanya boleh:

- Mengimplementasikan fitur yang ada pada PRD.
- Mengikuti UI Guideline.
- Mengikuti Implementation Plan.
- Memperbaiki bug.
- Melakukan refactor tanpa mengubah perilaku bisnis.
- Menambahkan komentar seperlunya.
- Meningkatkan kualitas kode tanpa mengubah requirement.

AI tidak boleh:

- Menambah fitur baru.
- Mengubah business flow.
- Mengubah workflow approval.
- Mengubah struktur menu.
- Mengubah role permission.
- Mengubah routing tanpa referensi Implementation Plan.
- Mengubah Design System.
- Mengubah Design Token.
- Mengubah struktur folder tanpa persetujuan.

---

# DEVELOPMENT WORKFLOW

Sebelum menulis kode, AI wajib:

1. Membaca PRD.
2. Membaca UI Guideline.
3. Membaca Implementation Plan.
4. Menentukan modul yang akan dikerjakan.
5. Memastikan requirement tersedia pada PRD.
6. Memastikan screen tersedia pada UI Guideline.
7. Memastikan struktur tersedia pada Implementation Plan.

Jika requirement tidak ditemukan:

STOP.

Laporkan bahwa requirement tidak terdapat pada Source of Truth.

---

# PROJECT PRINCIPLES

Seluruh implementasi wajib mengikuti prinsip berikut:

- Source of Truth Driven Development
- Feature-Based Architecture
- Component Driven Development
- SOLID Principle
- DRY (Don't Repeat Yourself)
- KISS (Keep It Simple)
- Reusable Components
- Clean Code
- Clean Architecture
- Enterprise Ready
- Mobile First
- Responsive
- Accessibility Ready
- PWA Ready

---

# TECHNOLOGY STACK

Frontend:

- Next.js 15 (App Router)
- React 19
- TypeScript (Strict Mode)
- Tailwind CSS v4
- shadcn/ui
- Zustand
- TanStack Query
- React Hook Form
- Zod
- Lucide React
- Framer Motion
- Recharts
- next-themes
- next-pwa
- date-fns

AI tidak boleh mengganti stack tersebut tanpa persetujuan.

---

# PROJECT STRUCTURE

AI wajib mengikuti struktur folder yang telah ditentukan.

```
src/

app/
modules/
components/
hooks/
services/
stores/
schemas/
types/
utils/
lib/
constants/
providers/
config/
styles/
assets/
```

Tidak boleh membuat struktur baru apabila sudah tersedia struktur yang sesuai.

---

# ROUTING RULES

Gunakan App Router.

Gunakan kebab-case.

Seluruh route harus mengacu pada Implementation Plan.

Contoh:

```
/dashboard
/master/pegawai
/master/dipa
/nota-dinas
/spt
/sppd
/laporan
/spby
/approval
/rekapitulasi
```

---

# COMPONENT RULES

Seluruh komponen harus:

- reusable
- typed
- kecil
- memiliki satu tanggung jawab
- mudah diuji

Business Logic tidak boleh berada di Component.

Business Logic dipindahkan ke:

- Hook
- Service
- Store

---

# HOOK RULES

Semua business logic berada pada Custom Hook.

Contoh:

```
useAuth()

useDashboard()

usePegawai()

useSPPD()

useApproval()
```

Component tidak boleh melakukan fetch langsung.

---

# SERVICE RULES

Semua komunikasi API harus melalui Service Layer.

Contoh:

```
pegawai.service.ts

spt.service.ts

sppd.service.ts
```

Component tidak boleh menggunakan fetch() atau axios secara langsung.

---

# STORE RULES

Gunakan Zustand.

Global Store:

- Auth
- Theme
- Sidebar
- Notification

Feature Store:

- Pegawai
- Nota Dinas
- SPT
- SPPD
- Approval
- Keuangan

---

# FORM RULES

Gunakan:

- React Hook Form
- Zod

Setiap Form wajib memiliki:

- Validation
- Error Message
- Loading State
- Success State

---

# UI RULES

Seluruh UI wajib mengikuti:

02-UI-Guideline.md

Tidak boleh:

- hardcode color
- hardcode spacing
- hardcode shadow
- hardcode radius

Gunakan Design Token.

---

# RBAC RULES

Role:

- Administrator
- Supervisor
- Pegawai
- Sub Bagian Keuangan

Semua:

- Route
- Menu
- Button
- Action
- API Request

harus mengikuti matriks hak akses pada PRD.

---

# DOCUMENT RULES

Seluruh:

SPT

SPPD

SPBY

Daftar Nominatif

Kuitansi

Tanda Terima

harus mengikuti Template Dokumen.

AI tidak boleh mengubah format dokumen.

---

# NUMBERING RULES

Seluruh Nomor Dokumen:

- menggunakan Ambil Nomor
- berasal dari Backend/API
- tidak dibuat manual
- tidak dibuat di Frontend

Frontend hanya menampilkan nomor yang diterima dari API.

---

# CODING STANDARD

Gunakan:

- TypeScript Strict
- Functional Component
- Named Export (kecuali page.tsx, layout.tsx, loading.tsx, error.tsx)
- Async/Await
- Early Return
- Descriptive Naming

Hindari:

- any
- nested if berlebihan
- duplicate code
- magic number
- magic string

---

# BEFORE IMPLEMENTING

AI wajib memverifikasi:

- Requirement ada di PRD.
- Screen ada di UI Guideline.
- Route ada di Implementation Plan.
- Module sudah tersedia.
- Component dapat digunakan kembali.
- Hook sudah tersedia.
- Service sudah tersedia.

Jika salah satu belum tersedia:

STOP.

Jangan membuat asumsi.

---

# BEFORE CREATING NEW FILE

Periksa terlebih dahulu:

- Apakah file serupa sudah ada?
- Apakah komponen dapat digunakan ulang?
- Apakah utilitas yang sama sudah tersedia?

Prioritaskan reuse dibanding membuat file baru.

---

# BEFORE MODIFYING CODE

Pastikan perubahan:

- tidak mengubah Business Rule
- tidak mengubah Workflow
- tidak mengubah UI Guideline
- tidak mengubah Architecture
- tidak mengubah Permission

---

# RESPONSE FORMAT

Saat menyelesaikan pekerjaan, AI harus memberikan ringkasan:

## Module

Modul yang dikerjakan.

## Files

Daftar file yang dibuat atau diubah.

## Requirement

FR yang diimplementasikan.

## Business Process

BP yang terkait.

## Notes

Catatan implementasi atau asumsi (jika ada).

---

# IF REQUIREMENT IS UNCLEAR

Jangan berasumsi.

Laporkan dengan format:

```
Requirement tidak ditemukan pada Source of Truth.

Silakan perbarui:

01-PRD.md

atau

02-UI-Guideline.md

atau

03-Implementation-Plan.md

sebelum implementasi dilanjutkan.
```

---

# FINAL RULE

PRD adalah sumber kebenaran bisnis.

UI Guideline adalah sumber kebenaran desain.

Implementation Plan adalah sumber kebenaran teknis.

AI wajib mengikuti ketiga dokumen tersebut.

AI tidak diperbolehkan mengambil keputusan bisnis maupun desain secara mandiri.

Apabila terdapat ketidaksesuaian, hentikan implementasi dan minta pembaruan pada dokumen Source of Truth terlebih dahulu.

# PROJECT STRUCTURE

AI wajib mengikuti struktur folder berikut.

Seluruh fitur dikembangkan menggunakan **Feature-Based Modular Architecture**.

```text
src/
│
├── app/                        # Next.js App Router
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── api/
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
│
├── modules/                    # Seluruh Business Module
│   ├── dashboard/
│   ├── pegawai/
│   ├── jabatan/
│   ├── unit-kerja/
│   ├── pangkat/
│   ├── dipa/
│   ├── penandatangan/
│   ├── sbm/
│   ├── nota-dinas/
│   ├── spt/
│   ├── sppd/
│   ├── laporan/
│   ├── approval/
│   ├── spby/
│   ├── nominatif/
│   ├── tanda-terima/
│   ├── kuitansi/
│   ├── rekapitulasi/
│   ├── dokumen/
│   ├── notifikasi/
│   ├── log-aktivitas/
│   └── pengaturan/
│
├── components/                 # Shared Components
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── tables/
│   ├── cards/
│   ├── charts/
│   ├── dialogs/
│   ├── upload/
│   ├── signature/
│   ├── feedback/
│   ├── loading/
│   └── print/
│
├── hooks/                      # Shared Hooks
│
├── services/                   # API Layer
│
├── stores/                     # Zustand
│
├── schemas/                    # Zod Schema
│
├── types/                      # TypeScript Types
│
├── lib/                        # Library Wrapper
│
├── utils/                      # Helper Function
│
├── constants/                  # Global Constants
│
├── providers/                  # React Provider
│
├── config/                     # Application Config
│
├── styles/                     # Global Style
│
├── assets/
│   ├── images/
│   ├── icons/
│   ├── logo/
│   ├── fonts/
│   └── illustrations/
│
├── public/
│   ├── manifest.json
│   ├── favicon.ico
│   ├── icons/
│   └── templates/
│
└── middleware.ts
```

---

# MODULE STRUCTURE

Setiap Module WAJIB memiliki struktur berikut.

```text
modules/
│
└── sppd/
    │
    ├── components/
    │
    ├── hooks/
    │
    ├── services/
    │
    ├── stores/
    │
    ├── schemas/
    │
    ├── types/
    │
    ├── constants/
    │
    ├── utils/
    │
    ├── pages/
    │
    ├── templates/
    │
    ├── README.md
    │
    └── index.ts
```

---

# COMPONENT STRUCTURE

```text
components/
│
├── ui/
│
├── forms/
│
├── tables/
│
├── cards/
│
├── charts/
│
├── dialogs/
│
├── feedback/
│
├── upload/
│
├── signature/
│
├── layout/
│
└── print/
```

---

# FILE NAMING CONVENTION

Component

```text
PascalCase.tsx
```

Contoh

```text
DashboardPage.tsx

SPPDForm.tsx

ApprovalDialog.tsx
```

---

Hook

```text
useCamelCase.ts
```

Contoh

```text
useSPPD.ts

useApproval.ts
```

---

Store

```text
module.store.ts
```

Contoh

```text
sppd.store.ts

approval.store.ts
```

---

Service

```text
module.service.ts
```

---

Schema

```text
module.schema.ts
```

---

Types

```text
module.types.ts
```

---

Constants

```text
module.constants.ts
```

---

Utils

```text
module.ts
```

---

# ARCHITECTURE RULES

AI tidak diperbolehkan:

- Membuat folder baru apabila sudah tersedia folder yang sesuai.
- Menempatkan Business Logic di dalam Component.
- Mengakses API langsung dari Component.
- Membuat komponen yang duplikat.
- Menaruh utilitas umum di dalam module tertentu apabila dapat digunakan bersama.

---

# PREFERRED ORDER

Saat membuat fitur baru, AI wajib mengikuti urutan berikut:

1. Schema
2. Types
3. Constants
4. Service
5. Store
6. Hook
7. Component
8. Page
9. Test (jika tersedia)
10. Dokumentasi README module

Urutan ini wajib dipertahankan agar seluruh implementasi tetap konsisten dengan Engineering Source of Truth.

# DO NOT CREATE

AI TIDAK DIPERBOLEHKAN membuat struktur baru apabila fungsi yang sama sudah tersedia.

Dilarang membuat folder berikut:

```text
helpers/
helper/
common/
commons/
base/
bases/
shareds/
global/
globals/
context/
contexts/
api/
apis/
repository/
repositories/
manager/
managers/
store/
stores-v2/
hooks-v2/
utils-v2/
lib-v2/
```

Gunakan struktur yang telah ditetapkan pada Engineering SOT.

---

AI juga TIDAK DIPERBOLEHKAN membuat folder berikut di dalam setiap module:

```text
controller/
model/
entity/
dto/
middleware/
provider/
```

Frontend bukan Backend.

---

# REUSE POLICY

Sebelum membuat file baru AI WAJIB mencari apakah file serupa sudah ada.

Prioritas reuse:

1.

Shared Component

↓

components/

2.

Shared Hook

↓

hooks/

3.

Shared Service

↓

services/

4.

Shared Utility

↓

utils/

5.

Shared Library

↓

lib/

6.

Shared Types

↓

types/

7.

Shared Schema

↓

schemas/

Jika sudah tersedia,

gunakan kembali.

Jangan membuat duplikasi.

---

# DECISION TREE

Sebelum membuat kode AI wajib mengikuti alur berikut.

```text
Requirement Ada?

        │

        ▼

Ya

        │

        ▼

PRD Ada?

        │

        ▼

Ya

        │

        ▼

UI Guideline Ada?

        │

        ▼

Ya

        │

        ▼

Implementation Plan Ada?

        │

        ▼

Ya

        │

        ▼

Komponen Sudah Ada?

      │          │

      │          ▼

      │       Ya

      │          │

      ▼          ▼

Tidak      Gunakan Ulang

      │

      ▼

Buat Component Baru

      │

      ▼

Implementasi
```

Jika salah satu jawaban adalah **Tidak**, AI harus berhenti dan meminta klarifikasi atau pembaruan Source of Truth.

---

# DEVELOPMENT PRIORITY

Saat mengimplementasikan sebuah fitur AI WAJIB mengikuti urutan berikut.

```text
Requirement

↓

Types

↓

Schema

↓

Constants

↓

API Service

↓

Store

↓

Hook

↓

Validation

↓

UI Component

↓

Page

↓

Testing

↓

Documentation
```

AI tidak boleh langsung membuat halaman tanpa melalui tahapan di atas.

---

# FILE CREATION POLICY

Sebelum membuat file baru AI WAJIB melakukan pemeriksaan berikut:

- Apakah file dengan fungsi serupa sudah ada?
- Apakah komponen dapat digunakan kembali?
- Apakah utilitas sudah tersedia?
- Apakah hook sudah tersedia?
- Apakah service sudah tersedia?
- Apakah schema sudah tersedia?
- Apakah types sudah tersedia?

Jika jawabannya **Ya**, gunakan file yang ada.

---

# REFACTOR POLICY

AI boleh melakukan refactor apabila:

- Tidak mengubah Business Rule.
- Tidak mengubah Workflow.
- Tidak mengubah UI.
- Tidak mengubah Route.
- Tidak mengubah Permission.
- Tidak mengubah Public API Component.

Refactor hanya boleh bertujuan untuk:

- meningkatkan keterbacaan,
- mengurangi duplikasi,
- meningkatkan performa,
- meningkatkan maintainability.

---

# UI CONSISTENCY POLICY

AI tidak diperbolehkan:

- Mengganti warna.
- Mengganti typography.
- Mengganti radius.
- Mengganti spacing.
- Mengganti icon library.
- Mengganti animation style.

Semua harus mengikuti:

02-UI-Guideline.md

---

# PERFORMANCE POLICY

AI wajib:

- menggunakan lazy loading bila sesuai,
- menggunakan dynamic import untuk halaman atau komponen besar,
- menggunakan memoization hanya jika benar-benar diperlukan,
- menghindari re-render yang tidak perlu,
- menghindari perhitungan berat di dalam render,
- menggunakan TanStack Query untuk data server,
- menggunakan Zustand hanya untuk client state.

---

# CODE QUALITY POLICY

Seluruh kode wajib memenuhi:

- TypeScript Strict Mode.
- ESLint tanpa error.
- Prettier tanpa perubahan.
- Tidak menggunakan `any`.
- Tidak menggunakan `console.log` pada kode produksi.
- Tidak menggunakan komentar yang tidak diperlukan.
- Nama variabel dan fungsi harus deskriptif.
- Satu file memiliki satu tanggung jawab utama.

---

# RESPONSE CHECKLIST

Setiap selesai mengerjakan tugas AI WAJIB memberikan ringkasan dengan format berikut.

## Ringkasan

### Modul

Nama modul yang dikerjakan.

### Requirement

Daftar FR yang diimplementasikan.

### Business Process

Daftar BP yang terkait.

### File Dibuat

- ...

### File Diubah

- ...

### Reusable Component

Komponen yang digunakan kembali.

### Hook

Hook yang digunakan atau dibuat.

### Service

Service yang digunakan atau dibuat.

### Store

Store yang digunakan atau dibuat.

### Schema

Schema yang digunakan atau dibuat.

### Catatan

Asumsi atau keputusan teknis (jika ada).

---

# FINAL EXECUTION RULE

AI wajib selalu berpikir dengan urutan berikut:

1. Baca PRD.
2. Baca UI Guideline.
3. Baca Implementation Plan.
4. Cari komponen yang sudah ada.
5. Gunakan kembali jika memungkinkan.
6. Implementasikan sesuai arsitektur.
7. Jangan membuat asumsi bisnis.
8. Jangan membuat desain baru.
9. Jangan membuat struktur baru.
10. Laporkan hasil implementasi menggunakan format Ringkasan.

Seluruh implementasi harus konsisten dengan **Business Source of Truth**, **Design Source of Truth**, dan **Engineering Source of Truth**.

# EXECUTION PROTOCOL

Seluruh AI Coding Agent WAJIB mengikuti protokol berikut sebelum melakukan pekerjaan apa pun.

---

# PHASE 1 — DISCOVER

AI wajib memahami project terlebih dahulu.

Urutan:

1. Baca struktur project.
2. Baca folder DOCS.
3. Baca:

   - 01-PRD.md
   - 02-UI-Guideline.md
   - 03-Implementation-Plan.md

4. Identifikasi module yang akan dikerjakan.
5. Identifikasi Business Process (BP).
6. Identifikasi Functional Requirement (FR).
7. Identifikasi UI Screen.
8. Identifikasi Route.
9. Identifikasi Permission.

Pada fase ini AI **TIDAK BOLEH MENULIS KODE**.

---

# PHASE 2 — ANALYZE

AI melakukan analisis terhadap project.

Periksa:

- Folder yang sudah ada.
- Component yang sudah ada.
- Hook yang sudah ada.
- Service yang sudah ada.
- Store yang sudah ada.
- Schema yang sudah ada.
- Types yang sudah ada.
- Utility yang sudah ada.

Tujuan:

Reuse sebanyak mungkin.

AI **BELUM BOLEH MEMBUAT FILE BARU**.

---

# PHASE 3 — PLAN

AI membuat rencana implementasi.

Minimal berisi:

- Module
- Files
- Components
- Hook
- Service
- Store
- Schema
- Types
- Route
- Permission
- Requirement (FR)
- Business Process (BP)

Apabila terdapat konflik dengan Source of Truth, AI wajib berhenti dan meminta klarifikasi.

---

# PHASE 4 — IMPLEMENT

Baru setelah seluruh fase sebelumnya selesai, AI boleh:

- membuat file baru,
- mengubah file,
- menambahkan komponen,
- membuat hook,
- membuat service,
- membuat schema,
- membuat store,
- membuat halaman.

Implementasi wajib mengikuti Engineering SOT.

---

# PHASE 5 — VERIFY

Setelah implementasi selesai, AI wajib memverifikasi:

## Architecture

- Tidak melanggar struktur folder.
- Tidak membuat folder baru yang tidak diperlukan.
- Tidak membuat duplicate component.

---

## Business

- Sesuai PRD.
- Sesuai BP.
- Sesuai BR.
- Sesuai FR.

---

## UI

- Sesuai UI Guideline.
- Menggunakan Design Token.
- Responsive.
- Accessible.

---

## Engineering

- Sesuai Implementation Plan.
- Menggunakan Hook.
- Menggunakan Service.
- Menggunakan Store.
- Menggunakan Schema.

---

## Quality

- TypeScript Strict.
- Tidak ada any.
- Tidak ada duplicate code.
- Tidak ada magic number.
- Tidak ada hardcode color.
- Tidak ada hardcode spacing.

---

# PHASE 6 — REPORT

AI wajib mengakhiri setiap pekerjaan dengan laporan berikut.

## Summary

### Business Process

BP yang dikerjakan.

### Functional Requirement

FR yang diimplementasikan.

### Module

Module yang diubah.

### Files Created

Daftar file baru.

### Files Modified

Daftar file yang diubah.

### Reused Component

Komponen yang digunakan kembali.

### Hook

Hook yang digunakan.

### Store

Store yang digunakan.

### Service

Service yang digunakan.

### Schema

Schema yang digunakan.

### Route

Route yang terpengaruh.

### Permission

Role yang terpengaruh.

### Validation

Validasi yang diterapkan.

### Notes

Catatan implementasi.

---

# EXECUTION CONTRACT

AI WAJIB mematuhi urutan berikut.

```text
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
```

AI tidak diperbolehkan melompati tahapan.

Apabila salah satu tahap tidak dapat diselesaikan karena informasi tidak tersedia pada Source of Truth, AI wajib berhenti dan meminta klarifikasi sebelum melanjutkan implementasi.

---

# GOLDEN RULE

Sebelum menulis satu baris kode pun, AI harus dapat menjawab pertanyaan berikut:

1. Requirement ini berasal dari FR berapa?
2. Business Process mana yang terkait?
3. Screen mana yang akan diubah?
4. Route mana yang akan digunakan?
5. Component apa yang dapat digunakan kembali?
6. Hook apa yang sudah tersedia?
7. Service apa yang digunakan?
8. Store apa yang digunakan?
9. Schema apa yang digunakan?
10. Apakah perubahan ini sesuai dengan PRD, UI Guideline, dan Implementation Plan?

Jika salah satu jawaban tidak dapat dipastikan berdasarkan Source of Truth, AI tidak boleh melanjutkan implementasi.
