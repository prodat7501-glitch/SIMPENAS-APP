# Product Requirement Document (PRD)

# Sistem Informasi Manajemen Perjalanan Dinas (SIMPENAS)

**Versi Dokumen:** 1.0
**Status:** Draft – Phase 1 (Bagian 1–4)
**Client:** Komisi Pemilihan Umum Kabupaten Gorontalo

---

# 1. Executive Summary

## 1.1 Latar Belakang

Komisi Pemilihan Umum Kabupaten Gorontalo secara rutin melaksanakan kegiatan perjalanan dinas dalam rangka koordinasi, rapat kerja, bimbingan teknis, supervisi, monitoring, evaluasi, dan kegiatan kedinasan lainnya.

Proses administrasi perjalanan dinas saat ini masih banyak dilakukan secara manual, mulai dari penyusunan Nota Dinas, Surat Perintah Tugas (SPT), Surat Perintah Perjalanan Dinas (SPPD), penyusunan laporan perjalanan dinas, hingga dokumen pertanggungjawaban keuangan. Kondisi tersebut menyebabkan proses menjadi lebih lambat, berpotensi terjadi duplikasi data, kesalahan penomoran dokumen, kesulitan pelacakan status, serta membutuhkan waktu yang lebih lama dalam penyusunan laporan dan arsip.

Untuk meningkatkan efisiensi, akurasi, transparansi, dan kemudahan pengelolaan administrasi perjalanan dinas, diperlukan sebuah aplikasi berbasis web yang terintegrasi dan mendukung proses bisnis secara menyeluruh.

---

## 1.2 Tujuan Pengembangan

Sistem ini dikembangkan untuk:

- Mendigitalisasi seluruh proses administrasi perjalanan dinas.
- Mengurangi proses input data yang berulang.
- Menghasilkan dokumen resmi sesuai format instansi.
- Mengotomatisasi penomoran dokumen melalui fitur **Ambil Nomor**.
- Mempermudah proses persetujuan (Approval).
- Mempermudah monitoring perjalanan dinas.
- Menghasilkan laporan dan rekapitulasi secara otomatis.
- Mendukung penyusunan dokumen pertanggungjawaban keuangan.
- Menjadi pusat arsip digital perjalanan dinas.
- Menyediakan aplikasi berbasis Progressive Web App (PWA) yang dapat diakses melalui desktop maupun perangkat mobile.

---

## 1.3 Visi Sistem

Menjadi sistem informasi perjalanan dinas yang terintegrasi, modern, efisien, transparan, dan sesuai dengan tata kelola administrasi KPU Kabupaten Gorontalo.

---

## 1.4 Misi Sistem

- Meningkatkan kualitas pelayanan administrasi perjalanan dinas.
- Mengurangi kesalahan administrasi melalui otomatisasi proses.
- Menyediakan informasi secara real-time kepada seluruh pemangku kepentingan.
- Mendukung proses pengambilan keputusan melalui dashboard dan rekapitulasi.
- Menjamin keterlacakan setiap aktivitas melalui audit trail dan log aktivitas.

---

# 2. Project Overview

## 2.1 Nama Sistem

Sistem Informasi Manajemen Perjalanan Dinas (SIMPENAS)

---

## 2.2 Platform

- Web Application
- Progressive Web App (PWA)

---

## 2.3 Target Pengguna

- Admin
- Supervisor
- Pegawai
- Sub Bagian Keuangan

---

## 2.4 Karakteristik Sistem

Sistem dibangun sebagai aplikasi web modern berbasis SaaS internal instansi dengan karakteristik:

- Responsive Design
- Mobile Friendly
- PWA Ready
- Dashboard Interaktif
- Multi Role Access
- Template Generator Dokumen
- Activity Log
- Notification Center
- Approval Workflow
- Document Management
- Secure Authentication
- Enterprise Ready

---

## 2.5 Teknologi Frontend

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Zustand
- TanStack Query
- React Hook Form
- Zod
- TanStack Table
- Recharts
- Lucide React
- Framer Motion
- next-pwa
- next-themes
- date-fns

Teknologi backend akan ditentukan pada dokumen arsitektur terpisah.

---

# 3. Business Objectives

## 3.1 Tujuan Bisnis

Implementasi sistem ini diharapkan mampu:

- Mempercepat proses administrasi perjalanan dinas.
- Menjamin konsistensi format dokumen resmi.
- Mengurangi kesalahan input data.
- Menghindari duplikasi nomor dokumen.
- Meningkatkan efisiensi proses persetujuan.
- Mempermudah penyusunan dokumen keuangan.
- Meningkatkan akurasi laporan.
- Mempermudah pencarian arsip.
- Menyediakan dashboard sebagai media monitoring.

---

## 3.2 Indikator Keberhasilan

Sistem dianggap berhasil apabila mampu:

- Menghasilkan seluruh dokumen perjalanan dinas secara digital.
- Menghasilkan nomor dokumen secara otomatis melalui fitur **Ambil Nomor**.
- Menghasilkan template dokumen sesuai standar instansi.
- Mengurangi penginputan data berulang.
- Menyediakan proses approval yang terdokumentasi.
- Menyediakan notifikasi terhadap proses penting.
- Menyediakan audit trail seluruh aktivitas pengguna.
- Menyediakan rekapitulasi perjalanan dinas dan keuangan.
- Mendukung akses melalui desktop maupun perangkat mobile.

---

# 4. Stakeholder dan Project Scope

## 4.1 Stakeholder

### KPU Kabupaten Gorontalo

Pemilik sistem dan pengguna utama aplikasi.

### Admin

Bertanggung jawab mengelola seluruh data, konfigurasi, pengguna, serta dokumen perjalanan dinas.

### Supervisor

Bertugas melakukan verifikasi, validasi, dan persetujuan terhadap proses perjalanan dinas sesuai kewenangannya.

### Pegawai

Melakukan Penginputan sampai Pencetakan Dokumen SPT, SPPD, Melaksanakan perjalanan dinas, mengisi laporan perjalanan, mengunggah dokumentasi, dan memantau status administrasi.

### Keuangan

Mengelola proses pembayaran, menyusun SPBY, Daftar Nominatif, Tanda Terima, Kuitansi, serta melakukan rekapitulasi keuangan.

---

## 4.2 In Scope

Sistem akan mencakup modul-modul berikut:

- Autentikasi
- Dashboard
- Master Pegawai
- Master Jabatan
- Master Unit Kerja
- Master Pangkat/Golongan
- Master Anggaran DIPA
- Master Pejabat Penandatangan
- Nota Dinas
- Surat Perintah Tugas (SPT)
- Surat Perintah Perjalanan Dinas (SPPD)
- Laporan Perjalanan Dinas
- Surat Perintah Bayar (SPBY)
- Daftar Nominatif
- Tanda Terima
- Kuitansi
- Rekapitulasi
- Riwayat Approval
- Notifikasi
- Manajemen Dokumen
- Log Aktivitas
- Template Dokumen
- Pengaturan Penomoran Dokumen (fitur **Ambil Nomor**)
- Pencetakan dokumen PDF sesuai template instansi
- Export PDF
- Export Excel
- Progressive Web App (PWA)

---

## 4.3 Out of Scope

Fitur berikut tidak termasuk dalam fase pertama pengembangan:

- Integrasi e-Signature tersertifikasi.
- Integrasi email gateway.
- Integrasi WhatsApp Gateway.
- Integrasi SMS Gateway.
- Integrasi Single Sign-On (SSO).
- Multi Instansi (Multi Tenant).
- Payroll.
- Integrasi SIPD atau aplikasi pemerintah lainnya.
- Integrasi GPS Tracking.
- Integrasi fingerprint atau absensi biometrik.
- Integrasi sistem persuratan eksternal.
- Mode offline penuh (offline-first).

Fitur-fitur tersebut dapat dipertimbangkan sebagai pengembangan pada fase berikutnya sesuai kebutuhan organisasi. 5. User Roles & Permissions

Sistem menggunakan Role-Based Access Control (RBAC) untuk mengatur hak akses berdasarkan tugas dan tanggung jawab masing-masing pengguna.

5.1 Role Pengguna
Administrator

Administrator merupakan pengelola utama sistem yang memiliki hak akses penuh terhadap seluruh modul aplikasi, pengaturan sistem, data master, transaksi, dokumen, dan laporan.

Supervisor

Supervisor bertanggung jawab membuat Nota Dinas, melakukan pemeriksaan administrasi, memberikan persetujuan (Approval), serta melakukan monitoring seluruh proses perjalanan dinas.

Supervisor juga dapat membuat SPT dan SPPD apabila diperlukan.

Pegawai

Pegawai merupakan pelaksana perjalanan dinas.

Pegawai tidak dapat membuat Nota Dinas, namun dapat membuat SPT dan SPPD berdasarkan Nota Dinas yang telah dibuat oleh Supervisor serta mengisi Laporan Perjalanan Dinas setelah kegiatan selesai.

Sub Bagian Keuangan

Sub Bagian Keuangan bertanggung jawab melakukan verifikasi kelengkapan SPJ, membuat dokumen keuangan, melakukan proses pembayaran serta menghasilkan seluruh dokumen pertanggungjawaban keuangan.

5.2 Kode Permission
Kode Keterangan
C Create
R Read
U Update
D Delete
A Approve
G Generate Dokumen
P Print
E Export
N Ambil Nomor
V View Dashboard
5.3 Matriks Hak Akses
Modul Admin Supervisor Pegawai Keuangan
Dashboard V V V V
Master Pegawai CRUD R - R
Master Jabatan CRUD R - R
Master Unit Kerja CRUD R - R
Master Pangkat/Golongan CRUD R - R
Master Anggaran DIPA CRUD R R R
Master Pejabat Penandatangan CRUD R - R
Master Standar Biaya Masukan CRUD R R R
Nota Dinas CRUDAGPN CRUAGPN R R
SPT CRUDAGPN CRUDAGPN CRUGPN R
SPPD CRUDAGPN CRUDAGPN CRUGPN R
Laporan Perjalanan Dinas CRUDGP RUAGP CRUGP R
Validasi SPJ R R - CRUDAGP
SPBY R R R CRUDAGP
Daftar Nominatif R R R CRUDAGP
Tanda Terima R R R CRUDAGP
Kuitansi R R R CRUDAGP
Rekapitulasi VRPE VRPE VR VRPE
Manajemen Dokumen CRUDGP RGP RGP CRUDGP
Riwayat Approval R R R R
Notifikasi R R R R
Log Aktivitas CRUD R - R
Template Dokumen CRUD R - R
Pengaturan Penomoran CRUD R - -
User Management CRUD - - -
5.4 Hak Akses Dashboard
Administrator

Dashboard Administrator menampilkan:

Total Perjalanan Dinas
Total Nota Dinas
Total SPT
Total SPPD
Total SPBY
Total Pembayaran
Total Anggaran
Total Realisasi
Jumlah Hari Perjalanan seluruh pegawai
Total biaya perjalanan seluruh pegawai
Grafik perjalanan dinas
Grafik realisasi anggaran
Aktivitas terbaru
Supervisor

Dashboard Supervisor menampilkan:

Perjalanan yang menunggu approval
Perjalanan yang telah disetujui
Jumlah perjalanan dinas
Jumlah hari perjalanan seluruh pegawai
Statistik dokumen

Supervisor tidak dapat melihat nominal pembayaran.

Pegawai

Dashboard Pegawai menampilkan:

Riwayat perjalanan dinas
Status SPT
Status SPPD
Status Approval
Jumlah perjalanan pribadi
Jumlah hari perjalanan pribadi
Notifikasi

Pegawai tidak dapat melihat data pegawai lain maupun informasi keuangan.

Sub Bagian Keuangan

Dashboard Keuangan menampilkan:

SPJ menunggu validasi
SPBY yang belum diproses
Pembayaran yang sedang diproses
Pembayaran selesai
Statistik pembayaran
Rekapitulasi keuangan

# 6. Business Process

Seluruh proses bisnis pada Sistem Informasi Manajemen Perjalanan Dinas (SIMPENAS) dibagi ke dalam beberapa Business Process (BP) yang menjadi acuan implementasi sistem.

---

# BP-01 – Proses Pembuatan Nota Dinas

## Tujuan

Membuat Nota Dinas sebagai dokumen dasar pelaksanaan perjalanan dinas.

### Alur Proses

1. Supervisor membuat Nota Dinas.
2. Sistem menyediakan tombol **Ambil Nomor** untuk menghasilkan nomor Nota Dinas secara otomatis.
3. Pengguna memilih jenis Nota Dinas:

   - Perjalanan Dinas Dalam Kota
   - Perjalanan Dinas Luar Kota
   - Perjalanan Dinas Luar Daerah

4. Sistem menampilkan struktur lampiran sesuai jenis Nota Dinas.
5. Pengguna mengisi lampiran Nota Dinas.
6. Seluruh komponen biaya diambil otomatis dari **Master Standar Biaya Masukan Akun Perjalanan Dinas**.
7. Sistem menghitung seluruh rincian biaya secara otomatis.
8. Data lampiran menjadi dasar penentuan personil dan rincian biaya perjalanan dinas.
9. Nota Dinas ditandatangani oleh pembuat Nota Dinas.
10. Nota Dinas disimpan.

---

### Struktur Lampiran

#### A. Perjalanan Dinas Dalam Kota

- Tanggal
- Nama Personil
- Uraian
- Uang Harian Dalam Kota
- Uang Transport
- Total

---

#### B. Perjalanan Dinas Luar Kota

- Tanggal
- Nama Personil
- Uraian
- Uang Harian
- Uang Transport
- Penginapan
- Volume
- Total

---

#### C. Perjalanan Dinas Luar Daerah

- Tanggal
- Nama Personil
- Uraian
- Tiket Pesawat
- Transport Bandara Asal
- Transport Bandara Tujuan
- Hotel/Penginapan
- Uang Harian
- Volume/Hari
- Total Keseluruhan

---

# BP-02 – Proses Pembuatan Surat Perintah Tugas (SPT)

## Tujuan

Menerbitkan Surat Perintah Tugas berdasarkan Nota Dinas.

### Alur Proses

1. Admin, Supervisor, atau Pegawai membuat SPT.
2. Pengguna memilih Nota Dinas sebagai referensi.
3. Sistem mengambil daftar personil secara otomatis dari lampiran Nota Dinas.
4. Pengguna menekan tombol **Ambil Nomor**.
5. Sistem menghasilkan Nomor SPT secara otomatis.
6. Pengguna mengisi:

   - Menimbang (field dinamis)
   - Dasar (field dinamis)
   - Kegiatan (field dinamis)

7. Dokumen diajukan untuk Approval.
8. Supervisor melakukan Approval.
9. Jika disetujui, SPT menjadi dasar pembuatan SPPD.
10. Jika ditolak, status berubah menjadi **Perlu Revisi**.

---

# BP-03 – Proses Pembuatan Surat Perintah Perjalanan Dinas (SPPD)

## Tujuan

Menerbitkan Surat Perintah Perjalanan Dinas berdasarkan SPT yang telah disetujui.

### Alur Proses

1. Admin, Supervisor, atau Pegawai membuat SPPD.
2. Pengguna memilih SPT yang telah disetujui.
3. Sistem mengambil daftar personil secara otomatis dari SPT.
4. Pengguna menekan tombol **Ambil Nomor**.
5. Sistem menghasilkan Nomor SPPD secara otomatis.
6. Pengguna mengisi:

   - Transportasi
   - Tempat Berangkat
   - Tempat Tujuan
   - Tanggal Berangkat
   - Tanggal Kembali
   - Akun DIPA

7. Sistem menghitung lama perjalanan dinas secara otomatis.
8. Dokumen diajukan untuk Approval Supervisor.
9. Setelah disetujui, pegawai melaksanakan perjalanan dinas.

---

# BP-04 – Proses Pelaksanaan dan Laporan Perjalanan Dinas

## Tujuan

Mendokumentasikan hasil pelaksanaan perjalanan dinas.

### Alur Proses

1. Pegawai melaksanakan perjalanan dinas.
2. Pegawai mengisi Laporan Perjalanan Dinas.
3. Pegawai mengunggah dokumentasi kegiatan (multi foto).
4. Pegawai memberikan keterangan pada setiap foto.
5. Pegawai menandatangani laporan perjalanan dinas.
6. Supervisor melakukan verifikasi laporan.
7. Jika laporan belum lengkap, status berubah menjadi **Perlu Revisi**.
8. Jika telah sesuai, laporan dinyatakan **Terverifikasi**.

---

# BP-05 – Proses Validasi SPJ

## Tujuan

Memastikan seluruh dokumen pertanggungjawaban telah lengkap sebelum diproses oleh Sub Bagian Keuangan.

### Alur Proses

1. Sub Bagian Keuangan menerima SPJ.
2. Sistem memberikan status **SPJ Diterima**.
3. Keuangan melakukan Validasi SPJ.
4. Jika terdapat kekurangan, status menjadi **SPJ Perlu Dilengkapi**.
5. Setelah seluruh persyaratan lengkap, status berubah menjadi **Validasi SPJ Selesai**.

---

# BP-06 – Proses Dokumen Keuangan

## Tujuan

Menghasilkan seluruh dokumen pertanggungjawaban keuangan secara otomatis.

### Alur Proses

1. Sistem mengubah status menjadi **Belum Proses SPT Nomor [X]**.
2. Sub Bagian Keuangan memulai proses pembayaran.
3. Sistem mengambil seluruh rincian biaya dari Nota Dinas.
4. Sistem menghasilkan:

   - SPBY
   - Daftar Nominatif
   - Tanda Terima
   - Kuitansi

5. Seluruh dokumen menggunakan Template Dokumen resmi instansi.
6. Dokumen dicetak.
7. Status berubah menjadi **Proses Pembayaran Selesai SPT Nomor [X]**.

---

# BP-07 – Manajemen Dokumen

## Tujuan

Mengarsipkan seluruh dokumen perjalanan dinas secara digital.

### Alur Proses

1. Seluruh dokumen disimpan otomatis setelah selesai diproses.
2. Dokumen dapat dicari berdasarkan:

   - Nomor Dokumen
   - Pegawai
   - Jenis Dokumen
   - Tanggal

3. Dokumen dapat diunduh sesuai hak akses pengguna.

---

# BP-08 – Rekapitulasi

## Tujuan

Menyediakan informasi rekapitulasi perjalanan dinas dan keuangan.

### Alur Proses

1. Sistem menghitung jumlah hari perjalanan dinas setiap pegawai berdasarkan tanggal berangkat dan tanggal kembali pada SPPD.
2. Sistem menghitung total biaya berdasarkan rincian biaya pada Nota Dinas.
3. Dashboard diperbarui secara otomatis.
4. Rekapitulasi dapat diekspor ke PDF dan Excel sesuai hak akses pengguna.

---

# BP-09 – Workflow Approval

```text
Draft
   │
   ▼
Nomor Diambil
   │
   ▼
Menunggu Approval
   │
   ├──────────────┐
   ▼              ▼
Disetujui     Perlu Revisi
   │              │
   ▼              └──────► Kembali ke Draft
Diproses
   │
   ▼
Selesai
   │
   ▼
Diarsipkan
```

Workflow ini berlaku untuk:

- Surat Perintah Tugas (SPT)
- Surat Perintah Perjalanan Dinas (SPPD)
- Laporan Perjalanan Dinas
- Validasi SPJ

---

# BP-10 – Workflow Notifikasi

Sistem mengirimkan notifikasi pada kondisi berikut:

1. Dokumen berhasil dibuat.
2. Dokumen menunggu approval.
3. Dokumen disetujui.
4. Dokumen ditolak.
5. Pegawai belum mengisi Laporan Perjalanan Dinas.
6. Validasi SPJ selesai.
7. Dokumen keuangan berhasil dibuat.
8. Dokumen siap dicetak.
9. Dokumen berhasil diarsipkan.

# 7. Business Rules

Business Rules merupakan aturan yang wajib dipatuhi oleh sistem dalam menjalankan seluruh proses bisnis.

---

# BR-01 Penomoran Dokumen

1. Seluruh dokumen resmi menggunakan fitur **Ambil Nomor**.
2. Nomor dihasilkan otomatis oleh sistem.
3. Nomor bersifat unik.
4. Nomor tidak boleh digunakan lebih dari satu kali.
5. Nomor menjadi permanen setelah dokumen disimpan.
6. Penomoran dipisahkan berdasarkan jenis dokumen.
7. Pengambilan nomor dilakukan menggunakan mekanisme transaksi (locking) untuk mencegah nomor ganda.

---

# BR-02 Nota Dinas

1. Nota Dinas hanya dapat dibuat oleh **Supervisor** dan **Administrator**.
2. Pegawai tidak diperkenankan membuat Nota Dinas.
3. Satu Nota Dinas dapat memuat lebih dari satu personil.
4. Wajib memilih jenis Nota Dinas:

   - Perjalanan Dinas Dalam Kota
   - Perjalanan Dinas Luar Kota
   - Perjalanan Dinas Luar Daerah

5. Lampiran menjadi dasar pembuatan SPT.
6. Lampiran menjadi dasar perhitungan biaya.
7. Penandatangan dipilih dari Master Pejabat Penandatangan.
8. Nomor Nota Dinas wajib unik.

---

# BR-03 Surat Perintah Tugas (SPT)

1. Dapat dibuat oleh Administrator, Supervisor, dan Pegawai.
2. Harus memiliki referensi Nota Dinas.
3. Personil diambil otomatis dari lampiran Nota Dinas.
4. Menimbang bersifat dinamis.
5. Dasar bersifat dinamis.
6. Kegiatan bersifat dinamis.
7. Satu SPT dapat memuat lebih dari satu personil.
8. SPT hanya dapat diterbitkan apabila Nota Dinas telah tersimpan.

---

# BR-04 Surat Perintah Perjalanan Dinas (SPPD)

1. Harus berasal dari SPT.
2. Personil diambil otomatis dari SPT.
3. Nomor SPPD menggunakan fitur Ambil Nomor.
4. Transportasi merupakan data transaksi.
5. Tempat tujuan merupakan data transaksi.
6. Lama perjalanan dihitung otomatis berdasarkan tanggal berangkat dan tanggal kembali.
7. Akun anggaran wajib berasal dari Master Anggaran DIPA.

---

# BR-05 Laporan Perjalanan Dinas

1. Hanya dapat diisi oleh personil yang tercantum pada SPPD.
2. Dokumentasi dapat terdiri dari beberapa foto.
3. Setiap foto dapat memiliki keterangan.
4. Laporan wajib ditandatangani oleh pelaksana perjalanan.
5. Supervisor wajib melakukan verifikasi sebelum proses SPJ.

---

# BR-06 Validasi SPJ

Status SPJ terdiri dari:

- SPJ Diterima
- Validasi SPJ
- SPJ Perlu Dilengkapi
- Validasi SPJ Selesai

Dokumen keuangan hanya dapat diproses setelah status **Validasi SPJ Selesai**.

---

# BR-07 Dokumen Keuangan

1. SPBY dibuat setelah SPJ selesai divalidasi.
2. Seluruh nominal diambil otomatis dari rincian biaya pada Nota Dinas.
3. Daftar Nominatif dihasilkan otomatis.
4. Tanda Terima dihasilkan otomatis.
5. Kuitansi dihasilkan otomatis.
6. Seluruh dokumen menggunakan Template Dokumen resmi.

---

# BR-08 Rekapitulasi

1. Jumlah hari perjalanan dihitung otomatis dari SPPD.
2. Total biaya dihitung otomatis dari Nota Dinas.
3. Data diperbarui secara real-time setelah transaksi selesai.
4. Rekapitulasi dapat diekspor ke PDF dan Excel sesuai hak akses.

---

# BR-09 Audit Trail

Sistem wajib mencatat:

- Login
- Logout
- Tambah Data
- Ubah Data
- Hapus Data
- Approval
- Penolakan
- Generate Dokumen
- Download
- Export
- Cetak

Log aktivitas tidak dapat dihapus oleh pengguna biasa.

---

# BR-10 Manajemen Dokumen

Seluruh dokumen yang dihasilkan sistem wajib:

- Disimpan sebagai arsip digital.
- Memiliki nomor dokumen.
- Memiliki histori perubahan.
- Dapat dicari berdasarkan nomor, pegawai, tanggal, dan jenis dokumen.
- Dapat diunduh sesuai hak akses.

---

# 8. Functional Requirements

Seluruh kebutuhan fungsional diberi kode **FR** sebagai acuan implementasi.

---

# 8.1 Authentication

| ID     | Requirement                                             |
| ------ | ------------------------------------------------------- |
| FR-001 | Pengguna dapat login menggunakan username dan password. |
| FR-002 | Sistem memverifikasi kredensial pengguna.               |
| FR-003 | Sistem menampilkan dashboard sesuai role.               |
| FR-004 | Pengguna dapat logout.                                  |
| FR-005 | Pengguna dapat mengubah password.                       |
| FR-006 | Sistem mencatat aktivitas login dan logout.             |

---

# 8.2 Dashboard

| ID     | Requirement                                        |
| ------ | -------------------------------------------------- |
| FR-007 | Sistem menampilkan dashboard sesuai role pengguna. |
| FR-008 | Dashboard menampilkan statistik perjalanan dinas.  |
| FR-009 | Dashboard menampilkan notifikasi.                  |
| FR-010 | Dashboard menampilkan aktivitas terbaru.           |

---

# 8.3 Master Data

| ID     | Requirement                                                   |
| ------ | ------------------------------------------------------------- |
| FR-011 | Sistem mengelola data Pegawai.                                |
| FR-012 | Sistem mengelola Jabatan.                                     |
| FR-013 | Sistem mengelola Unit Kerja.                                  |
| FR-014 | Sistem mengelola Pangkat/Golongan.                            |
| FR-015 | Sistem mengelola Master Anggaran DIPA.                        |
| FR-016 | Sistem mengelola Pejabat Penandatangan.                       |
| FR-017 | Sistem mengelola Standar Biaya Masukan Akun Perjalanan Dinas. |

---

# 8.4 Nota Dinas

| ID     | Requirement                                                       |
| ------ | ----------------------------------------------------------------- |
| FR-018 | Supervisor dan Admin dapat membuat Nota Dinas.                    |
| FR-019 | Sistem menyediakan fitur Ambil Nomor.                             |
| FR-020 | Sistem menghasilkan nomor Nota Dinas secara otomatis.             |
| FR-021 | Sistem menyediakan tiga jenis Nota Dinas.                         |
| FR-022 | Sistem membentuk lampiran sesuai jenis Nota Dinas.                |
| FR-023 | Sistem mengambil Standar Biaya dari Master Standar Biaya Masukan. |
| FR-024 | Sistem menghitung seluruh rincian biaya secara otomatis.          |
| FR-025 | Sistem menyimpan Nota Dinas sebagai referensi SPT.                |

---

# 8.5 Surat Perintah Tugas (SPT)

| ID     | Requirement                                         |
| ------ | --------------------------------------------------- |
| FR-026 | Sistem membuat SPT berdasarkan Nota Dinas.          |
| FR-027 | Sistem mengambil personil dari lampiran Nota Dinas. |
| FR-028 | Sistem menyediakan field dinamis untuk Menimbang.   |
| FR-029 | Sistem menyediakan field dinamis untuk Dasar.       |
| FR-030 | Sistem menyediakan field dinamis untuk Kegiatan.    |
| FR-031 | Sistem menyediakan fitur Ambil Nomor SPT.           |
| FR-032 | Sistem mengirim SPT ke proses approval.             |

---

# 8.6 Surat Perintah Perjalanan Dinas (SPPD)

| ID     | Requirement                                                |
| ------ | ---------------------------------------------------------- |
| FR-033 | Sistem membuat SPPD berdasarkan SPT yang disetujui.        |
| FR-034 | Sistem mengambil personil secara otomatis dari SPT.        |
| FR-035 | Sistem menyediakan fitur Ambil Nomor SPPD.                 |
| FR-036 | Sistem menghitung lama perjalanan secara otomatis.         |
| FR-037 | Sistem menyimpan data transportasi sebagai data transaksi. |
| FR-038 | Sistem menyimpan tujuan sebagai data transaksi.            |
| FR-039 | Sistem mewajibkan pemilihan akun DIPA.                     |

---

# 8.7 Laporan Perjalanan Dinas

| ID     | Requirement                                      |
| ------ | ------------------------------------------------ |
| FR-040 | Pegawai dapat mengisi laporan perjalanan dinas.  |
| FR-041 | Sistem mendukung upload banyak foto dokumentasi. |
| FR-042 | Sistem mendukung caption untuk setiap foto.      |
| FR-043 | Sistem menyimpan tanda tangan pelaksana.         |
| FR-044 | Supervisor dapat memverifikasi laporan.          |

---

# 8.8 Dokumen Keuangan

| ID     | Requirement                                                               |
| ------ | ------------------------------------------------------------------------- |
| FR-045 | Keuangan dapat melakukan Validasi SPJ.                                    |
| FR-046 | Sistem menghasilkan SPBY otomatis.                                        |
| FR-047 | Sistem menghasilkan Daftar Nominatif otomatis.                            |
| FR-048 | Sistem menghasilkan Tanda Terima otomatis.                                |
| FR-049 | Sistem menghasilkan Kuitansi otomatis.                                    |
| FR-050 | Sistem menggunakan Template Dokumen resmi untuk seluruh dokumen keuangan. |

---

# 8.9 Rekapitulasi, Notifikasi, dan Arsip

| ID     | Requirement                                                         |
| ------ | ------------------------------------------------------------------- |
| FR-051 | Sistem menghasilkan Rekapitulasi perjalanan dinas.                  |
| FR-052 | Sistem menghitung jumlah hari perjalanan setiap pegawai.            |
| FR-053 | Sistem menghitung total biaya perjalanan.                           |
| FR-054 | Sistem mengirim notifikasi sesuai workflow.                         |
| FR-055 | Sistem mengarsipkan seluruh dokumen secara digital.                 |
| FR-056 | Sistem menyediakan pencarian dokumen berdasarkan berbagai kriteria. |
| FR-057 | Sistem mendukung export PDF dan Excel sesuai hak akses.             |
| FR-058 | Sistem mencatat seluruh aktivitas pengguna pada Log Aktivitas.      |

# 9. Module Specification

Bab ini menjelaskan spesifikasi teknis dan fungsional setiap modul yang terdapat pada Sistem Informasi Manajemen Perjalanan Dinas (SIMPENAS).

---

# 9.1 Authentication

## Tujuan

Mengelola proses autentikasi dan otorisasi pengguna berdasarkan Role-Based Access Control (RBAC).

### Aktor

- Administrator
- Supervisor
- Pegawai
- Sub Bagian Keuangan

### Referensi

- BP-09
- FR-001 s.d. FR-006

### Fitur

- Login
- Logout
- Ubah Password
- Session Management
- Role Validation
- Auto Redirect Dashboard

### Input

- Username
- Password

### Output

- Dashboard sesuai role
- Informasi profil pengguna

### Validasi

- Username wajib terdaftar.
- Password wajib sesuai.
- Akun yang dinonaktifkan tidak dapat login.

---

# 9.2 Dashboard

## Tujuan

Menyediakan informasi ringkasan aktivitas dan statistik sesuai hak akses pengguna.

### Aktor

Semua Role

### Referensi

- FR-007 s.d. FR-010

### Komponen

- Statistik
- Grafik
- Aktivitas Terbaru
- Notifikasi
- Shortcut Menu

### Output

Dashboard berbeda sesuai role pengguna.

---

# 9.3 Master Data

## Tujuan

Mengelola seluruh data referensi yang digunakan sistem.

### Modul

- Pegawai
- Jabatan
- Unit Kerja
- Pangkat/Golongan
- Master Anggaran DIPA
- Master Pejabat Penandatangan
- Master Standar Biaya Masukan Akun Perjalanan Dinas

### Referensi

- FR-011 s.d. FR-017

### Validasi

- Data tidak boleh duplikat.
- Data master yang telah digunakan transaksi tidak boleh dihapus, hanya dapat dinonaktifkan.

---

# 9.4 Nota Dinas

## Tujuan

Sebagai dokumen dasar penerbitan SPT.

### Aktor

- Administrator
- Supervisor

### Referensi

- BP-01
- BR-02
- FR-018 s.d. FR-025

### Field Header

- Kepada
- Dari
- Tembusan
- Nomor
- Tanggal
- Sifat
- Lampiran
- Perihal
- Isi Nota Dinas
- Penandatangan

### Jenis Nota Dinas

- Perjalanan Dinas Dalam Kota
- Perjalanan Dinas Luar Kota
- Perjalanan Dinas Luar Daerah

### Lampiran

Disesuaikan berdasarkan jenis Nota Dinas dan menggunakan Standar Biaya Masukan secara otomatis.

### Output

- PDF Nota Dinas
- Referensi SPT

### Status

- Draft
- Nomor Diambil
- Selesai

---

# 9.5 Surat Perintah Tugas (SPT)

## Tujuan

Menerbitkan surat penugasan berdasarkan Nota Dinas.

### Aktor

- Administrator
- Supervisor
- Pegawai

### Referensi

- BP-02
- BR-03
- FR-026 s.d. FR-032

### Field

- Nomor SPT
- Referensi Nota Dinas
- Menimbang (Dinamis)
- Dasar (Dinamis)
- Personil
- Kegiatan (Dinamis)
- Penandatangan

### Output

- Dokumen SPT
- Referensi SPPD

### Status

- Draft
- Nomor Diambil
- Menunggu Approval
- Disetujui
- Perlu Revisi

---

# 9.6 Surat Perintah Perjalanan Dinas (SPPD)

## Tujuan

Menerbitkan surat perjalanan dinas.

### Aktor

- Administrator
- Supervisor
- Pegawai

### Referensi

- BP-03
- BR-04
- FR-033 s.d. FR-039

### Field

- Nomor SPPD
- Referensi SPT
- Personil
- Transportasi
- Tempat Berangkat
- Tempat Tujuan
- Tanggal Berangkat
- Tanggal Kembali
- Lama Perjalanan (Otomatis)
- Akun DIPA

### Output

- Dokumen SPPD

### Status

- Draft
- Nomor Diambil
- Menunggu Approval
- Disetujui
- Perlu Revisi
- Pelaksanaan

---

# 9.7 Laporan Perjalanan Dinas

## Tujuan

Mendokumentasikan hasil pelaksanaan perjalanan dinas.

### Aktor

- Pegawai

### Referensi

- BP-04
- BR-05
- FR-040 s.d. FR-044

### Struktur Dokumen

A. Dasar Pelaksanaan

B. Maksud

C. Tujuan

D. Materi

E. Tempat dan Waktu Pelaksanaan

F. Hasil Pelaksanaan

G. Dokumentasi

H. Tanda Tangan Pelaksana

### Dokumentasi

- Multi Upload Foto
- Preview
- Caption
- Hapus Foto

### Output

- Dokumen Laporan Perjalanan Dinas

---

# 9.8 Validasi SPJ

## Tujuan

Melakukan pemeriksaan kelengkapan dokumen sebelum proses pembayaran.

### Aktor

- Sub Bagian Keuangan

### Referensi

- BP-05
- BR-06
- FR-045

### Status

- SPJ Diterima
- Validasi SPJ
- SPJ Perlu Dilengkapi
- Validasi SPJ Selesai

---

# 9.9 Dokumen Keuangan

## Tujuan

Menghasilkan dokumen pertanggungjawaban keuangan secara otomatis.

### Aktor

- Sub Bagian Keuangan

### Referensi

- BP-06
- BR-07
- FR-046 s.d. FR-050

### Dokumen

#### SPBY

Data diambil otomatis dari transaksi.

#### Daftar Nominatif

Field:

- Judul
- Tahun
- Anggaran
- Nomor Bukti
- MAK
- Nomor Urut
- Nama Penerima
- Jabatan
- Golongan/Pangkat
- Uang Transport
- Uang Harian
- Penginapan
- Jumlah Pembayaran
- Tanda Tangan

#### Tanda Terima

Field:

- Nomor Urut
- Perincian Biaya
- Jumlah
- Keterangan
- Bendahara Pengeluaran
- Yang Menerima

#### Kuitansi

Field:

- Sudah Terima Dari
- Jumlah Uang
- Terbilang
- Untuk Pembayaran
- Tanda Tangan

### Output

- Generate PDF sesuai Template Dokumen

---

# 9.10 Rekapitulasi

## Tujuan

Menyediakan laporan rekapitulasi perjalanan dinas dan keuangan.

### Referensi

- BP-08
- BR-08
- FR-051 s.d. FR-053

### Laporan

- Rekap Perjalanan Dinas
- Rekap Pegawai
- Rekap Hari Perjalanan
- Rekap Anggaran
- Rekap Pembayaran

### Export

- PDF
- Excel

---

# 9.11 Riwayat Approval

## Tujuan

Mencatat seluruh proses persetujuan dokumen.

### Data

- Dokumen
- Nomor Dokumen
- Tanggal
- Approver
- Status
- Catatan

---

# 9.12 Notifikasi

## Tujuan

Memberikan informasi status proses kepada pengguna.

### Jenis

- Approval
- Revisi
- Validasi SPJ
- Dokumen Selesai
- Dokumen Siap Dicetak

---

# 9.13 Manajemen Dokumen

## Tujuan

Mengarsipkan seluruh dokumen digital.

### Fitur

- Pencarian
- Preview
- Download
- Filter
- Riwayat Dokumen

---

# 9.14 Log Aktivitas

## Tujuan

Mencatat seluruh aktivitas pengguna.

### Aktivitas

- Login
- Logout
- Create
- Update
- Delete
- Approval
- Generate
- Print
- Export

---

# 9.15 Template Dokumen

## Tujuan

Mengelola format dokumen resmi instansi tanpa mengubah kode aplikasi.

### Template

- Nota Dinas
- SPT
- SPPD
- Laporan Perjalanan Dinas
- SPBY
- Daftar Nominatif
- Tanda Terima
- Kuitansi

### Fitur

- Preview Template
- Pengaturan Header (Logo, Nama Instansi, Alamat)
- Pengaturan Footer
- Pengaturan Penandatangan
- Pengaturan Margin dan Ukuran Kertas

---

# 9.16 Pengaturan Penomoran Dokumen

## Tujuan

Mengelola format dan mekanisme penomoran seluruh dokumen resmi.

### Dokumen yang Didukung

- Nota Dinas
- SPT
- SPPD
- SPBY

### Fitur

- Tombol **Ambil Nomor**
- Nomor otomatis berurutan
- Penomoran terpisah berdasarkan jenis dokumen
- Pencegahan nomor ganda menggunakan mekanisme transaksi (locking)
- Riwayat penggunaan nomor
- Pengaturan format nomor dokumen

# 10. User Flow & System Flow

Bab ini menjelaskan alur interaksi pengguna dengan sistem mulai dari login hingga proses penyelesaian perjalanan dinas beserta proses keuangan.

---

# UF-01 Login

### Aktor

- Administrator
- Supervisor
- Pegawai
- Sub Bagian Keuangan

### Alur Pengguna

1. Pengguna membuka aplikasi.
2. Pengguna memasukkan Username.
3. Pengguna memasukkan Password.
4. Sistem melakukan validasi.
5. Jika berhasil, sistem menampilkan Dashboard sesuai role.
6. Jika gagal, sistem menampilkan pesan kesalahan.

---

# UF-02 Pembuatan Nota Dinas

### Aktor

- Administrator
- Supervisor

### Alur

1. Membuka menu Nota Dinas.
2. Klik **Tambah Nota Dinas**.
3. Klik **Ambil Nomor**.
4. Sistem menghasilkan nomor otomatis.
5. Mengisi data Nota Dinas.
6. Memilih Jenis Nota Dinas.
7. Mengisi Lampiran.
8. Sistem menghitung biaya otomatis.
9. Menyimpan Nota Dinas.
10. Generate PDF apabila diperlukan.

---

# UF-03 Pembuatan SPT

### Aktor

- Administrator
- Supervisor
- Pegawai

### Alur

1. Membuka menu SPT.
2. Klik Tambah SPT.
3. Memilih Nota Dinas.
4. Personil muncul otomatis.
5. Klik Ambil Nomor.
6. Mengisi Menimbang.
7. Mengisi Dasar.
8. Mengisi Kegiatan.
9. Simpan.
10. Kirim Approval.

---

# UF-04 Approval SPT

### Aktor

- Supervisor

### Alur

1. Membuka daftar approval.
2. Memilih dokumen.
3. Melihat isi dokumen.
4. Menyetujui atau menolak.
5. Jika ditolak wajib mengisi catatan revisi.
6. Sistem mengirim notifikasi.

---

# UF-05 Pembuatan SPPD

### Aktor

- Administrator
- Supervisor
- Pegawai

### Alur

1. Membuka menu SPPD.
2. Memilih SPT.
3. Sistem mengambil personil otomatis.
4. Klik Ambil Nomor.
5. Mengisi Transportasi.
6. Mengisi Tempat Berangkat.
7. Mengisi Tempat Tujuan.
8. Mengisi Tanggal Berangkat.
9. Mengisi Tanggal Kembali.
10. Sistem menghitung lama perjalanan.
11. Memilih Akun DIPA.
12. Simpan.
13. Kirim Approval.

---

# UF-06 Pelaksanaan Perjalanan Dinas

### Aktor

- Pegawai

### Alur

1. Melaksanakan perjalanan.
2. Membuka menu Laporan.
3. Mengisi seluruh laporan.
4. Upload banyak foto.
5. Memberi caption.
6. Menandatangani laporan.
7. Kirim laporan.

---

# UF-07 Verifikasi Laporan

### Aktor

- Supervisor

### Alur

1. Membuka laporan.
2. Memeriksa laporan.
3. Memeriksa dokumentasi.
4. Menyetujui atau meminta revisi.

---

# UF-08 Validasi SPJ

### Aktor

- Sub Bagian Keuangan

### Alur

1. Membuka daftar SPJ.
2. Memeriksa kelengkapan.
3. Mengubah status:

   - SPJ Diterima
   - Validasi SPJ
   - SPJ Perlu Dilengkapi
   - Validasi SPJ Selesai

4. Jika lengkap maka lanjut ke proses pembayaran.

---

# UF-09 Generate Dokumen Keuangan

### Aktor

- Sub Bagian Keuangan

### Alur

1. Membuka transaksi.
2. Klik Generate SPBY.
3. Sistem membuat SPBY.
4. Generate Daftar Nominatif.
5. Generate Tanda Terima.
6. Generate Kuitansi.
7. Preview.
8. Print.

---

# UF-10 Rekapitulasi

### Aktor

- Administrator
- Supervisor
- Sub Bagian Keuangan

### Alur

1. Membuka menu Rekapitulasi.
2. Memilih filter.
3. Sistem menghitung data.
4. Menampilkan laporan.
5. Export PDF atau Excel.

---

# SF-01 System Flow

```text
Login
   │
   ▼
Dashboard
   │
   ▼
Nota Dinas
   │
   ▼
SPT
   │
   ▼
Approval
   │
   ▼
SPPD
   │
   ▼
Approval
   │
   ▼
Pelaksanaan Perjalanan
   │
   ▼
Laporan
   │
   ▼
Validasi SPJ
   │
   ▼
SPBY
   │
   ▼
Daftar Nominatif
   │
   ▼
Tanda Terima
   │
   ▼
Kuitansi
   │
   ▼
Arsip
   │
   ▼
Rekapitulasi
```

---

# 11. Validation Rules

Bab ini mendefinisikan aturan validasi yang wajib diterapkan pada seluruh modul aplikasi.

---

# VR-01 Authentication

- Username wajib diisi.
- Password wajib diisi.
- Username harus terdaftar.
- Password harus sesuai.
- Akun nonaktif tidak dapat login.

---

# VR-02 Penomoran Dokumen

- Nomor hanya diperoleh melalui tombol **Ambil Nomor**.
- Nomor tidak boleh diketik manual oleh pengguna biasa.
- Nomor tidak boleh ganda.
- Nomor tidak dapat diubah setelah dokumen disimpan, kecuali oleh Administrator sesuai hak akses.

---

# VR-03 Nota Dinas

- Nomor wajib ada.
- Tanggal wajib diisi.
- Kepada wajib diisi.
- Dari wajib diisi.
- Perihal wajib diisi.
- Isi Nota Dinas wajib diisi.
- Jenis Nota Dinas wajib dipilih.
- Minimal terdapat satu personil pada lampiran.
- Penandatangan wajib dipilih.
- Lampiran tidak boleh kosong.

---

# VR-04 Surat Perintah Tugas (SPT)

- Referensi Nota Dinas wajib dipilih.
- Nomor SPT wajib tersedia.
- Minimal satu personil.
- Minimal satu poin Menimbang.
- Minimal satu poin Dasar.
- Minimal satu poin Kegiatan.
- Tidak dapat diajukan sebelum seluruh data lengkap.

---

# VR-05 Surat Perintah Perjalanan Dinas (SPPD)

- Referensi SPT wajib dipilih.
- Nomor SPPD wajib tersedia.
- Personil harus berasal dari SPT.
- Transportasi wajib dipilih atau diisi.
- Tempat berangkat wajib diisi.
- Tempat tujuan wajib diisi.
- Tanggal kembali tidak boleh lebih awal dari tanggal berangkat.
- Akun DIPA wajib dipilih.
- Lama perjalanan dihitung otomatis dan tidak dapat diubah manual.

---

# VR-06 Laporan Perjalanan Dinas

- Hanya personil pada SPPD yang dapat mengisi.
- Dasar Pelaksanaan wajib diisi.
- Maksud wajib diisi.
- Tujuan wajib diisi.
- Materi wajib diisi.
- Tempat dan Waktu wajib diisi.
- Hasil Pelaksanaan wajib diisi.
- Minimal satu foto dokumentasi.
- Tanda tangan wajib diisi sebelum laporan dikirim.

---

# VR-07 Validasi SPJ

- SPJ tidak dapat diproses tanpa laporan yang telah diverifikasi.
- Status SPJ harus mengikuti urutan:

  1. SPJ Diterima
  2. Validasi SPJ
  3. SPJ Perlu Dilengkapi (jika diperlukan)
  4. Validasi SPJ Selesai

- Hanya status **Validasi SPJ Selesai** yang dapat dilanjutkan ke proses keuangan.

---

# VR-08 Dokumen Keuangan

- SPBY hanya dapat dibuat setelah Validasi SPJ selesai.
- Daftar Nominatif hanya dapat dibuat jika SPBY tersedia.
- Tanda Terima hanya dapat dibuat jika Daftar Nominatif tersedia.
- Kuitansi hanya dapat dibuat jika Tanda Terima tersedia.
- Seluruh nominal diambil otomatis dari data Nota Dinas dan transaksi yang telah tervalidasi.

---

# VR-09 Rekapitulasi

- Data dihitung secara otomatis.
- Jumlah hari perjalanan berdasarkan tanggal berangkat dan tanggal kembali.
- Total biaya berdasarkan transaksi keuangan yang telah selesai.
- Hak akses terhadap nominal mengikuti matriks hak akses.

---

# VR-10 Manajemen Dokumen

- Dokumen tidak dapat dihapus apabila telah menjadi referensi dokumen lain.
- Setiap perubahan dokumen dicatat pada Log Aktivitas.
- Dokumen yang telah diarsipkan tetap dapat dicari dan diunduh sesuai hak akses.

# 12. Non Functional Requirements (NFR)

Bab ini mendefinisikan kebutuhan non-fungsional yang harus dipenuhi agar sistem memiliki kualitas, keamanan, performa, dan kemudahan penggunaan yang sesuai dengan standar aplikasi enterprise.

---

# NFR-01 Performance

### Tujuan

Menjamin sistem memiliki waktu respon yang cepat dan stabil.

### Requirement

- Waktu muat halaman utama ≤ 3 detik pada koneksi normal.
- Perpindahan antar halaman menggunakan navigasi client-side.
- Pagination digunakan pada seluruh tabel dengan data besar.
- Pencarian dan filter dilakukan secara efisien.
- Generate dokumen dilakukan secara asynchronous apabila membutuhkan waktu lama.
- Dashboard menggunakan lazy loading untuk komponen statistik dan grafik.

---

# NFR-02 Security

### Tujuan

Menjamin keamanan data dan akses pengguna.

### Requirement

- Seluruh halaman yang membutuhkan autentikasi wajib dilindungi.
- Hak akses menggunakan Role-Based Access Control (RBAC).
- Password tidak boleh disimpan dalam bentuk teks biasa.
- Session pengguna harus memiliki batas waktu (session timeout).
- Seluruh aktivitas penting dicatat pada Log Aktivitas.
- Validasi hak akses dilakukan pada frontend dan backend.
- Dokumen hanya dapat diakses sesuai hak akses.

---

# NFR-03 Reliability

### Tujuan

Menjamin sistem tetap stabil selama operasional.

### Requirement

- Sistem mampu menangani proses yang gagal tanpa menyebabkan kerusakan data.
- Setiap transaksi penting menggunakan mekanisme transaksi database.
- Penomoran dokumen menggunakan locking untuk mencegah nomor ganda.
- Sistem harus mampu melakukan recovery terhadap kegagalan proses generate dokumen.

---

# NFR-04 Availability

### Tujuan

Menjamin sistem dapat diakses oleh pengguna sesuai kebutuhan operasional.

### Requirement

- Sistem tersedia selama jam kerja instansi.
- PWA dapat diinstal pada desktop maupun perangkat mobile.
- Sistem dapat digunakan melalui browser modern (Chrome, Edge, Firefox, Safari).

---

# NFR-05 Usability

### Tujuan

Menyediakan pengalaman penggunaan yang mudah dipahami.

### Requirement

- Antarmuka konsisten pada seluruh modul.
- Seluruh form memiliki validasi yang jelas.
- Pesan kesalahan mudah dipahami.
- Tombol aksi menggunakan ikon dan label yang konsisten.
- Navigasi sederhana dan mudah dipelajari.
- Mendukung mode responsif untuk desktop, tablet, dan mobile.

---

# NFR-06 Accessibility

### Tujuan

Meningkatkan aksesibilitas aplikasi.

### Requirement

- Seluruh komponen dapat digunakan menggunakan keyboard.
- Kontras warna memenuhi standar aksesibilitas.
- Setiap ikon penting memiliki tooltip.
- Form memiliki label yang jelas.
- Pesan validasi mudah dipahami.

---

# NFR-07 Compatibility

### Requirement

Sistem harus kompatibel dengan:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox
- Safari

---

# NFR-08 Progressive Web App (PWA)

### Requirement

- Dapat diinstal sebagai aplikasi.
- Memiliki ikon aplikasi.
- Memiliki splash screen.
- Mendukung shortcut aplikasi.
- Mendukung pembaruan aplikasi (update) ketika versi baru tersedia.
- Memiliki manifest dan service worker sesuai standar PWA.

---

# NFR-09 Document Generation

### Requirement

- Seluruh dokumen dihasilkan berdasarkan Template Dokumen resmi.
- Format PDF konsisten pada seluruh perangkat.
- Ukuran kertas dapat disesuaikan (A4/F4 sesuai kebutuhan instansi).
- Header, footer, logo, dan penandatangan mengikuti konfigurasi Template Dokumen.

---

# NFR-10 Audit & Logging

### Requirement

Sistem wajib mencatat:

- Login
- Logout
- Create
- Update
- Delete
- Approval
- Generate Dokumen
- Print
- Download
- Export
- Perubahan status dokumen

Seluruh log harus menyimpan:

- Waktu
- Pengguna
- Modul
- Aktivitas
- Alamat IP (jika tersedia)
- Perangkat atau browser (jika tersedia)

---

# 13. Acceptance Criteria

Bab ini menjadi acuan proses User Acceptance Test (UAT) dan Quality Assurance (QA).

---

# AC-01 Authentication

### Kriteria

- Pengguna dapat login menggunakan username dan password yang valid.
- Dashboard yang ditampilkan sesuai role.
- Login gagal apabila kredensial tidak sesuai.
- Logout mengakhiri sesi pengguna.

---

# AC-02 Nota Dinas

### Kriteria

- Nomor Nota Dinas diperoleh melalui tombol **Ambil Nomor**.
- Nomor yang dihasilkan selalu unik.
- Pengguna dapat memilih salah satu dari tiga jenis Nota Dinas.
- Lampiran tampil sesuai jenis Nota Dinas.
- Perhitungan biaya dilakukan otomatis.
- PDF berhasil dihasilkan sesuai template.

---

# AC-03 Surat Perintah Tugas (SPT)

### Kriteria

- SPT hanya dapat dibuat dari Nota Dinas yang valid.
- Personil otomatis berasal dari lampiran Nota Dinas.
- Field Menimbang, Dasar, dan Kegiatan mendukung penambahan poin secara dinamis.
- Dokumen dapat diajukan untuk approval.

---

# AC-04 Surat Perintah Perjalanan Dinas (SPPD)

### Kriteria

- SPPD hanya dapat dibuat dari SPT yang telah memenuhi syarat.
- Nomor SPPD dihasilkan melalui fitur **Ambil Nomor**.
- Lama perjalanan dihitung otomatis.
- Akun DIPA wajib dipilih.
- Dokumen dapat dicetak sesuai template.

---

# AC-05 Laporan Perjalanan Dinas

### Kriteria

- Hanya personil yang tercantum pada SPPD yang dapat mengisi laporan.
- Minimal satu foto dokumentasi berhasil diunggah.
- Tanda tangan berhasil disimpan.
- Supervisor dapat melakukan verifikasi.

---

# AC-06 Validasi SPJ

### Kriteria

- Status SPJ mengikuti urutan yang telah ditentukan.
- SPJ yang belum lengkap tidak dapat diproses ke tahap keuangan.
- Status berubah menjadi **Validasi SPJ Selesai** setelah seluruh persyaratan dipenuhi.

---

# AC-07 Dokumen Keuangan

### Kriteria

- SPBY berhasil dibuat setelah Validasi SPJ selesai.
- Daftar Nominatif, Tanda Terima, dan Kuitansi berhasil dihasilkan otomatis.
- Nominal sesuai dengan rincian biaya yang telah tervalidasi.
- Seluruh dokumen dapat dicetak sesuai Template Dokumen.

---

# AC-08 Rekapitulasi

### Kriteria

- Jumlah hari perjalanan dihitung otomatis.
- Total biaya sesuai transaksi yang telah selesai.
- Filter bekerja dengan benar.
- Export PDF dan Excel menghasilkan data yang sesuai.

---

# AC-09 Notifikasi

### Kriteria

- Notifikasi muncul ketika dokumen dibuat.
- Notifikasi muncul saat menunggu approval.
- Notifikasi muncul ketika dokumen disetujui atau ditolak.
- Notifikasi muncul ketika proses SPJ selesai.
- Notifikasi muncul ketika dokumen siap dicetak.

---

# AC-10 Audit Trail & Manajemen Dokumen

### Kriteria

- Seluruh aktivitas penting tercatat pada Log Aktivitas.
- Dokumen dapat dicari berdasarkan nomor, pegawai, tanggal, dan jenis dokumen.
- Dokumen yang telah diarsipkan tetap dapat diunduh sesuai hak akses.
- Riwayat perubahan dokumen dapat ditelusuri.

# 14. Risk, Assumption & Dependency (RAD)

Bab ini mendokumentasikan risiko, asumsi, dan ketergantungan yang perlu diperhatikan selama proses pengembangan dan implementasi Sistem Informasi Manajemen Perjalanan Dinas (SIMPENAS).

---

# 14.1 Project Assumptions

Pengembangan sistem dilakukan dengan asumsi berikut:

1. Sistem digunakan hanya oleh KPU Kabupaten Gorontalo (Single Institution).
2. Pengguna memiliki akun yang telah dibuat oleh Administrator.
3. Seluruh data master telah tersedia sebelum transaksi dilakukan.
4. Standar Biaya Masukan Akun Perjalanan Dinas dikelola oleh Administrator dan selalu diperbarui sesuai ketentuan yang berlaku.
5. Dokumen perjalanan dinas mengikuti format resmi KPU Kabupaten Gorontalo.
6. Seluruh proses approval dilakukan melalui aplikasi.
7. Dokumen yang dihasilkan memiliki kekuatan administrasi internal dan dapat dicetak sesuai kebutuhan.

---

# 14.2 Project Dependencies

Keberhasilan implementasi sistem bergantung pada:

- Ketersediaan backend API.
- Ketersediaan database.
- Master Anggaran DIPA yang valid.
- Master Pegawai yang lengkap.
- Master Pejabat Penandatangan yang selalu diperbarui.
- Template Dokumen resmi instansi.
- Standar Biaya Masukan yang berlaku.
- Infrastruktur server dan jaringan yang memadai.

---

# 14.3 Project Risks

| ID     | Risiko                            | Dampak                         | Mitigasi                                                |
| ------ | --------------------------------- | ------------------------------ | ------------------------------------------------------- |
| RSK-01 | Duplikasi nomor dokumen           | Dokumen tidak valid            | Gunakan fitur **Ambil Nomor** dengan locking di backend |
| RSK-02 | Data master tidak lengkap         | Transaksi tidak dapat diproses | Validasi data master sebelum transaksi                  |
| RSK-03 | Perubahan format dokumen instansi | Dokumen tidak sesuai standar   | Kelola melalui modul Template Dokumen                   |
| RSK-04 | Perubahan Standar Biaya Masukan   | Perhitungan biaya tidak sesuai | Perbarui Master Standar Biaya secara berkala            |
| RSK-05 | Gangguan server                   | Sistem tidak dapat diakses     | Backup, monitoring, dan prosedur pemulihan              |
| RSK-06 | Kesalahan input pengguna          | Data tidak akurat              | Validasi form dan konfirmasi sebelum simpan             |
| RSK-07 | Akses tidak sah                   | Kebocoran data                 | RBAC, autentikasi, dan audit trail                      |

---

# 14.4 Business Constraints

Pengembangan sistem memiliki batasan sebagai berikut:

- Tidak mendukung Multi Instansi pada fase pertama.
- Tidak mendukung Single Sign-On (SSO).
- Tidak mendukung e-Signature tersertifikasi.
- Tidak terintegrasi dengan SIPD atau aplikasi pemerintah lainnya.
- Tidak menyediakan mode offline penuh.
- Tidak mendukung integrasi WhatsApp, Email Gateway, maupun SMS Gateway pada fase pertama.

---

# 15. Future Development Roadmap

Bab ini mendokumentasikan fitur yang dapat dikembangkan pada fase berikutnya.

---

## Phase 2

- Integrasi e-Signature tersertifikasi.
- Integrasi Email Gateway.
- Integrasi WhatsApp Gateway.
- Integrasi SMS Gateway.
- Dashboard analitik yang lebih mendalam.
- Kalender kegiatan perjalanan dinas.

---

## Phase 3

- Integrasi SIPD.
- Integrasi aplikasi persuratan elektronik.
- Multi Instansi (Multi Tenant).
- API publik untuk integrasi dengan aplikasi lain.
- Persetujuan berjenjang (Multi-Level Approval).
- Digital archive dengan klasifikasi dokumen.

---

## Phase 4

- Mobile Application (Android dan iOS).
- Push Notification.
- QR Code untuk validasi dokumen.
- Barcode pada seluruh dokumen resmi.
- Integrasi tanda tangan digital pada perangkat layar sentuh.

---

## Continuous Improvement

Pengembangan berkelanjutan akan mempertimbangkan:

- Perubahan regulasi pemerintah.
- Perubahan SOP KPU.
- Masukan dari pengguna.
- Peningkatan keamanan aplikasi.
- Optimalisasi performa.
- Penyempurnaan UI/UX.

---

# 16. Conclusion & Approval

## 16.1 Kesimpulan

Dokumen Product Requirement Document (PRD) ini menjadi **Source of Truth (SOT)** utama dalam pengembangan Sistem Informasi Manajemen Perjalanan Dinas (SIMPENAS).

Seluruh proses analisis, desain UI/UX, implementasi frontend, implementasi backend, pengujian, hingga proses deployment wajib mengacu pada dokumen ini. Perubahan terhadap kebutuhan bisnis atau ruang lingkup sistem harus dilakukan melalui proses revisi PRD agar konsistensi pengembangan tetap terjaga.

---

## 16.2 Status Dokumen

| Informasi       | Keterangan                                             |
| --------------- | ------------------------------------------------------ |
| Nama Dokumen    | Product Requirement Document (PRD)                     |
| Nama Sistem     | Sistem Informasi Manajemen Perjalanan Dinas (SIMPENAS) |
| Versi           | 1.0                                                    |
| Status          | Draft Final                                            |
| Jenis Dokumen   | Source of Truth (SOT)                                  |
| Pemilik Dokumen | KPU Kabupaten Gorontalo                                |

---

## 16.3 Persetujuan

Dokumen ini dinyatakan berlaku setelah mendapatkan persetujuan dari pemilik sistem.

| Peran                | Nama | Tanggal | Tanda Tangan |
| -------------------- | ---- | ------- | ------------ |
| Pemilik Sistem       |      |         |              |
| Administrator Sistem |      |         |              |
| Project Manager      |      |         |              |
| System Analyst       |      |         |              |

---

## 16.4 Aturan Perubahan Dokumen

Setiap perubahan terhadap PRD wajib:

1. Memiliki alasan perubahan yang jelas.
2. Mendapat persetujuan dari pemilik sistem.
3. Memperbarui nomor versi dokumen.
4. Dicatat pada riwayat perubahan (Change Log).

---

## 16.5 Penutup

PRD ini menjadi landasan resmi bagi seluruh tahapan pengembangan Sistem Informasi Manajemen Perjalanan Dinas (SIMPENAS). Dokumen ini akan digunakan sebagai acuan dalam penyusunan UI Guideline, Implementation Plan, pengembangan frontend, pengembangan backend, pengujian (QA/UAT), serta pemeliharaan sistem di masa mendatang.

# APPENDIX

Appendix merupakan lampiran resmi Product Requirement Document (PRD) yang berisi referensi, istilah, standar, serta informasi pendukung yang digunakan selama proses pengembangan Sistem Informasi Manajemen Perjalanan Dinas (SIMPENAS).

---

# Appendix A. Glossary

| Istilah          | Definisi                                                                            |
| ---------------- | ----------------------------------------------------------------------------------- |
| SIMPENAS         | Sistem Informasi Manajemen Perjalanan Dinas                                         |
| Nota Dinas       | Dokumen dasar sebagai usulan pelaksanaan perjalanan dinas.                          |
| SPT              | Surat Perintah Tugas.                                                               |
| SPPD             | Surat Perintah Perjalanan Dinas.                                                    |
| SPBY             | Surat Perintah Bayar.                                                               |
| SPJ              | Surat Pertanggungjawaban.                                                           |
| DIPA             | Daftar Isian Pelaksanaan Anggaran.                                                  |
| MAK              | Mata Anggaran Kegiatan.                                                             |
| SBM              | Standar Biaya Masukan.                                                              |
| RBAC             | Role-Based Access Control.                                                          |
| PWA              | Progressive Web Application.                                                        |
| PDF              | Portable Document Format.                                                           |
| Approval         | Proses persetujuan dokumen.                                                         |
| Template Dokumen | Format baku dokumen resmi instansi yang digunakan sistem saat menghasilkan dokumen. |
| Ambil Nomor      | Fitur untuk menghasilkan nomor dokumen secara otomatis, berurutan, dan unik.        |
| Dashboard        | Halaman utama yang menampilkan ringkasan informasi sesuai hak akses pengguna.       |
| Rekapitulasi     | Ringkasan data perjalanan dinas dan keuangan berdasarkan filter tertentu.           |
| Audit Trail      | Catatan seluruh aktivitas penting pengguna di dalam sistem.                         |

---

# Appendix B. Singkatan

| Singkatan | Keterangan                        |
| --------- | --------------------------------- |
| ND        | Nota Dinas                        |
| SPT       | Surat Perintah Tugas              |
| SPPD      | Surat Perintah Perjalanan Dinas   |
| SPBY      | Surat Perintah Bayar              |
| SPJ       | Surat Pertanggungjawaban          |
| DIPA      | Daftar Isian Pelaksanaan Anggaran |
| MAK       | Mata Anggaran Kegiatan            |
| KPU       | Komisi Pemilihan Umum             |
| PWA       | Progressive Web App               |
| RBAC      | Role-Based Access Control         |
| API       | Application Programming Interface |
| UI        | User Interface                    |
| UX        | User Experience                   |
| PDF       | Portable Document Format          |

---

# Appendix C. Status Dokumen

## Status Workflow

| Status            | Keterangan                                                   |
| ----------------- | ------------------------------------------------------------ |
| Draft             | Dokumen masih dalam proses penyusunan.                       |
| Nomor Diambil     | Nomor dokumen telah diperoleh melalui fitur **Ambil Nomor**. |
| Menunggu Approval | Dokumen telah diajukan untuk persetujuan.                    |
| Disetujui         | Dokumen telah disetujui.                                     |
| Perlu Revisi      | Dokumen dikembalikan untuk diperbaiki.                       |
| Diproses          | Dokumen sedang diproses pada tahapan berikutnya.             |
| Pelaksanaan       | Perjalanan dinas sedang berlangsung.                         |
| Validasi SPJ      | Dokumen sedang diperiksa oleh Sub Bagian Keuangan.           |
| Selesai           | Seluruh proses administrasi telah selesai.                   |
| Diarsipkan        | Dokumen telah menjadi arsip digital.                         |

---

# Appendix D. Kode Referensi Dokumen

| Prefix | Keterangan                 |
| ------ | -------------------------- |
| BP     | Business Process           |
| BR     | Business Rules             |
| FR     | Functional Requirement     |
| VR     | Validation Rule            |
| NFR    | Non Functional Requirement |
| AC     | Acceptance Criteria        |
| UF     | User Flow                  |
| SF     | System Flow                |
| RSK    | Risk                       |
| APP    | Appendix                   |

Contoh:

- BP-03 → Business Process Pembuatan SPPD
- BR-04 → Business Rule SPPD
- FR-033 → Functional Requirement Pembuatan SPPD
- VR-05 → Validation Rule SPPD
- AC-04 → Acceptance Criteria SPPD

---

# Appendix E. Referensi Antar Modul

| Modul                    | Bergantung Pada                      |
| ------------------------ | ------------------------------------ |
| Nota Dinas               | Master Data, Master DIPA, Master SBM |
| SPT                      | Nota Dinas                           |
| SPPD                     | SPT                                  |
| Laporan Perjalanan Dinas | SPPD                                 |
| Validasi SPJ             | Laporan Perjalanan Dinas             |
| SPBY                     | Validasi SPJ                         |
| Daftar Nominatif         | SPBY                                 |
| Tanda Terima             | Daftar Nominatif                     |
| Kuitansi                 | Tanda Terima                         |
| Rekapitulasi             | Seluruh Modul                        |

---

# Appendix F. Standar Penamaan

## Folder

Menggunakan format:

- lowercase
- kebab-case

Contoh:

master-data

laporan-perjalanan

template-dokumen

---

## File

Menggunakan:

PascalCase untuk komponen.

camelCase untuk utilitas.

kebab-case untuk route.

---

## Database

Menggunakan:

snake_case

Contoh:

nomor_spt

tanggal_berangkat

master_dipa

---

## API Endpoint

Menggunakan:

RESTful Convention

Contoh:

GET /api/spt

POST /api/spt

PUT /api/spt/{id}

DELETE /api/spt/{id}

---

# Appendix G. Change Log

| Versi | Tanggal               | Perubahan                                           | Oleh           |
| ----- | --------------------- | --------------------------------------------------- | -------------- |
| 1.0   | (Tanggal Persetujuan) | Penyusunan awal Product Requirement Document (PRD). | Tim Pengembang |
| 1.1   |                       |                                                     |                |
| 1.2   |                       |                                                     |                |
| 2.0   |                       |                                                     |                |

---

# Appendix H. Referensi Dokumen Pendukung

Dokumen berikut menjadi referensi pelaksanaan proyek:

- Product Requirement Document (PRD)
- UI Guideline
- Implementation Plan
- Template Dokumen Resmi KPU Kabupaten Gorontalo
- Standar Biaya Masukan yang berlaku
- Dokumen DIPA Tahun Anggaran Berjalan
- SOP Perjalanan Dinas KPU Kabupaten Gorontalo

---

# Appendix I. Catatan Implementasi

1. Seluruh pengembangan frontend wajib mengacu pada PRD ini.
2. Seluruh pengembangan backend wajib mengacu pada PRD ini.
3. UI Guideline disusun berdasarkan modul yang terdapat pada BAB 9.
4. Implementation Plan disusun berdasarkan BP, BR, FR, dan NFR yang telah ditetapkan.
5. Perubahan terhadap kebutuhan sistem wajib diperbarui melalui Change Log sebelum diimplementasikan.

---

# Appendix J. Persetujuan Source of Truth (SOT)

Dokumen Product Requirement Document (PRD) ini merupakan **Source of Truth (SOT)** utama untuk pengembangan Sistem Informasi Manajemen Perjalanan Dinas (SIMPENAS).

Seluruh keputusan terkait analisis, desain, implementasi, pengujian, dan pemeliharaan sistem harus mengacu pada dokumen ini.

Apabila terjadi perbedaan antara implementasi dan isi PRD, maka PRD menjadi acuan utama sampai dilakukan revisi resmi melalui mekanisme Change Log.
