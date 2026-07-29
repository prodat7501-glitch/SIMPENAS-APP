# IMPLEMENTATION PLAN

# Sistem Informasi Manajemen Perjalanan Dinas (SIMPENAS)

## Engineering Source of Truth (Engineering SOT)

Versi : 1.41 - Flexible SPPD Page 2 Print Pagination

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

Next.js 16

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

| Modul                       | Route                 |
| --------------------------- | --------------------- |
| Dashboard                   | /dashboard            |
| Pegawai                     | /master/pegawai       |
| Akun Pengguna               | /master/akun-pengguna |
| Jabatan                     | /master/jabatan       |
| Unit Kerja                  | /master/unit-kerja    |
| Pangkat                     | /master/pangkat       |
| DIPA                        | /master/dipa          |
| Penandatangan               | /master/penandatangan |
| SBM                         | /master/sbm           |
| Nota Dinas                  | /nota-dinas           |
| SPT                         | /spt                  |
| SPPD                        | /sppd                 |
| Laporan                     | /laporan              |
| Approval                    | /approval             |
| Validasi SPJ dan Pembayaran | /spj                  |
| SPBY                        | /spby                 |
| Daftar Nominatif            | /daftar-nominatif     |
| Tanda Terima                | /tanda-terima         |
| Kuitansi                    | /kuitansi             |
| Arsip SPJ                   | /arsip-spj            |
| Rekapitulasi                | /rekapitulasi         |
| Manajemen Dokumen           | /dokumen              |
| Notifikasi                  | /notifikasi           |
| Log Aktivitas               | /log-aktivitas        |
| Pengaturan                  | /pengaturan           |
| Template Dokumen            | /pengaturan/template  |

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

LampiranCosting (Tarif x Volume = Subtotal)

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

SPTForm (AutoResizeTextarea untuk DynamicField Poin I–III)

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
- Tugas Perjalanan Saya berdasarkan `pegawaiId`

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
- Tugas Perjalanan Saya untuk setiap SPJ aktif

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

- Inisialisasi Next.js 16
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

- Validasi SPJ dan Pembayaran
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

| BP    | Screen                      | Route             | Role/Scope                                                  | Komponen Utama                                                                             |
| ----- | --------------------------- | ----------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| BP-01 | Nota Dinas                  | /nota-dinas       | Admin, Supervisor; Pegawai R scope                          | Form, Auto Login Job Header, Lampiran, Conflict Alert, Preview                             |
| BP-02 | SPT                         | /spt              | Admin, Supervisor, Pegawai scope ND                         | DynamicForm, Split Personil, Table, Bookman Print Preview                                  |
| BP-03 | SPPD                        | /sppd             | Admin, Supervisor, Pegawai scope ND; satu pengelola per SPT | Single Person Form, Automatic Lifecycle, F4 Row-Safe Page 1/2 Preview                      |
| BP-04 | Laporan Perjalanan          | /laporan          | Pegawai scope ND, pemilik rangkaian edit, Supervisor verify | Template Margin, Bookman Print, Manual Signature, Separate Documentation Page, Owner Guard |
| BP-05 | Validasi SPJ dan Pembayaran | /spj              | Unit Keuangan; personel scope ND R                          | Stepper 5 tahap, Personil SPPD, Checklist, Realisasi Biaya per Personel, StatusCard        |
| BP-06 | SPBY                        | /spby             | Unit Keuangan; personel scope ND R                          | Generate per person, Preview                                                               |
| BP-06 | Daftar Nominatif            | /daftar-nominatif | Unit Keuangan; personel scope ND R                          | Collective Table, Preview                                                                  |
| BP-06 | Tanda Terima                | /tanda-terima     | Unit Keuangan; personel scope ND R                          | Generate per person, Preview                                                               |
| BP-06 | Kuitansi                    | /kuitansi         | Unit Keuangan konfirmasi pembayaran; personel scope ND R    | Generate per person, Payment Completion Dialog, Status, Preview                            |
| BP-07 | Manajemen Dokumen           | /dokumen          | Sesuai RBAC; delete Administrator-only                      | Search, Filter, PDF Download                                                               |
| BP-08 | Dashboard                   | /dashboard        | Semua sesuai role dan `pegawaiId`                           | Dashboard Service, Travel Task Panel, Statistic Card, Chart, Audit Activity, Empty State   |
| BP-08 | Rekapitulasi                | /rekapitulasi     | Admin, Supervisor, Keuangan                                 | Chart, Table, Export                                                                       |
| BP-09 | Approval                    | /approval         | Supervisor sesuai jabatan resmi; Admin clear history        | Detail, Decision, Timeline, Confirmed Clear History                                        |
| BP-10 | Notifikasi                  | /notifikasi       | Semua pengguna; personal scope `pegawaiId`                  | Persistent Personal List, Read/Delete, Document Link                                       |

### Personal Travel Task dan Notifikasi

- `travel-task.service.ts` membentuk status dari dokumen Nota Dinas/SPT milik pembuat yang belum selesai serta rantai Nota Dinas Disetujui/Selesai, SPT, SPPD, Laporan, SPJ, dan Pembayaran tanpa menyimpan salinan transaksi.
- `TravelTaskPanel` hanya dirender pada `/dashboard`; tidak ada route atau menu Sidebar baru.
- Notifikasi tugas memakai `recipientPegawaiId` dan `eventKey` agar terisolasi per pegawai serta tidak dibuat berulang pada setiap refresh Dashboard.
- SPPD tetap satu dokumen per orang. SPPD pertama menyimpan pengelola rangkaian untuk `sptId`; pegawai lain dalam SPT yang sama hanya memperoleh aksi lihat/print status.
- Form SPPD memakai `penomoranService.preview()` untuk menampilkan calon nomor berdasarkan konfigurasi SPPD dan nomor existing tanpa menulis riwayat. `sppdService.create()` menerbitkan nomor sebenarnya melalui `requestNumber("SPPD")` hanya setelah payload siap disimpan.
- Nomor dan personel dikeluarkan dari shared fields seri SPT. Sinkronisasi tetap berlaku untuk maksud, transportasi, lokasi, tanggal, DIPA, penandatangan, dan Halaman 2.
- Update SPPD mempertahankan nomor existing. Delete Administrator melepaskan nomor melalui Numbering Service. Aksi penerapan format nomor existing memberikan sequence unik per SPPD dan tidak lagi mengambil sequence dari SPT.
- Migrasi baca tidak menomori ulang dokumen existing secara otomatis; perubahan nomor dokumen lama hanya dilakukan melalui aksi Administrator yang telah tersedia.
- `sppdService` menghitung lifecycle seri tanpa input status dari pengguna: form belum tersimpan adalah Draft, seri parsial Diproses, seluruh personel SPT lengkap menjadi Selesai, dan upload PDF Arsip SPJ mengubah seluruh SPPD pada Nota Dinas sumber menjadi Diarsipkan.
- Route `/laporan` menggunakan `SPPD_REPORT_READY_STATUSES` (`Selesai`, `Diarsipkan`) sebagai guard sumber Laporan dan tidak lagi membaca status approval legacy SPPD.
- Migrasi baca memetakan status approval lama SPPD ke lifecycle baru berdasarkan kelengkapan personel tanpa mengubah data perjalanan atau relasi dokumen.
- `document-access.ts` menyelesaikan pengelola rantai dari `createdByPegawaiId` SPT pertama untuk setiap `notaDinasId`. Resolver yang sama digunakan route SPT, SPPD, dan Laporan agar guard tidak berbeda antarhalaman.
- Sebelum SPT pertama tersimpan, personel pada Nota Dinas Disetujui dapat memulai rangkaian. Setelah itu hanya pengelola `notaDinasId` atau Administrator yang dapat membuat SPT kelompok lanjutan, SPPD individual, dan Laporan; personel lain hanya membaca status/pratinjau.
- Tombol Buat pada ketiga route memakai disabled state apabila tidak ada sumber yang dapat dilanjutkan. SPT hanya dianggap tersedia jika kelompok Sekretariat/Komisioner masih belum terbentuk; SPPD hanya jika masih ada personel SPT tanpa SPPD; Laporan hanya jika seri SPPD lengkap dan belum memiliki Laporan.
- `pengelolaPegawaiId` SPPD tetap disimpan sebagai snapshot kompatibilitas, tetapi nilai baru mengikuti pengelola `notaDinasId`. Supervisor/Kasubbag bukan pemilik tetap dapat membaca sesuai scope, tetapi tidak memperoleh aksi ubah.
- Nota Dinas baru yang Disetujui membentuk scope pengelola baru secara independen dan tidak dikunci oleh rangkaian Nota Dinas sebelumnya.
- `approval-access.ts` mencocokkan sesi pengguna terhadap Master Pegawai dan Master Pejabat Penandatangan melalui NIP/nama. SPT Sekretariat maupun Komisioner dapat diproses Kasubbag hanya jika dirinya merupakan pembuat/penandatangan Nota Dinas sumber; SPT Komisioner juga dapat diproses Ketua KPU.
- Identitas Ketua KPU menggunakan kecocokan penandatangan lebih dahulu dan kategori/jabatan Master Pegawai sebagai fallback untuk record penandatangan lama yang masih memakai nama jabatan generik; role aplikasi tetap wajib Supervisor.
- `approvalService.listPending()` dan `travel-task.service.ts` menggunakan resolver akses yang sama, sehingga dokumen Menunggu Approval tampil langsung pada `/approval` dan menjadi tugas Dashboard bagi Ketua KPU maupun Kasubbag sumber tanpa menjadikan Dashboard sebagai pemicu data.
- `approvalService.listPending(user)` memfilter dokumen langsung dari status Menunggu Approval saat route `/approval` dibuka; query memakai `refetchOnMount: always` sehingga Dashboard tidak menjadi pemicu data.
- `travel-task.service.ts` membentuk tugas `NOTA_DINAS_MENUNGGU_APPROVAL` bagi Sekretaris/PLH/PLT yang berwenang walaupun pejabat tersebut tidak tercantum sebagai personel Nota Dinas.
- `travel-task.service.ts` membentuk tugas pembuat berdasarkan `createdByPegawaiId`/snapshot penandatangan untuk status Draft/Nomor Diambil, Menunggu Approval, dan Perlu Revisi; catatan revisi dimasukkan ke deskripsi tugas serta notifikasi personal.
- Untuk role Sub Bagian Keuangan, `travel-task.service.ts` memetakan seluruh hasil rekonsiliasi Laporan Terverifikasi menjadi satu tugas per `spj.id`; tahap SPJ Diterima/Validasi mengarah ke `/spj`, Validasi Selesai ke `/spby`, dan Proses Pembayaran ke `/kuitansi`. Pembayaran Selesai tidak lagi dihitung sebagai tugas aktif.
- `SPJ Diterima` dengan `catatan` non-kosong diturunkan sebagai state tampilan `SPJ_PERLU_DILENGKAPI` tanpa menambah status schema. `useKeuangan` mengirim notifikasi ber-`recipientPegawaiId` kepada seluruh personel SPT, sedangkan tabel dan dialog `/spj` menampilkan catatan secara read-only bagi pelaksana.
- Pencocokan approval Nota Dinas mengevaluasi seluruh pejabat aktif pada prioritas tertinggi. Record dengan prioritas sama tidak saling menutupi; identitas sesi dicocokkan melalui NIP/nama, dengan fallback Master Jabatan Sekretaris untuk kompatibilitas record lama bernama generik.
- Keputusan Perlu Revisi menyimpan `catatanRevisi` pada Nota Dinas/SPT dan membuat notifikasi persisten dengan `recipientPegawaiId` pembuat dokumen.
- Implementasi mock menggunakan localStorage untuk data ringan serta IndexedDB untuk Laporan beserta dokumentasi dan Arsip SPJ. Data baru menjadi sinkron lintas perangkat setelah service diganti Backend API/database terpusat.

## Screen Pendukung

| Proses Pendukung | Route                | Role                                | Tujuan                                                                                           |
| ---------------- | -------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| Authentication   | /login               | Semua                               | Login individual dengan username/password; role dan identitas diturunkan dari Master Pegawai     |
| Master Data      | /master/*            | Administrator                       | Referensi pegawai, akun pengguna, jabatan, unit, pangkat, DIPA hierarkis, SBM, dan penandatangan |
| Penomoran        | /pengaturan          | Administrator; Supervisor read-only | Format, Nomor Berikutnya, booking, release, riwayat, actual-number preview                       |
| Template         | /pengaturan/template | Administrator                       | Konfigurasi provider dokumen bersama                                                             |
| Audit            | /log-aktivitas       | Administrator                       | Riwayat aktivitas penting, confirmed clear, dan self-audit pembersihan                           |

### Aturan Pembersihan Riwayat

- Tombol **Bersihkan Riwayat Approval** dan **Bersihkan Log Aktivitas** hanya dirender jika role sesi adalah Administrator dan permission `D` tersedia.
- Service Approval dan Activity Store memvalidasi ulang role Administrator sebelum mengubah localStorage.
- Pembersihan Riwayat Approval hanya mengosongkan `simpenas_approval_history`; Nota Dinas dan SPT beserta statusnya tidak diubah.
- Setiap pembersihan memerlukan konfirmasi eksplisit dan mencatat jumlah data yang dibersihkan.
- Pembersihan Log Aktivitas menyimpan kembali satu entri audit pembersihan agar aksi administratif tetap dapat ditelusuri.

### Guard Penghapusan Dokumen

- `useAuth.hasPermission(module, "D")` mengembalikan `true` hanya untuk role Administrator pada Nota Dinas, SPT, SPPD, Laporan Perjalanan Dinas, SPBY, Daftar Nominatif, Tanda Terima, dan Kuitansi.
- Komponen tabel memisahkan permission `canEdit` dan `canDelete`; hak ubah tidak boleh menyebabkan tombol hapus ikut tampil.
- Handler penghapusan memeriksa kembali `canDelete` sebelum konfirmasi dan mutasi data.
- Administrator dan Sub Bagian Keuangan memperoleh akses baca serta upload/ganti PDF pada `/arsip-spj`; role lainnya tidak memperoleh akses modul tersebut.
- `DokumenKeuanganPage` menampilkan tombol hapus pada setiap dokumen hanya ketika sesi ber-role Administrator.
- `keuanganService.removeDocument(documentId)` menolak penghapusan dokumen induk yang masih dipakai dokumen turunan, menghapus hanya dokumen terpilih dari SPJ, dan mengembalikan nomor SPBY melalui Numbering Service.
- `useKeuangan` melakukan invalidasi query serta mencatat audit `Delete` setelah penghapusan berhasil.

### Aturan Reservasi Nomor Nota Dinas

- Field konfigurasi menggunakan semantik **Nomor Berikutnya**: nilai `1` menerbitkan `001`, lalu service menyimpan `2` sebagai kandidat berikutnya.
- Nomor aktual yang akan diterbitkan ditampilkan pada kartu dan form pengaturan setelah memperhitungkan Booking aktif dan dokumen existing.
- Saat tidak ada Nota Dinas atau saat Administrator menyimpan konfigurasi Nota Dinas, seluruh riwayat `Terpakai` yang tidak memiliki nomor dokumen sumber diubah menjadi `Dibatalkan`.
- Rekonsiliasi tidak mengubah riwayat `Booking`; pembatalannya tetap melalui aksi manual Administrator.
- `requestNumber("Nota Dinas")` memeriksa apakah reservasi nomor aktif sebelumnya sudah tercantum pada Nota Dinas tersimpan sebelum membuat reservasi baru.
- Nomor yang baru diambil pada form dan belum disimpan dilepas melalui `releaseNumber()` ketika dialog dibatalkan.
- Riwayat `Terpakai` yang belum mempunyai Nota Dinas tersimpan dianggap sebagai reservasi aktif dan memblokir permintaan berikutnya sampai disimpan atau dibatalkan.
- Pengecualian recovery: apabila penyimpanan Nota Dinas benar-benar kosong, satu riwayat `Terpakai` tanpa dokumen direkonsiliasi menjadi `Dibatalkan`, lalu nomor yang sama diambil kembali melalui mekanisme reusable number.
- Setelah Nota Dinas tersimpan, nomor berikutnya dapat diambil meskipun dokumen masih berstatus `Nomor Diambil`, `Menunggu Approval`, atau `Perlu Revisi`.
- Nomor yang sudah tersimpan tidak dilepas ketika dialog edit ditutup; nomor dilepas hanya ketika aksi hapus Nota Dinas benar-benar dijalankan.
- Booking nomor Administrator tidak dianggap sebagai transaksi Nota Dinas menunggu approval dan tetap mengikuti mekanisme booking yang sudah ada.

### Aturan Reservasi Nomor SPT

- Halaman SPT menyimpan nomor yang baru diambil pada state `pendingNumber` selama form pembuatan baru masih terbuka.
- Tombol Batal, tombol silang dialog, dan penutupan melalui overlay memanggil satu handler yang sama untuk melepaskan `pendingNumber` melalui `releaseNumber("SPT")`.
- Penyimpanan SPT yang berhasil membersihkan `pendingNumber` tanpa melepaskan nomor karena nomor tersebut sudah terikat pada dokumen tersimpan.
- Alur **Simpan & Lanjut SPT Komisioner** mengikat nomor SPT pertama, mengosongkan field nomor, lalu membuat reservasi independen untuk SPT berikutnya.
- Tombol Ambil dinonaktifkan setelah field nomor terisi agar satu form tidak membuat lebih dari satu reservasi.
- Permintaan nomor baru memblokir jika masih ada riwayat `Terpakai` yang belum mempunyai SPT sumber. Migrasi satu kali merekonsiliasi reservasi yatim yang terbentuk sebelum aturan lifecycle ini diterapkan.
- Rekonsiliasi hanya mengubah riwayat `Terpakai`; nomor `Booking` Administrator tidak disentuh dan tetap dibatalkan secara manual.
- Menutup form edit tidak melepaskan nomor karena nomor tersebut sudah merupakan bagian dari SPT tersimpan.
- Penghapusan SPT oleh Administrator memanggil `sptService.releaseNomor()` tanpa membatasi status dokumen, kemudian menghapus record SPT dari store.
- Rekonsiliasi versi terbaru dijalankan satu kali untuk membatalkan riwayat `Terpakai` yang tidak lagi mempunyai SPT sumber akibat penghapusan lama; riwayat `Booking` tetap dipertahankan.

### Aturan Penomoran Dokumen Keuangan

- `DocumentType` mencakup SPBY, Daftar Nominatif, Tanda Terima, dan Kuitansi sehingga setiap jenis memakai Numbering Service yang sama dengan konfigurasi independen.
- Konfigurasi lama di localStorage digabung dengan default terbaru saat dibaca. Tiga jenis dokumen baru otomatis memperoleh kartu pengaturan tanpa menghapus atau menimpa konfigurasi lama.
- Format default mempertahankan pola existing: `{RUNNING}/{PREFIX}/{YEAR}{SUFFIX}` dengan padding tiga digit serta prefix khusus setiap jenis dokumen.
- `keuanganService` memanggil `requestNumber(jenis)` ketika dokumen berhasil di-generate. Dokumen individual memperoleh nomor berurutan per orang, sedangkan Daftar Nominatif memperoleh satu nomor kolektif.
- Nomor Berikutnya dihitung dari nilai konfigurasi, riwayat aktif/Booking, dan urutan tertinggi dokumen existing pada jenis serta tahun yang sama.
- Dokumen existing mempertahankan nomor tersimpan. Perubahan format hanya berlaku pada generate berikutnya kecuali tersedia aksi migrasi existing yang secara eksplisit disetujui Administrator.
- Buat Ulang SPBY mempertahankan ID, nomor, dan tanggal dokumen sebelumnya.
- Penghapusan dokumen keuangan yang lolos dependency guard melepaskan nomor melalui Numbering Service. Pembersihan SPJ yatim juga melepaskan seluruh nomor dokumen keuangan dalam rantai tersebut.
- Halaman Pengaturan menampilkan tujuh kartu konfigurasi serta menyediakan booking, pembatalan booking, dan riwayat untuk seluruh jenis dokumen bernomor.

### Aturan Header Nota Dinas Baru

- Halaman Nota Dinas menyelesaikan `user.pegawaiId` ke Master Pegawai, kemudian `pegawai.jabatanId` ke Master Jabatan.
- Komponen form menerima nama jabatan hasil pemetaan sebagai nilai `Dari`, menampilkannya dalam keadaan hanya-baca, dan tidak menyediakan fallback jabatan buatan apabila master belum lengkap.
- Nilai awal `Kepada` adalah **Sekretaris KPU Kabupaten Gorontalo** dan tetap dapat diedit sesuai kebutuhan surat.
- Ketika mengubah dokumen lama, nilai `Dari` dan `Kepada` yang tersimpan tetap dipertahankan sebagai snapshot dokumen.

### Aturan Penandatangan Nota Dinas

- Akun login diselesaikan melalui `user.pegawaiId`; pencocokan ke Master Pejabat Penandatangan menggunakan NIP sebagai identitas utama dan nama sebagai fallback kompatibilitas data mock.
- Kandidat wajib berstatus aktif, dipetakan ke jenis dokumen Nota Dinas, dan memiliki peran Kepala Sub Bagian/Kasubbag.
- Form hanya menampilkan identitas penandatangan dalam field hanya-baca. Dropdown pemilihan penandatangan tidak tersedia.
- Nilai `penandatanganId` ditetapkan ulang secara otoritatif saat submit agar tidak dapat diganti melalui manipulasi field tersembunyi.
- Jika akun belum terhubung atau periode jabatan tidak berlaku pada tanggal dokumen, penyimpanan Nota Dinas baru diblokir dengan validasi inline.
- Saat dokumen lama diedit, `penandatanganId` dan `penandatanganSnapshot` asal dipertahankan untuk menjaga integritas dokumen.
- Nilai tanggal transaksi tetap disimpan sebagai string ISO, sedangkan preview/cetak Nota Dinas memformatnya dengan locale `id-ID` menjadi `DD NamaBulan YYYY`.

### Aturan Tujuan Approval Nota Dinas

- `resolveNotaDinasApprover()` menjadi resolver tunggal tujuan pengiriman approval berdasarkan Master Pejabat Penandatangan.
- Kandidat wajib berstatus Aktif, berada dalam periode tanggal Nota Dinas, mempunyai peran Sekretaris KPU/PLH Sekretaris/PLT Sekretaris, serta dipetakan ke SPT atau Nota Dinas.
- PLT. Sekretaris aktif diprioritaskan di atas PLH. Sekretaris, sedangkan pengganti aktif diprioritaskan di atas Sekretaris reguler. Pada peran yang sama, periode dengan `berlakuMulai` terbaru dipilih.
- Label pilihan status menggunakan `Kirim ke Sekretaris`, `Kirim ke PLH. Sekretaris`, atau `Kirim ke PLT. Sekretaris` sesuai hasil resolver.
- Form menampilkan nama dan jabatan pejabat approval aktif sebagai informasi, sedangkan notifikasi serta log aktivitas menggunakan tujuan yang sama.
- Jika tidak ada kandidat aktif, label fallback menyebut `Sekretaris/PLH/PLT Sekretaris` dan form memberi informasi bahwa Administrator perlu melengkapi konfigurasi.

### Aturan Scroll dan Potensi Perjalanan Ganda Nota Dinas

- Dialog Nota Dinas menggunakan container `flex` dengan batas tinggi viewport; area body menggunakan `min-height: 0` dan `overflow-y: auto` agar tombol aksi di bagian bawah tetap dapat dijangkau.
- Pemeriksaan benturan tetap dilakukan terhadap Nota Dinas Disetujui/Selesai dan tidak memblokir penyimpanan.
- `NotaDinas.travelConflicts` menyimpan snapshot `pegawaiId`, referensi/nomor Nota Dinas yang berbenturan, rentang tanggal, dan lokasi ketika form disimpan.
- Snapshot dinormalisasi menjadi array kosong untuk data lama dan dihitung ulang pada setiap penyimpanan sehingga penanda lama dapat hilang setelah benturan tidak lagi ditemukan.
- Peringatan inline, toast, serta notifikasi benturan menggunakan severity error/danger. Tabel Nota Dinas memberi latar merah lembut, label **Potensi Ganda**, dan daftar nama personel yang terdampak.
- `formatTableDate()` dan `formatTableDateTime()` pada `src/lib/formatters.ts` menjadi formatter bersama untuk tanggal tabel. Data ISO tetap dipertahankan di schema dan service.

### Aturan Kalkulasi Lampiran Nota Dinas

- `nota-dinas-calculation.ts` menjadi satu-satunya sumber kalkulasi biaya lampiran untuk form, preview Nota Dinas, detail Approval, dan dokumen keuangan.
- `volume` merepresentasikan durasi perjalanan sebagai informasi referensi dan tidak digunakan sebagai multiplier otomatis komponen biaya.
- Setiap komponen memakai volume bilangan bulat minimum 0 miliknya sendiri: `volumeUangHarian`, `volumeUangHarianPaketMeeting`, `volumeUangHarianFull`, `volumeUangTransport`, `volumePenginapan`, `volumeTiketPesawat`, `volumeTransportBandaraAsal`, dan `volumeTransportBandaraTujuan`.
- Kalkulator memilih komponen sesuai jenis perjalanan: Dalam Kota memakai Uang Harian dan Transport; Luar Kota menambah Penginapan; Luar Daerah memakai Meeting, Full, Transport, Penginapan, Tiket, serta Transport Bandara Asal/Tujuan.
- Saat personel dipilih, form memberi nilai awal berdasarkan aturan umum sebagai bantuan input. Seluruh nilai awal dapat diedit dan tidak disinkronkan otomatis ketika durasi berubah.
- Seluruh volume tidak saling mengunci, tidak memiliki batas maksimum aplikasi, dan tidak divalidasi harus berjumlah sama dengan `volume`.
- Form menampilkan tarif, multiplier/volume, dan subtotal setiap komponen. Preview/cetak hanya menampilkan komponen dengan subtotal lebih dari nol.
- Nota Dinas lama yang belum memiliki volume per komponen dinormalisasi menggunakan rumus sebelumnya: Uang Harian/Meeting dan Transport mengikuti `volume`, Penginapan Luar Kota mengikuti `volume`, Penginapan Luar Daerah memakai `max(volume - 1, 0)`, Tiket serta Bandara Asal/Tujuan memakai `2`, dan Full yang belum tersedia memakai `0`. Dengan demikian nilai historis tidak berubah ketika data dimuat.
- Lampiran Nota Dinas adalah nilai usulan. Kalkulator Nota Dinas tidak menjadi sumber otomatis bagi komponen biaya berbasis bukti pada dokumen keuangan.
- Query dokumen keuangan tetap memasukkan signature total Nota Dinas agar perubahan Uang Harian sebagai komponen yang terkunci dari Nota Dinas dapat memicu rekonsiliasi.

### Aturan Realisasi Biaya SPJ

- Setiap `Spj` menyimpan `realisasiBiaya` per personel dengan referensi `pegawaiId`, `notaDinasId`, dan `lampiranIndex`.
- Komponen yang diinput Unit Sub Bagian Keuangan adalah `tiketPesawat`, `transportBandaraAsal`, `transportBandaraTujuan`, `uangTransportHarian`, dan `penginapan` sebagai subtotal realisasi berdasarkan bukti SPJ.
- Uang Harian Paket Meeting dan Uang Harian Full tidak dapat diedit pada Validasi SPJ; keduanya dihitung dari Nota Dinas yang disetujui.
- Form Validasi SPJ menampilkan nilai usulan Nota Dinas sebagai pembanding di bawah setiap input realisasi, tanpa menyalinnya otomatis sebagai nilai pembayaran.
- Setiap baris personel memiliki flag `diverifikasi`. Aksi **Validasi Selesai** dan generator dokumen keuangan menolak proses jika terdapat personel yang belum diverifikasi.
- `RincianKeuangan` menyimpan subtotal terpisah untuk Uang Harian Paket Meeting, Uang Harian Full, Transport Harian, Penginapan, Tiket Pesawat, Transport Bandara Asal, dan Transport Bandara Tujuan.
- `keuanganService` membentuk total pembayaran dari Uang Harian Nota Dinas ditambah lima komponen realisasi SPJ. SPBY, Daftar Nominatif, Tanda Terima, dan Kuitansi membaca snapshot rincian keuangan tersebut.
- Data SPJ lama dinormalisasi dengan baris realisasi bernilai 0 dan `diverifikasi: false`. Dokumen lama tidak ditimpa hingga realisasi seluruh personel selesai diverifikasi.

### Aturan Sumber Anggaran dan Realisasi DIPA

- `dipaFormSchema` hanya menerima Kode KRO, KRO, Kode Akun, Akun Perjalanan Dinas, Pagu Anggaran, dan Tahun Anggaran; `realisasi` menjadi nilai turunan read-only.
- `keuanganService` mengagregasi Realisasi DIPA dari dokumen Kuitansi yang berstatus Selesai dan memiliki snapshot pembayaran, dikelompokkan berdasarkan `dipaId`; dokumen lama tanpa `dipaId` memakai fallback tahun dan `mak`/Kode Akun DIPA.
- Nota Dinas menyimpan `dipaId` sebagai referensi sumber anggaran. Data lama dinormalisasi dengan nilai kosong dan wajib memilih DIPA ketika disimpan ulang.
- Helper kalkulasi pagu menjumlahkan Nota Dinas lain pada sumber yang sama dengan status Menunggu Approval, Disetujui, Perlu Revisi, atau Selesai; dokumen yang sedang diedit dikecualikan dari komitmen lain.
- Form menampilkan sisa pagu secara reaktif. Handler halaman memvalidasi ulang sehingga Nota Dinas yang melampaui pagu tidak dapat berstatus Menunggu Approval meskipun validasi UI dilewati.
- SPPD mewarisi `dipaId` dari Nota Dinas sumber melalui SPT; pilihan manual hanya menjadi fallback untuk data lama yang belum memiliki sumber DIPA.
- Preview Nota Dinas menyelesaikan `dipaId` ke `kodeDipa` dan menampilkannya pada baris sumber anggaran di bawah judul lampiran.

### Export Data Excel Tabel Transaksi

- Utilitas ekspor bersama membentuk workbook Excel-compatible `.xls` dari definisi kolom dan baris, mempertahankan nomor dokumen/NIP sebagai teks serta nominal sebagai nilai numerik berformat Rupiah.
- Halaman Nota Dinas, SPT, dan SPPD mengekspor dataset yang sama dengan scope tabel aktif; pengguna diminta mengisi nama file sebelum unduhan.
- Aksi Export dicatat melalui Audit Service dan tombol dinonaktifkan ketika dataset kosong.

### Rekap Pegawai Dashboard

- `dashboardService` membentuk agregasi seluruh Master Pegawai satu kali. Administrator menerima seluruh hasil, sedangkan role lain hanya menerima baris yang `pegawaiId`-nya cocok dengan sesi aktif; nama akun hanya menjadi fallback kompatibilitas ketika relasi ID lama belum tersedia.
- Jumlah Hari SPPD dijumlahkan dari `lamaPerjalanan` SPPD tahun berjalan per `pegawaiId`.
- Jumlah Yang Dibayarkan dijumlahkan dari rincian Kuitansi berstatus Selesai yang memiliki snapshot pembayaran tahun berjalan per `pegawaiId`.
- Komponen tabel dashboard memakai mode seluruh pegawai untuk Administrator dan mode personal untuk akun lain, menampilkan nilai nol serta tanda `-` untuk NIP yang tidak tersedia tanpa mengubah data master.

### Rekapitulasi Pembayaran Personal

- Route `/rekapitulasi` memanggil `useKeuangan` dengan konteks SPPD, SPT, Nota Dinas, dan DIPA yang sama dengan modul keuangan agar rekonsiliasi dokumen memakai rantai aktif.
- Query Keuangan pada Rekapitulasi dan Arsip Dokumen hanya diaktifkan setelah query Laporan/SPPD selesai dimuat. Array kosong pada render awal tidak boleh diperlakukan sebagai penghapusan rantai sumber.
- `buildRekap()` mencocokkan Kuitansi individual melalui `pegawaiId` dan prioritas relasi `document.sppdId`, `document.sptId`, SPT dari `document.sppdId`, SPT dari `spj.sppdId`, lalu `notaDinasId`. Kandidat dengan snapshot pembayaran selesai diprioritaskan tanpa menjumlahkan dokumen duplikat.
- Nominal Pembayaran Selesai berasal dari `rincian.jumlah` Kuitansi berstatus Selesai yang memiliki `pembayaran`, sedangkan bulan pembayaran mengikuti `tanggalPembayaran`.
- Migrasi dokumen menormalkan Kuitansi yang memiliki snapshot `pembayaran` menjadi status Selesai. Pembuatan ulang dokumen existing mempertahankan status dan snapshot pembayaran agar Rekapitulasi tidak kembali menjadi nol.
- Untuk role Pegawai, effective filter selalu memakai `user.pegawaiId` yang diselesaikan ke Master Pegawai. UI menampilkan nama sendiri sebagai field hanya-baca dan tidak merender dropdown seluruh pegawai.
- Dataset scope yang sama digunakan kartu, grafik, tabel, preview print, dan export sehingga filter UI tidak dapat membuka data pegawai lain.

### Page Setup Bersama Dokumen Perjalanan dan Keuangan

- `PrintPageSetup` menjadi komponen reusable untuk menyisipkan metadata ukuran kertas, meniadakan margin fisik `@page`, dan memusatkan lembar secara horizontal. Prop `lockPrintScale` tetap aktif untuk dokumen umum, sedangkan SPPD Halaman 2 menonaktifkannya agar skala mengikuti pilihan pengguna pada dialog printer.
- Nota Dinas memanggil page setup A4 portrait (`210mm 297mm`). SPT Sekretariat, SPT Komisioner, SPPD Halaman 1/2, dan Laporan memanggil F4 portrait (`215mm 330mm`).
- `DokumenPreview` memakai F4 portrait untuk SPBY, Tanda Terima, dan Kuitansi, serta F4 landscape untuk Daftar Nominatif.
- Margin dari Template Provider disimpan dalam custom property `--document-print-padding` dan diterapkan sebagai padding internal kontainer. Dengan demikian metadata ukuran kertas tetap sesuai ukuran fisik dan tidak memicu scale-to-fit.
- `PrintPreview` merender `PrintPageSetup` setelah aturan print umum agar page setup dokumen menjadi aturan terakhir yang deterministik pada development maupun production.
- `SppdPreview` membungkus header/Romawi I, setiap blok Romawi manual, blok Romawi terakhir/PPK, dan catatan/perhatian sebagai kelompok `break-inside: avoid-page`; blok yang tidak muat dipindahkan utuh ke halaman berikutnya.
- Tinggi blok tanda tangan manual tidak lagi dibagi untuk memenuhi tinggi satu lembar. Kontainer isi memakai minimum area tanda tangan dan membesar secara natural ketika teks jabatan/lokasi membungkus.
- CSS hanya dapat memberikan metadata ukuran kertas kepada dialog printer; pilihan sumber tray tetap mengikuti dukungan dan konfigurasi driver printer pengguna.

### Aturan Layout Cetak Dokumen Keuangan

- `PrintPreview` menerima `printPageSize` dan merender aturan `@page` biasa pada media print; implementasi tidak bergantung pada CSS-in-JS untuk metadata ukuran kertas.
- `DokumenPreview` memilih F4 portrait (`215mm 330mm`) untuk SPBY, Tanda Terima, dan Kuitansi serta F4 landscape (`330mm 215mm`) untuk Daftar Nominatif.
- Layout kritis dokumen keuangan ditempatkan pada `globals.css` agar tersedia sebelum `window.print()` dan konsisten pada development maupun production build.
- SPBY memakai fixed-height sheet, grid tanda tangan tiga kolom, auto-scale nama satu baris, dan helper klasifikasi penerima untuk menentukan visibilitas NIP.
- Daftar Nominatif menghitung skala berdasarkan jumlah personel, jumlah kolom nominal, serta panjang nama; hasil tetap dikunci pada satu lembar F4 landscape.
- Tanda Terima memakai tinggi baris biaya yang identik pada kolom Perincian dan Jumlah sehingga bullet, perkalian, dan nominal tetap sejajar.
- `keuangan-document-description.ts` menjadi formatter tunggal uraian SPBY, Daftar Nominatif, Tanda Terima, dan Kuitansi. Formatter menormalisasi whitespace, mempertahankan maksud sumber, mendeteksi konteks lokasi/durasi/tanggal yang sudah ada, lalu hanya menambahkan konteks yang belum tersedia.
- Referensi SPT/SPD ditambahkan oleh formatter hanya jika nomor referensinya belum tercantum pada uraian.
- Kolom Perincian dan Jumlah Tanda Terima menggunakan lebar tetap yang lebih besar untuk nominal; nominal satuan, per komponen, dan total menggunakan angka tabular, `white-space: nowrap`, serta auto-scale.
- Kuitansi memakai fixed-height F4 satu halaman tanpa border luar; `tanggalPembayaran` dibaca dari snapshot konfirmasi pembayaran dan tidak menggunakan tanggal dokumen sebagai fallback.

### Aturan Urutan Tampilan Pegawai

- `pegawai-order.ts` menjadi satu-satunya comparator urutan pegawai untuk UI dan preview dokumen.
- Prioritas struktur: Ketua KPU, Anggota KPU, Sekretaris/Kepala Sekretariat, Kepala Sub Bagian/Kasubbag, kemudian Staf atau jabatan lainnya.
- Untuk kelompok Ketua, Anggota, Sekretaris, dan Kepala Sub Bagian, Golongan diurutkan menurun lalu nama.
- Khusus Staf, format Golongan `I/a` sampai `IV/d` diklasifikasikan sebagai PNS dan ditampilkan lebih dahulu dengan urutan menurun.
- Staf dengan Golongan utuh `I` sampai `XI` tanpa subgolongan diklasifikasikan sebagai PPPK, ditempatkan setelah seluruh Staf PNS, dan diurutkan dari `XI` ke `I`.
- Golongan PNS/PPPK yang sama menggunakan nama alfabetis sebagai pembanding akhir; nilai kosong atau format lain ditempatkan setelah PPPK.
- Ketua dan Anggota KPU yang tidak memiliki Pangkat/Golongan tetap ditempatkan berdasarkan kategorinya; nama menjadi pembanding akhir.
- `usePegawai` mengembalikan salinan terurut tanpa mengubah urutan atau isi data pada localStorage.
- Daftar referensi seperti `personil`, `lampiran`, dan `rincian` diurutkan saat ditampilkan menggunakan ID pegawai dan tidak mengubah relasi, nomor, status, maupun workflow dokumen.

### Kontrak Data Master Anggaran DIPA

- `DipaFormData` menyimpan Kode KRO, Klasifikasi Rincian Output (KRO), Kode Akun, Akun Perjalanan Dinas, Pagu, Realisasi, dan Tahun Anggaran.
- `DIPA` menambahkan `id`, `kodeDipa`, dan alias kompatibilitas `program`; `kodeDipa` selalu dibentuk service/store dari gabungan Kode KRO serta Kode Akun, bukan diketik pada field terpisah.
- `dipa.service.ts` memigrasikan data localStorage lama ke Kode KRO, KRO, Kode Akun, dan Akun Perjalanan Dinas tanpa mengganti ID dan nilai finansial existing.
- `DIPAForm` menggunakan React Hook Form, Zod, komponen Input/Button reusable, layout responsif, dan dialog scrollable.
- `DIPATable` menampilkan `kodeDipa` (`Kode KRO.Kode Akun`) pada satu kolom Kode Akun; KRO dan Akun Perjalanan Dinas tetap menjadi kolom uraian terpisah. Pilihan SPPD dan dokumen keuangan menggunakan kode gabungan yang sama.
- Public field `kodeDipa`, `program`, `pagu`, `realisasi`, dan `tahunAnggaran` dipertahankan secara internal agar pemakai existing pada SPPD, dashboard, dan dokumen keuangan tetap kompatibel.

## Implementation Gap Register - 17 Juli 2026

Daftar berikut adalah deviasi implementasi mock terhadap PRD 1.1. Item ini bukan perubahan workflow baru dan harus ditangani pada sprint terpisah.

| ID           | Ketentuan PRD 1.1                                          | Kondisi Implementasi Saat Audit                                                                                                                                                      | Status |
| ------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| GAP-AUTH-01  | Setiap pegawai memiliki akun individual                    | Akun mock dibuat per `pegawaiId`; username unik, role otomatis dari Master Pegawai, login tanpa pemilih role, dan pengelolaan akun dibatasi Administrator                            | Fixed  |
| GAP-APR-01   | Approval Nota Dinas dibatasi Sekretaris/PLT/PLH Sekretaris | Service approval memvalidasi identitas sesi terhadap pejabat aktif dan periode berlaku                                                                                               | Fixed  |
| GAP-APR-02   | Approval SPT mengikuti kelompok dan jabatan approver       | Service memvalidasi Ketua/Sekretaris; Ketua dan Kasubbag sumber dapat memproses SPT Komisioner, sedangkan kewenangan Kasubbag dibatasi pada Nota Dinas yang dibuat/ditandatanganinya | Fixed  |
| GAP-RBAC-01  | Pegawai hanya melihat Nota Dinas/arsip dalam scope ND      | Scope sudah diterapkan pada SPT, SPPD, Laporan, dan SPJ; halaman Nota Dinas serta Arsip belum konsisten                                                                              | Open   |
| GAP-RBAC-02  | Validasi hanya oleh pegawai Unit Sub Bagian Keuangan       | Fallback mock masih mengizinkan role Keuangan ketika profil pegawai tidak dapat di-resolve                                                                                           | Open   |
| GAP-SPPD-01  | Penandatangan SPPD selalu PPK                              | Preview Komisioner melakukan fallback PPK, tetapi form/service belum memvalidasi PPK untuk seluruh kategori                                                                          | Open   |
| GAP-ARSIP-01 | Arsip memuat seluruh dokumen utama                         | Halaman arsip saat audit belum memasukkan Nota Dinas dan SPT pada daftar unduhan                                                                                                     | Open   |

---

# BAB 28. Engineering Checklist

Checklist berikut menjadi acuan progres implementasi.

---

## Foundation

- [x] Next.js 16
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
- [x] DIPA
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

- [x] Validasi SPJ dan Pembayaran
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
- `/arsip-spj`
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

arsip-spj

rekapitulasi
```

---

## E. Transfer Data Demo Sementara

Implementasi sementara sebelum Backend API dan database terpusat tersedia:

- Route: `/pengaturan`.
- RBAC: komponen transfer hanya dirender untuk role `Administrator`.
- Modul: `src/modules/demo-data` memisahkan schema, service, dan komponen UI.
- Format paket: JSON berversi dengan identitas `SIMPENAS_DEMO_DATA`.
- Sumber paket: seluruh key localStorage SIMPENAS selain `simpenas-auth-storage`, Laporan beserta dokumentasi pada IndexedDB, serta file PDF Arsip SPJ pada IndexedDB.
- Import: parse dan validasi seluruh paket lebih dahulu, buat snapshot data lama, ganti localStorage dan kedua kelompok data IndexedDB, lalu rollback apabila salah satu operasi gagal.
- Keamanan sesi: sesi aktif dan cookie tidak diekspor; import yang berhasil menghapus sesi aktif dan mengarahkan pengguna ke login.
- Batas arsitektur: transfer menghasilkan salinan lokal dan tidak menyediakan sinkronisasi multiuser secara real time.
- Exit criteria: hapus/nonaktifkan komponen dan service transfer setelah persistence produksi berpindah ke Backend API dan database terpusat.

---

## F. Referensi Dokumen

Implementasi wajib mengacu pada:

1. **01-PRD.md** — Business Source of Truth.
2. **02-UI-Guideline.md** — Design Source of Truth.
3. **03-Implementation-Plan.md** — Engineering Source of Truth.

Apabila terjadi konflik antar dokumen:

1. PRD menjadi acuan kebutuhan bisnis.
2. UI Guideline menjadi acuan desain antarmuka.
3. Implementation Plan menjadi acuan implementasi teknis.

Perubahan hanya dapat dilakukan melalui proses revisi resmi terhadap dokumen terkait.
