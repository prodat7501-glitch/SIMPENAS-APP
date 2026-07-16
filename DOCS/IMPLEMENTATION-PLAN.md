# IMPLEMENTATION PLAN

# Sistem Informasi Manajemen Perjalanan Dinas (SIMPENAS)

## Engineering Source of Truth (Engineering SOT)

Versi : 1.0

---

# BAB 1. Development Philosophy

## Tujuan

Dokumen ini menjadi pedoman implementasi seluruh Frontend Application SIMPENAS.

Seluruh pengembangan wajib mengacu kepada:

1. Product Requirement Document (PRD)
2. UI Guideline
3. Engineering Source of Truth (Dokumen ini)

Tidak diperbolehkan membuat fitur di luar PRD tanpa perubahan resmi terhadap Source of Truth.

---

## Prinsip Pengembangan

Seluruh pengembangan menggunakan prinsip:

- Component Driven Development

- Feature Based Architecture

- Source of Truth Driven

- Mobile First

- Responsive Design

- Reusable Component

- Clean Architecture

- SOLID Principle

- Atomic Design

- DRY (Don't Repeat Yourself)

- KISS (Keep It Simple)

- Scalable

- Maintainable

- Enterprise Ready

---

## Target

Frontend harus:

- Mudah dikembangkan

- Mudah dipelihara

- Mudah diuji

- Mudah diintegrasikan dengan Backend API

- Mendukung PWA

---

# BAB 2. Technology Stack

## Framework

Next.js 15

App Router

---

## Language

TypeScript

Strict Mode

---

## UI

React 19

---

## Styling

Tailwind CSS v4

---

## Component Library

shadcn/ui

---

## Icon

Lucide React

---

## Animation

Framer Motion

---

## State

Zustand

---

## Server State

TanStack Query

---

## Form

React Hook Form

---

## Validation

Zod

---

## Chart

Recharts

---

## Theme

next-themes

---

## Date

date-fns

---

## PWA

next-pwa

---

## Package Manager

pnpm

---

# BAB 3. Frontend Architecture

Menggunakan pendekatan:

Feature Based Modular Architecture

```text
Presentation Layer

↓

Application Layer

↓

Domain Layer

↓

Infrastructure Layer
```

---

## Presentation Layer

Berisi:

- Pages

- Layout

- Components

- Forms

---

## Application Layer

Berisi:

- Hooks

- Store

- Services

---

## Domain Layer

Berisi:

- Types

- Interface

- Schema

- Validation

---

## Infrastructure Layer

Berisi:

- API Client

- Constants

- Utilities

- Config

---

# BAB 4. Folder Structure

```text
src/

│

├── app/

├── modules/

├── components/

├── layouts/

├── hooks/

├── stores/

├── services/

├── schemas/

├── types/

├── lib/

├── utils/

├── constants/

├── styles/

├── providers/

├── config/

├── assets/

└── middleware.ts
```

---

## App

Berisi routing NextJS.

---

## Modules

Setiap fitur memiliki module sendiri.

Contoh

```text
modules/

pegawai/

nota-dinas/

spt/

sppd/

laporan/

keuangan/

approval/

dashboard/
```

---

## Shared Component

```text
components/

ui/

forms/

tables/

cards/

charts/

dialogs/

layout/

feedback/

upload/

signature/
```

---

# BAB 5. Routing

Menggunakan App Router.

```text
/

login

dashboard

master

master/pegawai

master/jabatan

master/unit-kerja

master/pangkat

master/dipa

master/penandatangan

master/sbm

transaksi

nota-dinas

spt

sppd

laporan

approval

spby

daftar-nominatif

tanda-terima

kuitansi

rekapitulasi

pengaturan

profile
```

---

## Route Convention

Menggunakan

kebab-case

---

## Protected Route

Semua halaman selain Login wajib menggunakan middleware authentication.

---

# BAB 6. Module Mapping

| Modul            | Route                 |
| ---------------- | --------------------- |
| Dashboard        | /dashboard            |
| Pegawai          | /master/pegawai       |
| Jabatan          | /master/jabatan       |
| Unit Kerja       | /master/unit-kerja    |
| Pangkat          | /master/pangkat       |
| DIPA             | /master/dipa          |
| Penandatangan    | /master/penandatangan |
| SBM              | /master/sbm           |
| Nota Dinas       | /nota-dinas           |
| SPT              | /spt                  |
| SPPD             | /sppd                 |
| Laporan          | /laporan              |
| Approval         | /approval             |
| SPBY             | /spby                 |
| Daftar Nominatif | /daftar-nominatif     |
| Tanda Terima     | /tanda-terima         |
| Kuitansi         | /kuitansi             |
| Rekapitulasi     | /rekapitulasi         |
| Pengaturan       | /pengaturan           |

---

## Screen Mapping

Setiap screen wajib memiliki:

- Page

- Form

- Table

- Dialog

- Preview

- Print

- Validation

- API

- Store

- Hook

---

# BAB 7. Component Tree

## Dashboard

```text
DashboardPage

↓

DashboardLayout

↓

StatisticCard

↓

ChartCard

↓

ActivityCard

↓

NotificationCard

↓

QuickActionCard
```

---

## Nota Dinas

```text
NotaDinasPage

↓

Toolbar

↓

Filter

↓

Table

↓

Dialog

↓

Form

↓

LampiranTable

↓

Preview

↓

Print
```

---

## SPT

```text
SPTPage

↓

SPTToolbar

↓

SPTTable

↓

SPTDialog

↓

SPTForm

↓

DynamicField

↓

PrintPreview
```

---

## SPPD

```text
SPPDPage

↓

SPPDToolbar

↓

SPPDTable

↓

SPPDFilter

↓

SPPDDialog

↓

SPPDForm

↓

DateRange

↓

PrintPreview
```

---

## Laporan

```text
LaporanPage

↓

LaporanForm

↓

RichEditor

↓

UploadGallery

↓

Signature

↓

Preview
```

---

## Keuangan

```text
SPBYPage

↓

NomorGenerator

↓

PaymentForm

↓

Preview

↓

Print
```

---

# BAB 8. Layout Architecture

Menggunakan App Shell.

```text
Sidebar

↓

Header

↓

Breadcrumb

↓

Content

↓

Footer
```

---

## Sidebar

Berisi:

- Dashboard

- Master

- Transaksi

- Approval

- Rekapitulasi

- Pengaturan

---

## Header

Berisi:

- Search

- Notification

- Theme

- User Menu

---

## Content

Dynamic berdasarkan route.

---

# BAB 9. State Management

Menggunakan:

Zustand

Server State:

TanStack Query

---

## Global Store

```text
auth.store.ts

theme.store.ts

sidebar.store.ts

notification.store.ts
```

---

## Feature Store

```text
pegawai.store.ts

jabatan.store.ts

dipa.store.ts

nota-dinas.store.ts

spt.store.ts

sppd.store.ts

laporan.store.ts

approval.store.ts

keuangan.store.ts
```

---

## Rule

Global Store

↓

UI State

Feature Store

↓

Business State

Server State

↓

TanStack Query

---

# BAB 10. Data Management Strategy

## Client State

Menggunakan Zustand untuk:

- Sidebar

- Theme

- Modal

- Notification

- User Session

---

## Server State

Menggunakan TanStack Query untuk:

- Fetch

- Mutation

- Cache

- Refetch

- Invalidate Cache

---

## Data Flow

```text
API

↓

Service

↓

TanStack Query

↓

Store

↓

Component
```

---

## Cache Strategy

Data Master

Cache 30 menit

Dashboard

Auto Refetch

Data Transaksi

Manual Refetch setelah Mutation

Dokumen

Always Fresh

---

## Optimistic Update

Digunakan pada:

- Approval

- Update Status

- Notification

- Log Aktivitas

---

## Offline Strategy

PWA menyimpan:

- Asset statis

- Ikon

- Font

- Manifest

Data transaksi tetap memerlukan koneksi jaringan untuk menjaga konsistensi data.

# BAB 11. API Layer Architecture

Seluruh komunikasi dengan Backend menggunakan pola **Service Layer**.

Component **tidak diperbolehkan** memanggil API secara langsung.

Seluruh request harus melalui Service Layer.

---

## Architecture

```text
UI Component

↓

React Hook

↓

TanStack Query

↓

Service Layer

↓

API Client

↓

Backend API
```

---

## API Folder Structure

```text
services/

├── api.ts

├── auth.service.ts

├── dashboard.service.ts

├── pegawai.service.ts

├── jabatan.service.ts

├── unit-kerja.service.ts

├── pangkat.service.ts

├── dipa.service.ts

├── penandatangan.service.ts

├── sbm.service.ts

├── nota-dinas.service.ts

├── spt.service.ts

├── sppd.service.ts

├── laporan.service.ts

├── approval.service.ts

├── spby.service.ts

├── nominatif.service.ts

├── tanda-terima.service.ts

├── kuitansi.service.ts

├── rekapitulasi.service.ts

├── notification.service.ts

└── upload.service.ts
```

---

## API Client

Seluruh request menggunakan satu API Client.

Tanggung jawab API Client:

- Base URL
- Authorization Header
- Refresh Token (future)
- Request Interceptor
- Response Interceptor
- Error Handler
- Timeout
- Retry Strategy

---

## Endpoint Convention

Menggunakan REST API.

Contoh:

GET

POST

PUT

PATCH

DELETE

---

## Error Response Standard

```text
status

message

errors

timestamp

requestId
```

---

# BAB 12. Hooks Architecture

Seluruh business logic dipindahkan ke Custom Hooks.

Component hanya bertugas menampilkan UI.

---

## Global Hooks

```text
useAuth

useTheme

useSidebar

useNotification

useDebounce

usePagination

usePermission

useConfirmDialog
```

---

## Feature Hooks

```text
useDashboard

usePegawai

useJabatan

useUnitKerja

usePangkat

useDIPA

useSBM

useNotaDinas

useSPT

useSPPD

useLaporan

useApproval

useSPBY

useNominatif

useKuitansi

useUpload
```

---

## Hook Responsibility

Setiap Hook bertanggung jawab terhadap:

- Fetch Data
- Mutation
- Loading State
- Error State
- Success State
- Validation Trigger
- Cache Invalidation
- Business Logic

---

## Hook Naming Convention

Menggunakan camelCase.

Contoh:

usePegawai()

useSPPD()

useApproval()

---

# BAB 13. Form Architecture

Seluruh Form wajib menggunakan pola yang konsisten.

---

## Library

React Hook Form

-

Zod

---

## Form Structure

```text
Form

↓

Schema

↓

Default Values

↓

Validation

↓

Submit

↓

Mutation

↓

Success Handler

↓

Error Handler
```

---

## Standar Field

Setiap Field memiliki:

- Label
- Placeholder
- Helper Text
- Validation
- Error Message
- Required Indicator

---

## Dynamic Form

Digunakan pada:

- Menimbang

- Dasar

- Kegiatan

- Lampiran Nota Dinas

- Personil

- Dokumentasi

---

## Currency

Seluruh nominal menggunakan format Rupiah.

---

## Date

Menggunakan format:

DD MMMM YYYY

---

## Upload

Support:

Single

Multiple

Preview

Progress

Delete

Retry

---

## Signature

Mendukung:

Canvas

Touch

Mouse

Clear

Save

---

# BAB 14. Validation Strategy

Seluruh validasi dilakukan pada dua sisi:

Client Validation

Server Validation

---

## Client Validation

Menggunakan:

Zod

React Hook Form

---

## Server Validation

Dilakukan oleh Backend API.

Frontend wajib menampilkan pesan validasi dari Backend.

---

## Validation Flow

```text
User Input

↓

Client Validation

↓

API Request

↓

Server Validation

↓

Response

↓

Toast

↓

Update UI
```

---

## Validation Rule

Setiap modul memiliki schema sendiri.

Contoh:

```text
login.schema.ts

pegawai.schema.ts

nota-dinas.schema.ts

spt.schema.ts

sppd.schema.ts

laporan.schema.ts

spby.schema.ts
```

---

## Error Message

Seluruh Error Message menggunakan bahasa Indonesia.

Contoh:

"Nomor SPT wajib diisi."

"Tanggal Berangkat tidak boleh kosong."

"Minimal terdapat satu Personil."

---

# BAB 15. Authentication & Authorization

Menggunakan RBAC (Role-Based Access Control).

---

## Login Flow

```text
Login

↓

Backend Validation

↓

Access Token

↓

Session

↓

Dashboard
```

---

## Authentication Flow

```text
User

↓

Middleware

↓

Session Check

↓

Permission Check

↓

Route

↓

Page
```

---

## Authorization

Hak akses berdasarkan Role.

Role:

- Administrator
- Supervisor
- Pegawai
- Sub Bagian Keuangan

---

## Middleware

Seluruh halaman selain Login menggunakan Middleware.

---

## Permission Guard

Setiap Route wajib memiliki:

- Authentication Check
- Permission Check
- Redirect jika tidak memiliki akses

---

## Menu Guard

Sidebar hanya menampilkan menu sesuai Role.

---

## Action Guard

Button:

Tambah

Ubah

Hapus

Approval

Print

Export

Generate

Ambil Nomor

ditampilkan sesuai hak akses pengguna.

---

## Document Guard

Dokumen hanya dapat:

Dilihat

Diubah

Dicetak

Diunduh

sesuai matriks hak akses pada PRD.

---

## Audit Integration

Setiap aktivitas berikut wajib tercatat:

- Login
- Logout
- Tambah
- Ubah
- Hapus
- Approval
- Generate Dokumen
- Print
- Export
- Download

Audit Trail menjadi bagian dari proses Authentication & Authorization.

# BAB 16. Dashboard Architecture

Dashboard merupakan halaman utama yang ditampilkan setelah pengguna berhasil melakukan autentikasi.

Dashboard bersifat **Role-Based Dashboard**, sehingga setiap Role memiliki tampilan, data, dan aksi yang berbeda sesuai hak akses.

---

## Dashboard Flow

```text
Login
   │
   ▼
Load Session
   │
   ▼
Load Permission
   │
   ▼
Load Dashboard Widget
   │
   ▼
Load Statistik
   │
   ▼
Load Notification
   │
   ▼
Load Recent Activity
```

---

## Widget Dashboard

### Administrator

Widget:

- Total Pegawai
- Total Perjalanan Dinas
- Total Nota Dinas
- Total SPT
- Total SPPD
- Total SPBY
- Total Anggaran
- Total Realisasi
- Approval Menunggu
- Grafik Perjalanan Dinas
- Grafik Realisasi Anggaran
- Aktivitas Terbaru
- Notifikasi
- Quick Action

---

### Supervisor

Widget:

- Approval Menunggu
- Perjalanan Dinas Aktif
- Jumlah Perjalanan Dinas
- Statistik Dokumen
- Aktivitas Terbaru
- Notifikasi

Supervisor tidak dapat melihat nominal pembayaran.

---

### Pegawai

Widget:

- Perjalanan Dinas Saya
- Status SPT
- Status SPPD
- Status Approval
- Jadwal Perjalanan Terdekat
- Notifikasi
- Aktivitas Saya

Pegawai tidak dapat melihat data pegawai lain.

---

### Sub Bagian Keuangan

Widget:

- SPJ Menunggu Validasi
- SPBY Menunggu Diproses
- Pembayaran Hari Ini
- Rekap Pembayaran
- Aktivitas Keuangan
- Notifikasi

---

## Dashboard Component Tree

```text
DashboardPage
│
├── DashboardHeader
├── QuickActionCard
├── StatisticGrid
│   └── StatisticCard
├── ChartSection
│   ├── LineChartCard
│   ├── BarChartCard
│   └── PieChartCard
├── NotificationCard
├── ActivityCard
└── RecentDocumentCard
```

---

# BAB 17. Shared Components

Seluruh komponen harus reusable dan diletakkan pada folder **shared/components**.

---

## Layout

- AppLayout
- AuthLayout
- DashboardLayout

---

## Navigation

- Sidebar
- SidebarMenu
- SidebarGroup
- Topbar
- Breadcrumb
- UserMenu

---

## Data Display

- DataTable
- EmptyState
- StatisticCard
- StatusBadge
- Timeline
- Avatar
- DocumentCard

---

## Form

- FormField
- InputField
- CurrencyField
- DatePickerField
- DateRangeField
- SelectField
- MultiSelectField
- TextareaField
- DynamicField
- SignaturePad
- UploadField

---

## Dialog

- ConfirmDialog
- DeleteDialog
- PreviewDialog
- ApprovalDialog
- RejectDialog

---

## Feedback

- LoadingOverlay
- SkeletonLoader
- ErrorState
- SuccessState
- ToastNotification
- ProgressBar

---

## Print

- PrintPreview
- PdfViewer
- PrintToolbar

---

# BAB 18. Design Tokens Implementation

Seluruh implementasi UI **wajib menggunakan Design Tokens**.

Dilarang menggunakan nilai hardcode untuk warna, radius, spacing, shadow, dan typography.

---

## Color Token

```text
primary

primary-hover

primary-active

success

warning

danger

info

background

surface

card

border

divider

text-primary

text-secondary

muted
```

---

## Radius Token

```text
xs

sm

md

lg

xl

2xl

3xl

full
```

---

## Spacing Token

```text
1

2

3

4

5

6

8

10

12

16

20

24
```

---

## Shadow Token

```text
xs

sm

md

lg

xl
```

---

## Typography Token

```text
display

heading

title

subtitle

body

caption

label
```

---

## Animation Token

```text
fast

normal

slow
```

---

# BAB 19. Utility & Helper Library

Seluruh fungsi umum ditempatkan pada folder **lib** atau **utils**.

---

## Formatter

- formatDate()
- formatDateTime()
- formatCurrency()
- formatNumber()
- formatDuration()
- formatFileSize()

---

## Validator

- isRequired()
- isDate()
- isCurrency()
- isEmail()
- isUsername()

---

## Permission

- hasRole()
- hasPermission()
- canCreate()
- canUpdate()
- canDelete()
- canApprove()
- canExport()
- canPrint()

---

## Number Generator

- generateDocumentNumber()
- parseDocumentNumber()

Catatan: implementasi final tetap berada di Backend, sedangkan Frontend hanya menggunakan hasil dari API.

---

## Document

- downloadPdf()
- previewPdf()
- printDocument()
- exportExcel()

---

## Upload

- uploadFile()
- removeFile()
- previewImage()
- compressImage()

---

## Storage

- getToken()
- setToken()
- removeToken()
- getTheme()
- setTheme()

---

# BAB 20. Naming Convention & Coding Standard

Seluruh kode harus mengikuti standar yang konsisten.

---

## Folder

Menggunakan **kebab-case**.

Contoh:

```text
master-pegawai

nota-dinas

laporan-perjalanan
```

---

## Component

Menggunakan **PascalCase**.

Contoh:

```text
DashboardPage

SPPDTable

ApprovalDialog

StatisticCard
```

---

## Hooks

Menggunakan awalan **use** dengan **camelCase**.

Contoh:

```text
useAuth

useDashboard

useSPPD

useApproval
```

---

## Store

Format:

```text
nama-modul.store.ts
```

Contoh:

```text
auth.store.ts

sppd.store.ts

approval.store.ts
```

---

## Service

Format:

```text
nama-modul.service.ts
```

---

## Schema

Format:

```text
nama-modul.schema.ts
```

---

## Type

Format:

```text
nama-modul.types.ts
```

---

## Constants

Format:

```text
nama-modul.constants.ts
```

---

## API Query Keys

Gunakan pola yang konsisten.

Contoh:

```text
['dashboard']

['pegawai']

['nota-dinas']

['spt']

['sppd']

['laporan']

['approval']
```

---

## Import Rules

Urutan import:

1. Library eksternal
2. Internal alias (`@/`)
3. Relative import
4. Style (jika ada)

---

## Code Style

- Gunakan TypeScript Strict Mode.
- Hindari penggunaan `any`.
- Setiap fungsi memiliki satu tanggung jawab (Single Responsibility).
- Maksimal satu komponen per file.
- Pisahkan business logic ke Custom Hooks.
- Pisahkan komunikasi API ke Service Layer.
- Gunakan konstanta untuk nilai yang digunakan berulang.
- Hindari duplikasi kode (DRY).
- Gunakan nama variabel dan fungsi yang deskriptif.

---

## Documentation

Setiap modul wajib memiliki:

- README.md
- Daftar dependensi
- Catatan implementasi khusus (jika diperlukan)
- Referensi ke BP, BR, FR, dan UI Guideline yang terkait

Dengan demikian setiap modul dapat dikembangkan, diuji, dan dipelihara secara mandiri tanpa mengurangi konsistensi keseluruhan aplikasi.

# BAB 21. Service Layer & Repository Pattern

Seluruh komunikasi dengan Backend wajib menggunakan **Service Layer**. Komponen React tidak diperbolehkan mengakses API secara langsung.

---

## Arsitektur

```text
Component
    │
    ▼
Custom Hook
    │
    ▼
Service Layer
    │
    ▼
API Client
    │
    ▼
Backend API
```

---

## Struktur Folder

```text
services/

├── api.ts
├── auth.service.ts
├── dashboard.service.ts
├── master/
│   ├── pegawai.service.ts
│   ├── jabatan.service.ts
│   ├── unit-kerja.service.ts
│   ├── pangkat.service.ts
│   ├── dipa.service.ts
│   ├── penandatangan.service.ts
│   └── sbm.service.ts
├── transaksi/
│   ├── nota-dinas.service.ts
│   ├── spt.service.ts
│   ├── sppd.service.ts
│   ├── laporan.service.ts
│   ├── approval.service.ts
│   └── upload.service.ts
├── keuangan/
│   ├── spby.service.ts
│   ├── nominatif.service.ts
│   ├── tanda-terima.service.ts
│   └── kuitansi.service.ts
└── rekapitulasi.service.ts
```

---

## Tanggung Jawab Service

Setiap Service bertanggung jawab terhadap:

- Fetch Data
- Create Data
- Update Data
- Delete Data
- Export Data
- Generate Dokumen
- Upload File
- Download Dokumen

---

## Repository Pattern

Seluruh Service menggunakan pola Repository agar mudah diganti apabila terjadi perubahan Backend atau API.

---

# BAB 22. Feature Module Architecture

Setiap fitur dikembangkan sebagai module yang berdiri sendiri (feature-based architecture).

---

## Struktur Module

```text
modules/

pegawai/
│
├── components/
├── hooks/
├── services/
├── schemas/
├── stores/
├── types/
├── constants/
├── utils/
├── pages/
└── README.md
```

---

## Daftar Module

### Master

- Pegawai
- Jabatan
- Unit Kerja
- Pangkat
- DIPA
- Penandatangan
- Standar Biaya Masukan

---

### Transaksi

- Nota Dinas
- SPT
- SPPD
- Laporan Perjalanan

---

### Keuangan

- SPBY
- Daftar Nominatif
- Tanda Terima
- Kuitansi

---

### Sistem

- Dashboard
- Approval
- Rekapitulasi
- Notifikasi
- Manajemen Dokumen
- Log Aktivitas
- Pengaturan

---

## Aturan Module

- Setiap module memiliki folder sendiri.
- Tidak diperbolehkan saling bergantung secara langsung antar module.
- Komunikasi antar module dilakukan melalui Service atau Shared Library.

---

# BAB 23. Git Strategy

Pengembangan menggunakan Git dengan strategi Git Flow yang disederhanakan.

---

## Branch

```text
main

develop

feature/*

bugfix/*

hotfix/*

release/*
```

---

## Penjelasan

### main

Branch produksi.

---

### develop

Branch integrasi pengembangan.

---

### feature

Digunakan untuk pengembangan fitur baru.

Contoh:

```text
feature/master-pegawai

feature/sppd

feature/dashboard
```

---

### bugfix

Digunakan untuk perbaikan bug pada branch develop.

---

### hotfix

Digunakan untuk perbaikan cepat pada produksi.

---

### release

Digunakan untuk persiapan rilis.

---

## Commit Message Convention

Menggunakan Conventional Commits.

Contoh:

```text
feat: tambah halaman SPPD

fix: perbaiki validasi tanggal

refactor: pisahkan service approval

docs: update PRD

style: rapikan layout dashboard

test: tambah unit test login

chore: update dependency
```

---

# BAB 24. Testing Strategy

Pengujian dilakukan pada beberapa tingkatan.

---

## Unit Testing

Menguji:

- Utility
- Helper
- Hooks
- Validation
- Formatter

---

## Integration Testing

Menguji:

- Form + Service
- Service + API
- Store + Component

---

## UI Testing

Menguji:

- Form
- Dialog
- Table
- Button
- Navigation
- Responsive Layout

---

## User Acceptance Testing (UAT)

Mengacu pada Acceptance Criteria di PRD.

---

## Regression Testing

Dilakukan sebelum setiap rilis untuk memastikan fitur lama tetap berjalan dengan baik.

---

## Test Coverage

Target minimal:

- Business Logic ≥ 80%
- Utility ≥ 90%
- Validation ≥ 90%

---

## Manual Testing Checklist

Setiap fitur wajib diuji:

- Create
- Read
- Update
- Delete
- Approval
- Generate Dokumen
- Export
- Print
- Hak Akses
- Responsif Desktop
- Responsif Tablet
- Responsif Mobile

---

# BAB 25. Build & Deployment Strategy

Deployment dilakukan secara bertahap berdasarkan lingkungan (environment).

---

## Environment

```text
Development

↓

Staging

↓

Production
```

---

## Environment Variable

Seluruh konfigurasi menggunakan file environment.

Contoh:

```text
.env.local

.env.development

.env.staging

.env.production
```

---

## Build Process

```text
Install Dependency

↓

Lint

↓

Type Check

↓

Build

↓

Test

↓

Deploy
```

---

## Deployment Checklist

Sebelum deployment ke Production:

- Seluruh Unit Test lulus.
- Lint tanpa error.
- TypeScript tanpa error.
- Build berhasil.
- UAT disetujui.
- Environment Variable telah diverifikasi.
- Template Dokumen telah diuji.
- Generate PDF telah diuji.
- RBAC telah diverifikasi.
- PWA telah diuji.

---

## Rollback Strategy

Apabila deployment gagal:

1. Kembalikan ke versi stabil sebelumnya.
2. Nonaktifkan fitur yang bermasalah apabila diperlukan.
3. Dokumentasikan penyebab kegagalan.
4. Lakukan perbaikan pada branch hotfix.

---

## Monitoring

Setelah deployment:

- Pantau error aplikasi.
- Pantau performa halaman.
- Pantau penggunaan memori.
- Pantau waktu respon API.
- Pantau log aktivitas dan notifikasi kesalahan.

# BAB 26. Development Roadmap & Milestone

Pengembangan frontend dilakukan secara bertahap berdasarkan prioritas bisnis yang telah ditetapkan pada PRD.

---

## Milestone 1 — Project Foundation

Target:

- Inisialisasi Next.js 15
- Konfigurasi TypeScript
- Konfigurasi Tailwind CSS v4
- Konfigurasi shadcn/ui
- Konfigurasi ESLint & Prettier
- Konfigurasi Husky & lint-staged
- Konfigurasi PWA
- Struktur folder proyek
- Layout dasar aplikasi
- Sistem autentikasi (mock)

Output:

- Fondasi proyek siap dikembangkan.

---

## Milestone 2 — Core System

Target:

- Login
- Dashboard
- Sidebar
- Header
- Breadcrumb
- RBAC
- Theme
- Notification
- Global Store
- Shared Component

Output:

- Kerangka aplikasi selesai.

---

## Milestone 3 — Master Data

Target:

- Master Pegawai
- Master Jabatan
- Master Unit Kerja
- Master Pangkat
- Master DIPA
- Master Penandatangan
- Master SBM

Output:

- Seluruh data referensi selesai.

---

## Milestone 4 — Transaksi

Target:

- Nota Dinas
- SPT
- SPPD
- Laporan Perjalanan

Output:

- Seluruh proses perjalanan dinas selesai.

---

## Milestone 5 — Keuangan

Target:

- Validasi SPJ
- SPBY
- Daftar Nominatif
- Tanda Terima
- Kuitansi

Output:

- Seluruh dokumen keuangan selesai.

---

## Milestone 6 — Finalisasi

Target:

- Rekapitulasi
- Manajemen Dokumen
- Log Aktivitas
- Pengaturan
- Template Dokumen
- Optimasi performa
- UAT
- Deployment Production

Output:

- Aplikasi siap digunakan.

---

# BAB 27. Screen Mapping

Seluruh Business Process pada PRD dipetakan ke layar aplikasi.

| BP    | Screen             | Route             | Role                        | Komponen Utama                            |
| ----- | ------------------ | ----------------- | --------------------------- | ----------------------------------------- |
| BP-01 | Dashboard          | /dashboard        | Semua                       | DashboardLayout, StatisticCard, ChartCard |
| BP-02 | Master Pegawai     | /master/pegawai   | Admin                       | Table, Form, Dialog                       |
| BP-03 | Master Jabatan     | /master/jabatan   | Admin                       | Table, Form                               |
| BP-04 | Master DIPA        | /master/dipa      | Admin                       | Table, Form                               |
| BP-05 | Nota Dinas         | /nota-dinas       | Admin, Supervisor           | Form, LampiranTable, Preview              |
| BP-06 | SPT                | /spt              | Admin, Supervisor, Pegawai  | DynamicForm, Table                        |
| BP-07 | SPPD               | /sppd             | Admin, Supervisor, Pegawai  | DateRange, Form, Preview                  |
| BP-08 | Laporan Perjalanan | /laporan          | Pegawai                     | Editor, Upload, Signature                 |
| BP-09 | Approval           | /approval         | Supervisor                  | Timeline, Dialog                          |
| BP-10 | Validasi SPJ       | /spj              | Keuangan                    | Stepper, StatusCard                       |
| BP-11 | SPBY               | /spby             | Keuangan                    | Form, Preview                             |
| BP-12 | Daftar Nominatif   | /daftar-nominatif | Keuangan                    | Table, Print                              |
| BP-13 | Tanda Terima       | /tanda-terima     | Keuangan                    | Preview                                   |
| BP-14 | Kuitansi           | /kuitansi         | Keuangan                    | Preview                                   |
| BP-15 | Rekapitulasi       | /rekapitulasi     | Admin, Supervisor, Keuangan | Chart, Table                              |

---

# BAB 28. Engineering Checklist

Checklist berikut menjadi acuan progres implementasi.

---

## Foundation

- [ ] Next.js 15
- [ ] TypeScript
- [ ] Tailwind CSS v4
- [ ] shadcn/ui
- [ ] Zustand
- [ ] TanStack Query
- [ ] React Hook Form
- [ ] Zod
- [ ] Recharts
- [ ] Framer Motion
- [ ] next-pwa

---

## Authentication

- [ ] Login
- [ ] Logout
- [ ] RBAC
- [ ] Middleware
- [ ] Protected Route

---

## Dashboard

- [ ] Dashboard Admin
- [ ] Dashboard Supervisor
- [ ] Dashboard Pegawai
- [ ] Dashboard Keuangan

---

## Master Data

- [ ] Pegawai
- [ ] Jabatan
- [ ] Unit Kerja
- [ ] Pangkat
- [ ] DIPA
- [ ] Penandatangan
- [ ] SBM

---

## Transaksi

- [ ] Nota Dinas
- [ ] Ambil Nomor
- [x] SPT
- [x] SPPD
- [x] Laporan Perjalanan

---

## Keuangan

- [x] Validasi SPJ
- [x] SPBY
- [x] Daftar Nominatif
- [x] Tanda Terima
- [x] Kuitansi

---

## Sistem

- [x] Rekapitulasi
- [x] Approval
- [x] Notifikasi
- [x] Manajemen Dokumen
- [x] Log Aktivitas
- [x] Template Dokumen
- [ ] Pengaturan

---

## Finalisasi

- [x] Responsive Desktop
- [x] Responsive Tablet
- [x] Responsive Mobile
- [x] Dark Mode
- [ ] PWA
- [x] Export PDF
- [x] Export Excel
- [ ] Print Friendly
- [ ] UAT
- [ ] Deployment

---

# BAB 29. Engineering Governance

Dokumen ini menjadi acuan utama seluruh tim pengembang.

---

## Aturan Umum

- Tidak membuat fitur di luar PRD tanpa persetujuan perubahan.
- Tidak mengubah Design System tanpa revisi UI Guideline.
- Tidak mengubah arsitektur tanpa pembaruan Engineering SOT.
- Seluruh modul wajib memiliki dokumentasi internal.

---

## Review Code

Setiap Pull Request harus memenuhi:

- Lulus lint.
- Lulus type check.
- Tidak memiliki error build.
- Mengikuti coding standard.
- Memiliki deskripsi perubahan.
- Direview minimal oleh satu pengembang lain (jika tim lebih dari satu orang).

---

## Dokumentasi

Setiap modul wajib memiliki:

- README.md
- Referensi BP, BR, FR
- Daftar API yang digunakan
- Catatan implementasi

---

## Quality Gate

Sebelum fitur dinyatakan selesai:

- Requirement sesuai PRD.
- UI sesuai UI Guideline.
- Implementasi sesuai Engineering SOT.
- Acceptance Criteria terpenuhi.
- Tidak ada bug kritis.

---

# BAB 30. Appendix Engineering

Lampiran ini menjadi referensi teknis selama pengembangan.

---

## A. Folder Mapping

```text id="fo3nkg"
src/
├── app/
├── modules/
├── components/
├── hooks/
├── services/
├── stores/
├── schemas/
├── types/
├── utils/
├── lib/
├── constants/
├── providers/
├── config/
└── assets/
```

---

## B. File Naming

| Jenis     | Format           |
| --------- | ---------------- |
| Component | PascalCase.tsx   |
| Hook      | useXxx.ts        |
| Store     | xxx.store.ts     |
| Service   | xxx.service.ts   |
| Schema    | xxx.schema.ts    |
| Types     | xxx.types.ts     |
| Constants | xxx.constants.ts |
| Utils     | xxx.ts           |

---

## C. Route Convention

- `/dashboard`
- `/master/*`
- `/nota-dinas`
- `/spt`
- `/sppd`
- `/laporan`
- `/approval`
- `/spj`
- `/spby`
- `/daftar-nominatif`
- `/tanda-terima`
- `/kuitansi`
- `/rekapitulasi`
- `/pengaturan`

---

## D. Query Key Convention

```text id="qk7u3m"
dashboard

pegawai

jabatan

unit-kerja

pangkat

dipa

sbm

nota-dinas

spt

sppd

laporan

approval

spby

nominatif

tanda-terima

kuitansi

rekapitulasi
```

---

## E. Referensi Dokumen

Implementasi wajib mengacu pada:

1. **01-PRD.md** — Business Source of Truth.
2. **02-UI-Guideline.md** — Design Source of Truth.
3. **03-Implementation-Plan.md** — Engineering Source of Truth.

Apabila terjadi konflik antar dokumen:

1. PRD menjadi acuan kebutuhan bisnis.
2. UI Guideline menjadi acuan desain antarmuka.
3. Implementation Plan menjadi acuan implementasi teknis.

Perubahan hanya dapat dilakukan melalui proses revisi resmi terhadap dokumen terkait.
