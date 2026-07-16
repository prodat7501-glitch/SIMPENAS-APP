# UI GUIDELINE

# Sistem Informasi Manajemen Perjalanan Dinas (SIMPENAS)

**Versi:** 1.0
**Status:** Design Source of Truth (Design SOT)

---

# 1. Design Philosophy

SIMPENAS dirancang sebagai aplikasi pemerintahan modern dengan pendekatan **Enterprise SaaS**, mengutamakan efisiensi kerja, kemudahan penggunaan, konsistensi visual, dan keterbacaan informasi.

Prinsip utama desain:

- Clean Interface
- Modern Enterprise
- Futuristic SaaS
- High Readability
- Minimal Cognitive Load
- Consistent Design
- Responsive First
- Mobile Friendly
- PWA Ready
- Accessibility Ready

---

# 2. Brand Identity

## Karakter

- Modern
- Professional
- Government
- Clean
- Elegant
- Futuristic

## Brand Color

Primary menggunakan warna Orange sebagai identitas utama aplikasi.

Secondary menggunakan warna abu-abu netral.

Accent menggunakan warna biru sebagai warna informasi.

Success menggunakan hijau.

Danger menggunakan merah.

Warning menggunakan kuning.

---

# 3. Color System

## Primary

- Primary
- Primary Hover
- Primary Active
- Primary Soft

## Neutral

- Background
- Surface
- Card
- Border
- Divider

## Text

- Heading
- Body
- Secondary
- Disabled

## Semantic

- Success
- Warning
- Error
- Info

## Dark Mode

Seluruh warna memiliki pasangan Dark Theme.

---

# 4. Design Tokens

## Color Token

Primary

Primary Hover

Primary Active

Success

Warning

Danger

Info

Background

Surface

Card

Border

Divider

Text Primary

Text Secondary

Muted

Disabled

---

## Radius Token

XS

SM

MD

LG

XL

2XL

3XL

---

## Shadow Token

XS

SM

MD

LG

XL

---

## Animation Token

Fast

Normal

Slow

---

# 5. Typography

Font Family

Inter

Fallback

sans-serif

---

## Heading

H1

H2

H3

H4

H5

H6

---

## Body

Large

Default

Small

Caption

Label

---

## Font Weight

Regular

Medium

SemiBold

Bold

---

# 6. Spacing System

Menggunakan skala 4px.

Token:

4

8

12

16

20

24

32

40

48

64

80

96

---

# 7. Grid System

Desktop

12 Column

Tablet

8 Column

Mobile

4 Column

Container menggunakan max-width.

---

# 8. Layout System

Sidebar

Header

Breadcrumb

Content

Footer

Layout menggunakan App Shell.

---

# 9. Border Radius

Input

Button

Card

Dialog

Drawer

Modal

menggunakan radius yang konsisten.

---

# 10. Elevation

Level 0

Background

Level 1

Card

Level 2

Dropdown

Level 3

Dialog

Level 4

Drawer

Level 5

Floating Panel

---

# 11. Iconography

Menggunakan

Lucide React

Ukuran:

16

18

20

24

32

Semua icon menggunakan stroke.

---

# 12. Illustration

Style

Flat Modern

Minimal

Gradient Soft

Tidak menggunakan ilustrasi kartun.

---

# 13. Dashboard Layout

Dashboard terdiri dari:

Header

Sidebar

Top Navigation

Statistic Card

Chart

Activity

Notification

Shortcut Menu

Quick Action

---

# 14. Navigation

Sidebar Navigation

Top Navigation

Breadcrumb

Context Menu

Dropdown

Command Palette

---

# 15. Component Design System

## Button

Primary

Secondary

Outline

Ghost

Danger

Link

Loading

Disabled

Icon Button

---

## Input

Text

Number

Currency

Textarea

Password

Search

---

## Select

Single

Multiple

Searchable

---

## Checkbox

Default

Checked

Disabled

---

## Radio

Default

Checked

---

## Switch

On

Off

---

## Date Picker

Single Date

Range Date

---

## Upload

Single

Multiple

Preview

Progress

Success

Failed

---

## Badge

Primary

Success

Warning

Danger

Info

Outline

---

## Alert

Success

Danger

Info

Warning

---

## Toast

Success

Error

Info

Warning

---

## Card

Statistic

Information

Preview

Summary

---

## Table

Pagination

Sorting

Searching

Column Filter

Export

Responsive

Sticky Header

Bulk Action

---

## Dialog

Confirmation

Delete

Preview

---

## Drawer

Detail

Form

Preview

---

## Tabs

Horizontal

Vertical

---

## Accordion

Expand

Collapse

---

## Timeline

Approval

Log Aktivitas

---

## Stepper

Workflow

SPJ

Approval

---

# 16. Form Guidelines

Seluruh form menggunakan:

React Hook Form

Zod Validation

Inline Validation

Real Time Validation

Error Message

Helper Text

Placeholder

Label

Required Indicator

---

# 17. UI State

## Button

Default

Hover

Active

Loading

Disabled

---

## Input

Default

Focus

Typing

Readonly

Disabled

Error

---

## Table

Loading

Empty

Data

Error

---

## Upload

Uploading

Success

Failed

---

## Card

Loading

Normal

Empty

---

# 18. Data Visualization

Menggunakan

Recharts

Chart:

Bar

Line

Area

Pie

Donut

Progress

Statistic Card

---

# 19. Feedback

Toast

Alert

Dialog

Confirmation

Skeleton

Progress

Loading Overlay

---

# 20. Animation

Framer Motion

Animation:

Fade

Slide

Scale

Collapse

Accordion

Drawer

Dialog

Micro Interaction

---

# 21. Responsive Guideline

Desktop

≥ 1280

Laptop

1024

Tablet

768

Mobile

390

Semua halaman wajib responsive.

---

# 22. Dark Mode

Menggunakan

next-themes

Seluruh component wajib memiliki:

Light Theme

Dark Theme

---

# 23. Accessibility

Keyboard Navigation

ARIA Label

Focus Ring

Contrast Ratio

Tooltip

Screen Reader Ready

---

# 24. PWA Guideline

Installable

Splash Screen

Offline Cache untuk aset statis

Manifest

App Icon

Shortcut

---

# 25. Printing Guideline

Seluruh dokumen menggunakan:

A4

F4

Portrait

Landscape

Header otomatis

Footer otomatis

Nomor Halaman

Logo KPU

Template Instansi

---

# 26. Design Tokens Mapping

Seluruh komponen wajib menggunakan Design Token.

Tidak diperbolehkan menggunakan warna hardcode.

Tidak diperbolehkan menggunakan spacing hardcode.

Tidak diperbolehkan menggunakan radius hardcode.

---

# 27. Component Mapping

| Business Process | Screen       | Component                 |
| ---------------- | ------------ | ------------------------- |
| BP-01            | Nota Dinas   | Form, Table, Upload       |
| BP-02            | SPT          | Form Dinamis, Table       |
| BP-03            | SPPD         | Form, Date Picker         |
| BP-04            | Laporan      | Editor, Upload, Signature |
| BP-05            | Validasi SPJ | Stepper, Timeline         |
| BP-06            | SPBY         | Form, Preview             |
| BP-07            | Arsip        | Table, Filter             |
| BP-08            | Rekapitulasi | Chart, Table              |

---

# 28. Permission Mapping

Setiap screen wajib mengikuti Role-Based Access Control (RBAC).

Role:

- Administrator
- Supervisor
- Pegawai
- Sub Bagian Keuangan

Menu, tombol aksi, dan data yang ditampilkan harus mengikuti matriks hak akses pada PRD.

---

# 29. Naming Convention

## Component

PascalCase

Contoh:

EmployeeTable

SPPDForm

ApprovalDialog

---

## Hooks

useCamelCase

Contoh:

useAuth

useSPPD

---

## Route

kebab-case

Contoh:

/nota-dinas

/surat-perintah-tugas

/surat-perintah-perjalanan-dinas

---

## Folder

kebab-case

---

# 30. UI Principles

Seluruh UI wajib memenuhi prinsip berikut:

- Consistency
- Simplicity
- Accessibility
- Reusability
- Scalability
- Performance
- Maintainability
- Responsive
- Enterprise Ready
- Government Standard
- PWA Ready
- Print Friendly
- Design Token Driven
- Component Driven
- Source of Truth Driven

---

# Penutup

Dokumen UI Guideline ini merupakan **Design Source of Truth (Design SOT)** untuk SIMPENAS. Seluruh desain antarmuka, komponen, pola interaksi, dan implementasi frontend wajib mengacu pada dokumen ini. Setiap perubahan terhadap desain harus dilakukan melalui proses revisi resmi agar konsistensi sistem tetap terjaga sepanjang siklus pengembangan.
