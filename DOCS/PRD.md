# Product Requirement Document (PRD)

# Sistem Informasi Manajemen Perjalanan Dinas (SIMPENAS)

**Versi Dokumen:** 1.54
**Status:** Aktif - Business Process Consolidated
**Tanggal Konsolidasi:** 20 Juli 2026
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

- Next.js 16 (App Router, webpack development/build untuk kompatibilitas PWA)
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

Fitur-fitur tersebut dapat dipertimbangkan sebagai pengembangan pada fase berikutnya sesuai kebutuhan organisasi.

# 5. User Roles & Permissions

Sistem menggunakan Role-Based Access Control (RBAC) yang dipadukan dengan identitas pegawai, unit kerja, kategori pegawai, serta jabatan/peran dokumen. Role aplikasi tidak dengan sendirinya memberikan seluruh kewenangan jabatan.

## 5.1 Role Pengguna

### Administrator

Administrator mengelola master data, akun/role pegawai, konfigurasi template, penomoran, transaksi, dokumen, audit, dan laporan. Administrator dapat melakukan koreksi nomor dokumen yang telah disetujui sesuai kewenangan khusus.

### Supervisor

Supervisor dapat membuat Nota Dinas dan melakukan monitoring transaksi. Kewenangan approval ditentukan lagi oleh jabatan resmi:

- Sekretaris KPU, PLT Sekretaris KPU, atau PLH Sekretaris KPU berwenang menyetujui Nota Dinas.
- Sekretaris/PLT/PLH Sekretaris dan Kepala Sub Bagian/Kasubbag berwenang memproses approval SPT Sekretariat.
- Ketua KPU atau Kepala Sub Bagian/Kasubbag pembuat/penandatangan Nota Dinas sumber berwenang memproses approval SPT Komisioner.

Pegawai dengan role Supervisor tetap menggunakan akun masing-masing. Kesamaan role tidak berarti menggunakan username atau identitas yang sama.

### Pegawai

Pegawai merupakan pelaksana perjalanan dinas. Pegawai hanya dapat melihat dan mengerjakan SPT, SPPD, Laporan, hasil Validasi SPJ, serta dokumen keuangan yang berasal dari Nota Dinas yang mencantumkan dirinya sebagai personel.

### Sub Bagian Keuangan

Role ini hanya operasional apabila pegawai terdaftar pada Unit Sub Bagian Keuangan. Pegawai tersebut dapat memvalidasi SPJ dan menghasilkan dokumen keuangan. Personel Nota Dinas di luar unit keuangan hanya memperoleh akses lihat terhadap hasil validasi dan dokumen perjalanannya sendiri.

## 5.2 Kode Permission

| Kode | Keterangan       |
| ---- | ---------------- |
| C    | Create           |
| R    | Read             |
| U    | Update           |
| D    | Delete           |
| A    | Approve/Verify   |
| G    | Generate Dokumen |
| P    | Print            |
| E    | Export           |
| N    | Ambil Nomor      |
| V    | View Dashboard   |

## 5.3 Matriks Hak Akses Terkonsolidasi

Keterangan `scope ND` berarti akses hanya diberikan jika pegawai tercantum pada lampiran Nota Dinas sumber.

| Modul                       | Administrator | Supervisor             | Pegawai         | Sub Bagian Keuangan        |
| --------------------------- | ------------- | ---------------------- | --------------- | -------------------------- |
| Dashboard                   | V             | V                      | V pribadi       | V keuangan                 |
| Master Data                 | CRUD          | R                      | R terbatas      | R                          |
| Role Pegawai                | CRUD          | R                      | -               | R                          |
| Nota Dinas                  | CRUDAGPN      | CRUAGPN sesuai jabatan | R scope ND      | R                          |
| SPT                         | CRUDAGPN      | CRUAGPN sesuai jabatan | CRUGPN scope ND | R                          |
| SPPD                        | CRUDGPN       | CRUGPN                 | CRUGPN scope ND | R                          |
| Laporan Perjalanan          | CRUDGP        | RUAGP                  | CRUGP scope ND  | R                          |
| Validasi SPJ dan Pembayaran | R             | R                      | R scope ND      | CRUDAGP jika unit keuangan |
| Dokumen Keuangan            | CRUDGP        | R                      | R scope ND      | CRUAGP jika unit keuangan  |
| Arsip SPJ                   | CRU           | -                      | -               | CRU jika unit keuangan     |
| Rekapitulasi                | VRPE          | VRPE nonnominal        | VR pribadi      | VRPE                       |
| Manajemen Dokumen           | CRUDGP        | RGP                    | RGP scope ND    | RGP                        |
| Approval                    | R/A/D         | R/A sesuai jabatan     | -               | -                          |
| Notifikasi                  | R             | R                      | R               | R                          |
| Log Aktivitas               | CRUD          | R                      | -               | R                          |
| Template Dokumen            | CRUD          | R                      | -               | R                          |
| Pengaturan Penomoran        | CRUD          | R                      | -               | -                          |

## 5.4 Identitas, Kategori, dan Jabatan

1. Setiap pegawai memiliki satu akun dan identitas login individual yang terhubung melalui `pegawaiId`, baik pada mock frontend maupun implementasi backend.
2. Username bersifat unik dan tidak dibagikan berdasarkan role; dua pegawai dengan role yang sama tetap menggunakan akun berbeda.
3. Pengguna hanya memasukkan username dan password pada login. Role, nama, dan identitas pegawai dibaca otomatis dari Master Pegawai dan tidak dipilih pada form login.
4. Administrator mengelola username, email, status akun, dan reset password melalui Master Akun Pengguna. Role aplikasi tetap dikelola pada Master Pegawai.
5. Kategori pegawai terdiri dari ASN/Sekretariat, Ketua KPU, dan Anggota KPU.
6. NIP dan Pangkat/Golongan wajib untuk ASN/Sekretariat.
7. NIP dan Pangkat/Golongan tidak wajib untuk Ketua/Anggota KPU.
8. Peran dokumen dikelola pada Master Pejabat Penandatangan dan dapat ditambah sesuai kebutuhan instansi.
9. Daftar pegawai pada menu, dropdown, lampiran, dan dokumen kolektif ditampilkan menurut hierarki Ketua KPU, Anggota KPU, Sekretaris, Kepala Sub Bagian/Kasubbag, lalu Staf. Khusus Staf, PNS Golongan `I/a`–`IV/d` ditampilkan lebih dahulu berdasarkan pangkat tertinggi, kemudian PPPK Golongan `I`–`XI` berdasarkan jenjang tertinggi; nilai golongan yang sama diurutkan berdasarkan nama.

# 6. Business Process

Seluruh proses bisnis pada Sistem Informasi Manajemen Perjalanan Dinas (SIMPENAS) dibagi ke dalam Business Process (BP) berikut. Bab ini merupakan acuan bisnis terkonsolidasi dan menggantikan uraian workflow lama yang bertentangan pada completion report atau dokumen implementasi terdahulu.

## 6.1 Rantai Dokumen Utama

```text
Nota Dinas
  -> SPT Sekretariat dan/atau SPT Komisioner
  -> SPPD per orang
  -> Laporan Perjalanan per nomor SPT
  -> Validasi SPJ dan Pembayaran
  -> SPBY per orang
  -> Daftar Nominatif kolektif
  -> Tanda Terima per orang
  -> Kuitansi per orang
  -> Arsip dan Rekapitulasi
```

Relasi utama antar dokumen wajib menggunakan Document ID. Personel digunakan sebagai isi dan penerima dokumen, bukan sebagai primary relation antar dokumen.

---

# BP-01 – Pembuatan dan Approval Nota Dinas

## Tujuan

Membuat dokumen dasar anggaran dan personel perjalanan dinas sebelum penerbitan SPT.

### Alur Proses

1. Administrator atau Supervisor/Kasubbag membuat Nota Dinas.
2. Pada form baru, sistem mengisi `Dari` secara otomatis dari Master Jabatan pegawai yang terhubung ke sesi login dan menguncinya; `Kepada` secara default berisi **Sekretaris KPU Kabupaten Gorontalo**. Pejabat penandatangan Nota Dinas juga ditetapkan dari akun login melalui relasi akun–pegawai–Master Pejabat Penandatangan dan tidak dapat dipilih manual.
3. Pengguna mengisi tanggal dokumen, tanggal berangkat, tanggal kembali, lokasi tujuan, jenis perjalanan, isi, dan lampiran personel/anggaran.
4. Nota Dinas boleh memuat ASN/Sekretariat dan Komisioner dalam dokumen yang sama karena menjadi dasar anggaran.
5. Biaya diambil dari Master SBM dan total dihitung otomatis.
6. Ketika personel dipilih, sistem memeriksa benturan rentang tanggal dengan Nota Dinas lain berstatus Disetujui atau Selesai.
7. Jika ditemukan benturan, sistem menampilkan nomor Nota Dinas, tanggal perjalanan, dan lokasi sebelumnya serta membuat notifikasi persisten. Peringatan tidak memblokir penyimpanan.
8. Pengguna mengambil nomor Nota Dinas melalui layanan penomoran.
9. Nomor yang diambil pada form baru menjadi reservasi. Jika form dibatalkan sebelum disimpan, nomor dilepas dan dapat digunakan kembali.
10. Sistem tidak menerbitkan nomor Nota Dinas berurutan berikutnya selama reservasi nomor sebelumnya belum disimpan sebagai Nota Dinas atau dibatalkan. Setelah dokumen tersimpan, nomor berikutnya dapat diambil tanpa menunggu approval Sekretaris.
11. Nota Dinas ditandatangani oleh Kepala Sub Bagian/Kasubbag pembuat.
12. Dokumen dikirim ke approval dengan status Menunggu Approval.
13. Nota Dinas hanya dapat disetujui oleh Sekretaris KPU, PLT Sekretaris KPU, atau PLH Sekretaris KPU.
14. Penolakan mengubah status menjadi Perlu Revisi, mewajibkan catatan revisi, menyimpan catatan pada dokumen, dan menampilkannya kepada Kasubbag pembuat melalui tabel serta notifikasi personal.
15. Nota Dinas Disetujui menjadi referensi pembuatan SPT.

### Struktur Anggaran

Komponen lampiran menyesuaikan jenis perjalanan dan hanya komponen bernilai lebih dari nol yang ditampilkan pada tabel cetak. Data biaya tetap tersimpan lengkap sebagai sumber dokumen keuangan.

---

# BP-02 – Pembuatan dan Approval Surat Tugas (SPT)

## Tujuan

Menerbitkan Surat Tugas berdasarkan Nota Dinas yang telah disetujui dengan pemisahan personel Sekretariat dan Komisioner.

### Alur Proses

1. Administrator, Supervisor, atau Pegawai yang tercantum dalam Nota Dinas memilih Nota Dinas berstatus Disetujui.
2. Personel diambil otomatis dari lampiran Nota Dinas dan tidak dipilih bebas.
3. Jika Nota Dinas memuat kelompok campuran, sistem membuat dua dokumen terpisah:

   - SPT Sekretariat untuk ASN/Sekretariat.
   - SPT Komisioner untuk Ketua dan Anggota KPU.

4. Kedua SPT memiliki Document ID dan nomor masing-masing.
5. Menimbang, Dasar, dan Uraian Tugas pada SPT lanjutan dari Nota Dinas yang sama dapat disalin dari SPT sebelumnya.
6. Tombol **Simpan & Next Buat SPT Komisioner** tersedia apabila Nota Dinas campuran dimulai dari SPT Sekretariat.
7. SPT lanjutan dalam satu Nota Dinas dapat mengambil nomor tanpa menunggu approval SPT sebelumnya.
8. Di luar pengecualian satu Nota Dinas, nomor SPT baru hanya dapat dilanjutkan setelah dokumen sebelumnya berstatus Selesai.
9. SPT Sekretariat hanya ditandatangani Sekretaris/PLT/PLH Sekretaris KPU.
10. SPT Komisioner hanya ditandatangani Ketua KPU.
11. SPT Sekretariat dapat di-approve oleh Sekretaris/PLT/PLH Sekretaris atau hanya Kepala Sub Bagian/Kasubbag yang membuat dan menandatangani Nota Dinas sumbernya; Kasubbag lain tidak berwenang.
12. SPT Komisioner dapat di-approve oleh Ketua KPU atau hanya Kepala Sub Bagian/Kasubbag yang membuat dan menandatangani Nota Dinas sumbernya; Kasubbag lain tidak berwenang. Penandatangan dokumen tetap Ketua KPU.
13. Penolakan mewajibkan catatan revisi, mengubah status menjadi Perlu Revisi, menyimpan catatan pada dokumen, dan menampilkannya kepada pegawai pembuat SPT melalui tabel serta notifikasi personal.
14. SPT Disetujui menjadi dasar pembuatan SPPD.
15. Pegawai pertama yang menyimpan SPT menjadi pengelola tunggal rangkaian dokumen untuk `notaDinasId` tersebut. Personel lain pada Nota Dinas yang sama tetap memperoleh akses lihat/pratinjau, tetapi tombol pembuatan SPT, SPPD, dan Laporan baru dinonaktifkan bagi mereka. Nota Dinas baru yang telah Disetujui membentuk scope pembuatan baru secara independen.

---

# BP-03 – Pembuatan Surat Perintah Perjalanan Dinas (SPPD)

## Tujuan

Menerbitkan SPPD individual berdasarkan SPT yang telah disetujui.

### Alur Proses

1. Administrator, Supervisor, atau Pegawai dalam scope Nota Dinas memilih SPT berstatus Disetujui atau Selesai.
2. Satu SPPD hanya memuat satu orang. Jika SPT memiliki beberapa personel, SPPD dibuat terpisah untuk masing-masing orang.
3. Setiap SPPD individual memperoleh nomor SPPD unik dari layanan penomoran SPPD. Nomor diterbitkan saat dokumen berhasil disimpan dan tidak mengikuti nomor urut SPT referensi.
4. Pengguna memilih personel dan mengisi maksud, transportasi, tempat berangkat, tempat tujuan, tanggal, akun DIPA, serta data Halaman 2.
5. Sistem menghitung lama perjalanan secara otomatis.
6. Saat SPPD pertama untuk satu SPT dibuat, field selain nomor dan personel menjadi nilai bersama bagi SPPD personel lainnya.
7. Perubahan maksud, transportasi, lokasi, tanggal, DIPA, penandatangan, atau pengaturan Halaman 2 pada satu SPPD menyinkronkan SPPD lain dengan SPT yang sama; nomor dan personel masing-masing SPPD tidak ikut disinkronkan.
8. SPPD Halaman 1 dan Halaman 2 ditandatangani oleh Pejabat Pembuat Komitmen (PPK), termasuk SPPD Komisioner.
9. Halaman 2 memiliki blok Romawi dinamis; Romawi I dan Romawi terakhir menggunakan PPK, sedangkan Romawi II sampai sebelum terakhir dapat diisi manual sesuai riwayat perjalanan.
10. SPPD tidak memiliki approval terpisah. Status dokumen dikelola otomatis: Draft sebelum disimpan, Diproses ketika baru sebagian personel SPT memiliki SPPD, Selesai ketika seluruh personel SPT memiliki SPPD, dan Diarsipkan setelah PDF fisik SPJ Nota Dinas sumber berhasil diunggah.
11. Setelah dokumen siap, pegawai melaksanakan perjalanan dinas.
12. Pegawai pembuat SPT pertama pada `notaDinasId` sumber menjadi pengelola seluruh SPT, SPPD individual, dan Laporan terkait. Pegawai lain dalam scope Nota Dinas, termasuk pengguna berjabatan Kasubbag, hanya dapat melihat status dan pratinjau; Administrator tetap dapat melakukan koreksi sesuai kewenangan. Nota Dinas baru yang telah Disetujui membentuk scope pembuatan baru secara independen.

---

# BP-04 – Pelaksanaan dan Laporan Perjalanan Dinas

## Tujuan

Mendokumentasikan hasil perjalanan dalam satu laporan untuk satu nomor SPT.

### Alur Proses

1. Pegawai melaksanakan perjalanan berdasarkan SPT dan SPPD individual.
2. Pembuatan Laporan tersedia setelah seluruh personel SPT memiliki SPPD dan seri SPPD berstatus Selesai; SPPD Diarsipkan tetap dianggap lengkap. Sistem hanya mengizinkan satu Laporan Perjalanan untuk satu nomor SPT.
3. Seluruh personel pada SPT dicantumkan sebagai tim pelaksana dalam satu laporan.
4. Nomor/tanggal Surat Tugas diambil dari SPT dan lokasi/waktu diambil dari SPPD terkait, namun tetap dapat disunting.
5. Pengguna mengisi Judul, Dasar, Maksud, Tujuan per poin, Materi per poin, Hasil per poin, Kalimat Penutup, tempat/tanggal laporan, dan dokumentasi.
6. Dokumentasi mendukung beberapa foto dengan batas maksimum 100 MB per berkas. Caption foto tidak digunakan pada output dokumen.
7. Form tanda tangan digital tidak digunakan. Dokumen cetak menyediakan daftar seluruh pelaksana untuk ditandatangani manual.
8. Laporan dikirim dengan status Menunggu Verifikasi.
9. Supervisor memverifikasi laporan. Kekurangan menghasilkan status Perlu Revisi dan catatan; laporan lengkap menjadi Terverifikasi.
10. Laporan Terverifikasi menjadi dasar otomatis pembentukan data Validasi SPJ.

---

# BP-05 – Proses Validasi SPJ dan Pembayaran

## Tujuan

Memastikan seluruh dokumen pertanggungjawaban telah lengkap serta memantau proses sampai pembayaran selesai oleh Sub Bagian Keuangan.

### Alur Proses

1. Sistem membuat data SPJ ketika Laporan berstatus Terverifikasi.
2. Status awal adalah **SPJ Diterima**.
3. Hanya pegawai dengan role Sub Bagian Keuangan yang terdaftar pada Unit Sub Bagian Keuangan yang dapat mengubah checklist dan status validasi.
4. Checklist meliputi Laporan, SPPD, Dokumentasi, dan Tanda Tangan.
5. Unit Sub Bagian Keuangan mengisi realisasi biaya per personel berdasarkan tiket, kuitansi, invoice, dan bukti SPJ yang disampaikan pelaksana.
6. Komponen realisasi yang diisi adalah Tiket Pesawat, Transport Bandara Asal, Transport Bandara Tujuan, Uang Transport Harian, dan Penginapan. Uang Harian tetap terkunci dari Nota Dinas yang telah disetujui.
7. Setiap rincian personel wajib ditandai sudah diperiksa sebelum Validasi SPJ dapat diselesaikan.
8. Saat pemeriksaan dimulai status menjadi **Validasi SPJ**.
9. Kekurangan mengembalikan status menjadi **SPJ Diterima** dan mewajibkan catatan perbaikan.
10. Seluruh checklist dan realisasi personel wajib lengkap sebelum status menjadi **Validasi Selesai**.
11. Pembuatan dokumen keuangan mengubah status menjadi **Proses Pembayaran**.
12. Setelah seluruh Kuitansi individual dikonfirmasi telah dibayar, status menjadi **Pembayaran Selesai**.
13. Setiap tahap yang selesai ditampilkan dengan indikator hijau.
14. Personel yang tercantum dalam Nota Dinas sumber dapat melihat hasil validasi dan pembayaran dalam mode read-only; pegawai lain tidak memperoleh akses.
15. SPJ dan dokumen keuangan turunannya wajib direkonsiliasi dengan Laporan, SPPD, SPT, dan Nota Dinas sumber. Baris yatim tidak boleh ditampilkan apabila salah satu sumber tersebut sudah tidak tersedia.
16. Tabel Validasi SPJ dan Pembayaran menampilkan nama personel dari SPPD sumber agar Unit Keuangan dapat mengenali pemilik dokumen tanpa membuka detail.

---

# BP-06 – Proses Dokumen Keuangan

## Tujuan

Menghasilkan seluruh dokumen pertanggungjawaban keuangan secara otomatis.

### Alur Proses

1. Dokumen keuangan hanya dapat dibuat setelah status **Validasi Selesai**.
2. Sistem menyelesaikan rantai referensi berdasarkan Document ID: Nota Dinas -> SPT -> SPPD -> Laporan -> SPJ.
3. Uang Harian diambil dari rincian Nota Dinas yang disetujui. Tiket Pesawat, Transport Bandara Asal/Tujuan, Uang Transport Harian, dan Penginapan diambil dari realisasi bukti SPJ yang telah diverifikasi Unit Sub Bagian Keuangan, dibatasi pada personel SPT terkait.
4. Pembuatan dokumen wajib berurutan:

   - SPBY per orang.
   - Daftar Nominatif kolektif untuk personel dalam SPT.
   - Tanda Terima per orang.
   - Kuitansi per orang.

5. Dokumen individual menyimpan referensi ke personel, SPPD individual, dan dokumen induk sebelumnya.
6. SPBY yang keliru dapat dibuat ulang oleh Unit Sub Bagian Keuangan dan menimpa dokumen SPBY lama dengan tetap mempertahankan identitas/nomor yang relevan.
7. Penerima ASN/Sekretariat menampilkan Nama dan NIP. Penerima Ketua/Anggota KPU hanya menampilkan Nama.
8. Penandatangan dokumen diambil dari Master Pejabat Penandatangan sesuai peran, termasuk PPK, Bendahara Pengeluaran, KPA, dan Pejabat Pengadaan Barang.
9. Seluruh dokumen menggunakan Template Provider dan format resmi masing-masing.
10. Setelah dana benar-benar dibayarkan, hanya pengguna role Sub Bagian Keuangan pada Unit Sub Bagian Keuangan yang dapat menekan **Tandai Pembayaran Selesai** pada Kuitansi individual.
11. Konfirmasi pembayaran menyimpan tanggal, metode, referensi opsional, petugas, nominal, dan penerima. Personel Nota Dinas dapat melihat hasilnya dalam mode read-only.
12. Keberadaan Kuitansi saja tidak menandakan pembayaran selesai.
13. Status induk SPJ berubah menjadi **Pembayaran Selesai** hanya setelah seluruh Kuitansi individual dalam SPJ tersebut telah dikonfirmasi selesai.

---

# BP-07 – Manajemen Dokumen

## Tujuan

Mengarsipkan seluruh dokumen perjalanan dinas secara digital.

### Alur Proses

1. Dokumen hasil transaksi disimpan sebagai arsip digital beserta Document ID dan referensi rantainya.
2. Arsip dapat dicari dan difilter berdasarkan nomor, personel, jenis, tanggal, serta status.
3. Akses arsip mengikuti RBAC dan scope Nota Dinas.
4. Unduhan arsip menghasilkan PDF dokumen, bukan metadata teks.
5. Cetak resmi dilakukan dari pratinjau dokumen; export DOC/XLS tersedia pada aksi dokumen yang mendukungnya.
6. Sub Bagian Keuangan mengunggah satu PDF hasil pemindaian SPJ fisik yang telah ditandatangani untuk setiap nomor Nota Dinas.
7. Riwayat Arsip SPJ menampilkan Nomor Nota Dinas, seluruh Nomor SPT dan SPPD terkait, serta personel dari lampiran Nota Dinas.
8. Upload ulang pada Nota Dinas yang sama menimpa berkas arsip sebelumnya tanpa membuat duplikasi baris.

---

# BP-08 – Rekapitulasi

## Tujuan

Menyediakan informasi rekapitulasi perjalanan dinas dan keuangan.

### Alur Proses

1. Sistem menghitung jumlah hari perjalanan setiap pegawai dari tanggal SPPD.
2. Sistem menghitung total biaya dari rincian Nota Dinas melalui relasi Document ID.
3. Dashboard dan rekapitulasi mengikuti scope role pengguna.
4. Supervisor tidak melihat nominal pembayaran yang dibatasi untuk fungsi keuangan.
5. Rekapitulasi dapat dicetak atau diekspor sesuai permission pengguna.
6. Status dan nominal **Pembayaran Selesai** hanya dihitung dari Kuitansi yang telah dikonfirmasi selesai oleh Unit Sub Bagian Keuangan.
7. Pada akun role Pegawai, Rekapitulasi otomatis dibatasi kepada `pegawaiId` sesi. Filter pegawai ditampilkan sebagai identitas hanya-baca dan tidak menyediakan pilihan seluruh pegawai.
8. Sinkronisasi Rekapitulasi dengan data Keuangan hanya dilakukan setelah sumber Laporan dan SPPD selesai dimuat agar snapshot pembayaran tidak dianggap kehilangan rantai dokumen pada saat pergantian akun atau pemuatan halaman.

---

# BP-09 – Workflow Approval Nota Dinas dan SPT

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

Workflow approval terpusat berlaku untuk Nota Dinas dan SPT. Verifikasi Laporan serta Validasi SPJ dan Pembayaran menggunakan status khusus pada modul masing-masing.

Aturan otoritas:

- Nota Dinas: Sekretaris/PLT/PLH Sekretaris.
- SPT Sekretariat: Sekretaris/PLT/PLH Sekretaris atau Kasubbag/Kepala Sub Bagian pembuat/penandatangan Nota Dinas sumber.
- SPT Komisioner: Ketua KPU atau Kasubbag/Kepala Sub Bagian pembuat/penandatangan Nota Dinas sumber; penandatangan dokumen tetap Ketua KPU.
- Keputusan penolakan/perlu revisi wajib memiliki catatan.
- Setiap keputusan menyimpan riwayat approval, notifikasi, dan audit log.
- Daftar `/approval` membaca langsung seluruh dokumen Menunggu Approval sesuai identitas pejabat pada sesi login; pembukaan Dashboard bukan prasyarat kemunculan dokumen.
- Tugas approval Nota Dinas dan SPT pada Dashboard mengarah ke `/approval`, sedangkan tugas penyusunan/perbaikan dokumen mengarah ke modul dokumen terkait.
- Jika terdapat lebih dari satu record Sekretaris aktif pada tingkat kewenangan yang sama, akun yang identitas NIP/namanya cocok dengan salah satu record tersebut tetap memperoleh dokumen approval. Akun dengan Master Jabatan Sekretaris yang sesuai menjadi fallback bagi record lama bernama generik. PLT aktif tetap diprioritaskan di atas PLH dan Sekretaris reguler.
- Pembuat Nota Dinas atau SPT menerima tugas personal pada Dashboard selama dokumen masih Draft/Nomor Diambil, Menunggu Approval, atau Perlu Revisi. Tugas Perlu Revisi wajib menampilkan catatan pejabat dan mengarahkan pembuat ke modul dokumen terkait.

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
10. Ditemukan potensi personel dengan perjalanan dinas yang bertabrakan pada Nota Dinas Disetujui/Selesai.
11. Dokumen buatan pengguna belum selesai, sedang menunggu persetujuan, atau dikembalikan untuk direvisi.

Notifikasi disimpan secara persisten, tetap tersedia setelah refresh, dapat ditandai dibaca, dan dapat dihapus.

## 6.2 Aturan Lintas Proses

1. Setiap perubahan master, transaksi, approval, generate, print, export, login, dan logout dicatat pada Audit Log.
2. Seluruh preview dokumen memakai Template Provider yang sama untuk header, footer, margin, logo, kop, font, dan alignment; desain khusus tiap jenis dokumen tetap dipertahankan.
3. Penomoran menggunakan **Nomor Berikutnya** per jenis dan tahun dengan validasi nomor ganda serta locking mock. Nilai `1` berarti nomor yang akan diterbitkan adalah `001`, kemudian sistem otomatis melanjutkan ke `002`.
4. Administrator dapat mengubah Nomor Berikutnya, melakukan booking nomor, membatalkan booking, dan menggunakan kembali nomor dokumen terakhir yang dilepas karena dokumen dibatalkan atau dihapus.
5. Booking nomor tinggi tidak otomatis melompati nomor berurutan yang masih tersedia; perubahan titik mulai dilakukan melalui Nomor Berikutnya oleh Administrator.
6. Riwayat Nota Dinas berstatus **Terpakai** tanpa Nota Dinas sumber direkonsiliasi menjadi **Dibatalkan**. Riwayat **Booking** tidak dibersihkan otomatis dan hanya dapat dibatalkan manual oleh Administrator.
7. Halaman Pengaturan wajib menampilkan nomor lengkap yang benar-benar akan diterbitkan setelah mempertimbangkan format, Nomor Berikutnya, dokumen existing, dan Booking aktif.
8. Backend belum tersedia sehingga persistence transaksi, notifikasi, riwayat, locking, dan audit masih menggunakan mekanisme mock pada penyimpanan browser. Data terstruktur ringan menggunakan localStorage, sedangkan Laporan beserta foto dokumentasi dan file Arsip SPJ menggunakan IndexedDB agar tidak dibatasi kapasitas localStorage. Keterbatasan teknis ini tidak mengubah business rule pada PRD.
9. Selama lingkungan masih berupa demo tanpa backend/database terpusat, Administrator dapat mengekspor dan mengimpor satu paket data demo untuk memindahkan salinan data antarperangkat.
10. Paket data demo mencakup data SIMPENAS pada localStorage, Laporan beserta dokumentasinya pada IndexedDB, dan file PDF Arsip SPJ pada IndexedDB, tetapi tidak boleh memuat sesi login aktif.
11. Import wajib memvalidasi format dan versi paket sebelum mengubah data, mengganti data demo pada perangkat tujuan, menyediakan rollback apabila proses gagal, dan mengakhiri sesi aktif agar pengguna login kembali menggunakan akun dari paket hasil import.
12. Export/Import Data Demo bukan mekanisme sinkronisasi; setiap perangkat tetap menyimpan salinan mandiri dan perubahan sesudah import tidak diperbarui otomatis ke perangkat lain.
13. Akses Export/Import Data Demo hanya diberikan kepada role Administrator dan file paket wajib diperlakukan sebagai data operasional terbatas.
14. Fitur Export/Import Data Demo bersifat sementara dan wajib dihapus atau dinonaktifkan ketika backend dan database terpusat produksi telah tersedia.
15. Aksi hapus Nota Dinas, SPT, SPPD, Laporan Perjalanan, SPBY, Daftar Nominatif, Tanda Terima, dan Kuitansi hanya dapat dilakukan oleh Administrator.
16. Tombol hapus dokumen keuangan ditampilkan per dokumen kepada Administrator. Penghapusan ditolak selama dokumen masih menjadi referensi dokumen keuangan turunannya.

# 7. Business Rules

Business Rules merupakan aturan yang wajib dipatuhi oleh sistem dalam menjalankan seluruh proses bisnis.

---

# BR-01 Penomoran Dokumen

1. Nomor Nota Dinas dan SPT diperoleh melalui layanan **Ambil Nomor**.
2. Nomor SPPD diterbitkan secara independen untuk setiap dokumen/personel menggunakan konfigurasi dan running number SPPD.
3. Nomor bersifat unik per jenis dan tahun serta dilindungi mekanisme locking.
4. SPT Sekretariat dan SPT Komisioner merupakan dokumen berbeda dan menggunakan nomor berbeda.
5. Administrator dapat melakukan booking nomor, membatalkan booking, serta mengubah Nomor Berikutnya sebagai titik mulai baru; nilai yang dimasukkan merupakan nomor yang akan dicoba diterbitkan, bukan nomor terakhir yang telah digunakan.
6. Nomor dari Nota Dinas atau SPT yang berhasil dihapus oleh Administrator dilepas dan dapat digunakan kembali jika belum dipakai atau dibooking dokumen lain.
7. Nomor dokumen Disetujui hanya dapat dikoreksi melalui kewenangan Administrator dan wajib tercatat pada audit.
8. Nomor Nota Dinas yang direservasi pada form baru wajib dilepas ketika form dibatalkan sebelum disimpan.
9. Nomor urut Nota Dinas berikutnya dapat diterbitkan setelah reservasi sebelumnya tersimpan sebagai Nota Dinas, tanpa menunggu approval Sekretaris; reservasi yang belum disimpan tetap memblokir dan booking Administrator dikelola terpisah.
10. Jika tidak ada Nota Dinas tersimpan tetapi masih terdapat satu riwayat `Terpakai` tanpa dokumen, sistem merekonsiliasi reservasi yatim tersebut dan menggunakan kembali nomor yang sama pada permintaan berikutnya.
11. SPBY, Daftar Nominatif, Tanda Terima, dan Kuitansi memiliki konfigurasi serta running number masing-masing per tahun. Nomor diterbitkan otomatis ketika dokumen berhasil di-generate, memperhitungkan dokumen existing dan Booking aktif, serta dilepas ketika dokumen dihapus sesuai dependency rantai keuangan.
12. Nomor SPPD diterbitkan otomatis ketika SPPD individual berhasil disimpan, memperhitungkan nomor existing dan Booking aktif. Membatalkan form sebelum disimpan tidak menggunakan nomor; penghapusan SPPD oleh Administrator melepaskan nomor agar dapat digunakan kembali sesuai Numbering Service.

---

# BR-02 Nota Dinas

1. Nota Dinas dibuat Administrator atau Supervisor/Kasubbag dan ditandatangani Kasubbag pembuat.
2. Nota Dinas boleh memuat lebih dari satu personel dan boleh mencampur Sekretariat dengan Komisioner.
3. Lampiran menjadi dasar personel SPT dan rincian biaya seluruh dokumen keuangan.
4. Tanggal berangkat, tanggal kembali, dan lokasi tujuan wajib tersedia untuk pengendalian jadwal.
5. Benturan jadwal personel dengan Nota Dinas Disetujui/Selesai menghasilkan peringatan dan notifikasi, tetapi tidak memblokir penyimpanan.
6. Approval Nota Dinas dibatasi kepada Sekretaris/PLT/PLH Sekretaris.
7. Field `Dari` pada Nota Dinas baru wajib berasal dari Master Jabatan pegawai yang terhubung ke sesi login dan tidak dapat diubah manual; nilai default `Kepada` adalah Sekretaris KPU Kabupaten Gorontalo.
8. Pejabat penandatangan Nota Dinas baru wajib mengikuti Kepala Sub Bagian/Kasubbag yang terhubung dengan akun login melalui NIP atau identitas pegawai; field hanya-baca dan tidak menyediakan dropdown. Snapshot penandatangan dokumen lama tetap dipertahankan ketika diedit.
9. Tanggal pada preview dan dokumen cetak Nota Dinas menggunakan format hari dua digit, nama bulan Indonesia, dan tahun, misalnya `03 Juli 2026`; nilai tanggal sumber tetap disimpan dalam format data ISO.
10. Pada seluruh jenis perjalanan, setiap komponen biaya yang tersedia pada Lampiran Nota Dinas memiliki volume manual per personel dan dihitung dengan rumus `tarif x volume`. Dalam Kota menyediakan volume Uang Harian dan Transport; Luar Kota menyediakan volume Uang Harian, Transport, dan Penginapan; Luar Daerah menyediakan volume Uang Harian Paket Meeting, Uang Harian Full, Transport, Penginapan, Tiket Pesawat, Transport Bandara Asal, dan Transport Bandara Tujuan. Durasi perjalanan hanya menjadi informasi referensi dan tidak mengunci volume komponen mana pun. Sistem dapat memberi nilai awal yang disarankan saat personel dipilih, tetapi perubahan durasi tidak mengubah volume biaya yang telah diisi. Setiap tarif, volume, subtotal, dan jumlah akhir wajib terlihat pada lampiran serta preview/cetak; komponen bernilai nol tidak dicetak.
11. Seluruh nominal pada Lampiran Nota Dinas merupakan nilai usulan berdasarkan standar biaya untuk memperoleh persetujuan pimpinan, bukan otomatis nilai yang dibayarkan pada dokumen keuangan.
12. Label pengiriman status dan notifikasi Nota Dinas wajib menyebut Sekretaris, PLH. Sekretaris, atau PLT. Sekretaris sesuai pejabat aktif yang ditetapkan Administrator pada Master Pejabat Penandatangan dan periode tanggal dokumen. PLH/PLT aktif diprioritaskan sebagai pengganti; jika tidak ada pengganti aktif, tujuan kembali kepada Sekretaris aktif.
13. Form Nota Dinas yang memuat lampiran dinamis wajib memiliki area scroll vertikal di dalam dialog agar seluruh field dan tombol Simpan/Batal tetap dapat dijangkau tanpa memperkecil tampilan browser.
14. Peringatan benturan perjalanan ditampilkan dengan warna merah dan disimpan sebagai snapshot pada Nota Dinas. Tabel Nota Dinas wajib menandai dokumen yang memiliki potensi perjalanan ganda beserta nama personel terkait; snapshot diperbarui setiap dokumen disimpan ulang.
15. Nota Dinas wajib memilih satu sumber anggaran DIPA. Total usulan Nota Dinas berstatus Menunggu Approval, Disetujui, Perlu Revisi, atau Selesai menjadi komitmen pagu pada DIPA tersebut.
16. Nota Dinas yang menyebabkan total komitmen melampaui pagu tetap dapat disimpan sebagai Draft/Nomor Diambil, tetapi tidak dapat dikirim untuk approval sampai pengguna memilih sumber DIPA yang masih mencukupi atau mengurangi usulan.
17. Dokumen cetak Nota Dinas menampilkan Kode Akun DIPA sebagai baris kedua judul Lampiran Rincian Personil & Anggaran.

---

# BR-03 Surat Perintah Tugas (SPT)

1. SPT wajib memiliki `notaDinasId` dari Nota Dinas Disetujui.
2. Pegawai hanya dapat membuat/melihat SPT jika tercantum pada Nota Dinas sumber.
3. Personel diambil otomatis dan dipisahkan menjadi kelompok Sekretariat atau Komisioner; kedua kelompok tidak boleh berada pada satu SPT.
4. Menimbang, Dasar, dan Uraian Tugas bersifat dinamis dan dapat digunakan kembali untuk SPT lain dalam Nota Dinas yang sama.
5. SPT Sekretariat ditandatangani Sekretaris/PLT/PLH Sekretaris; SPT Komisioner ditandatangani Ketua KPU.
6. Approval SPT Sekretariat dilakukan Sekretaris/PLT/PLH Sekretaris atau Kasubbag sumber, sedangkan SPT Komisioner dilakukan Ketua KPU atau Kasubbag sumber; Kasubbag sumber wajib merupakan pembuat/penandatangan Nota Dinas terkait.
7. SPT dalam satu Nota Dinas dapat dibuat dan diberi nomor berurutan tanpa menunggu approval saudara dokumennya.
8. Nomor SPT yang diambil pada form baru merupakan reservasi sementara. Menutup atau membatalkan form sebelum SPT disimpan wajib melepaskan reservasi agar nomor yang sama dapat digunakan kembali. Nomor SPT tersimpan tidak dilepas ketika form edit ditutup, tetapi wajib dilepas jika dokumennya benar-benar dihapus oleh Administrator; nomor `Booking` Administrator tidak boleh ikut dilepas.
9. Pembuat SPT pertama menjadi pengelola rangkaian berdasarkan `notaDinasId`. Hanya pengelola tersebut atau Administrator yang dapat memulai SPT kelompok berikutnya, SPPD individual, dan Laporan dari Nota Dinas yang sama; personel lain menunggu Nota Dinas baru Disetujui untuk memperoleh kesempatan pembuatan baru.

---

# BR-04 Surat Perintah Perjalanan Dinas (SPPD)

1. SPPD wajib memiliki `sptId` dari SPT Disetujui/Selesai.
2. SPPD dibuat satu dokumen per orang.
3. Setiap SPPD memiliki nomor unik dari Numbering Service SPPD dan tetap menyimpan `sptId` sebagai referensi SPT sumber.
4. Field perjalanan selain nomor dan personel disinkronkan untuk seluruh SPPD dengan `sptId` yang sama.
5. Lama perjalanan dihitung otomatis dan akun anggaran berasal dari Master DIPA.
6. Penandatangan Halaman 1 dan Halaman 2 adalah PPK untuk semua kategori personel.
7. Blok perjalanan dan penandatangan tujuan pada Halaman 2 bersifat dinamis.
8. Pengelola SPPD mengikuti pembuat SPT pertama pada `notaDinasId` sumber. Personel lain yang tercantum pada Nota Dinas hanya melihat status dan pratinjau, sementara pengelola tetap dapat menerbitkan SPPD satu per orang sampai seluruh personel SPT lengkap.

---

# BR-05 Laporan Perjalanan Dinas

1. Satu nomor SPT hanya memiliki satu Laporan Perjalanan.
2. Laporan memuat seluruh personel SPT dan menyediakan tanda tangan manual masing-masing pelaksana.
3. Data dasar SPT dan tempat/waktu SPPD terisi otomatis namun dapat disunting.
4. Dokumentasi dapat terdiri dari beberapa foto tanpa caption pada output, maksimum 100 MB per berkas.
5. Supervisor wajib memverifikasi laporan sebelum pembentukan SPJ.
6. Pembuatan Laporan hanya tersedia bagi pengelola rangkaian `notaDinasId` atau Administrator dan tetap dibatasi satu Laporan per nomor SPT.

---

# BR-06 Validasi SPJ dan Pembayaran

Status SPJ terdiri dari:

- SPJ Diterima
- Validasi SPJ
- Validasi Selesai
- Proses Pembayaran
- Pembayaran Selesai

Perubahan status hanya dapat dilakukan oleh pegawai Unit Sub Bagian Keuangan. Personel Nota Dinas sumber memperoleh akses lihat. Tabel ringkasan wajib menampilkan nomor dan nama personel SPPD sumber. Dokumen keuangan hanya dapat diproses setelah status **Validasi Selesai**. Data SPJ wajib dihapus dari daftar mock apabila Laporan Terverifikasi atau rantai SPPD-SPT-Nota Dinas sumbernya sudah tidak tersedia.

---

# BR-07 Dokumen Keuangan

1. Relasi sumber keuangan menggunakan Document ID lengkap, bukan kecocokan personel.
2. SPBY, Tanda Terima, dan Kuitansi dibuat per orang; Daftar Nominatif dibuat kolektif untuk personel SPT.
3. Urutan prasyarat adalah SPBY -> Daftar Nominatif -> Tanda Terima -> Kuitansi.
4. Uang Harian berasal dari rincian Nota Dinas yang disetujui. Tiket Pesawat, Transport Bandara Asal/Tujuan, Uang Transport Harian, dan Penginapan berasal dari realisasi bukti SPJ yang diinput serta diverifikasi Unit Sub Bagian Keuangan per personel.
5. SPBY dapat dibuat ulang oleh Unit Sub Bagian Keuangan untuk menimpa dokumen yang keliru.
6. Seluruh dokumen menggunakan Template Provider dan master penandatangan resmi.
7. SPBY, Daftar Nominatif, Tanda Terima, dan Kuitansi menggunakan layanan penomoran terpusat dengan format, prefix, suffix, tahun, padding, Nomor Berikutnya, locking, booking, dan riwayat yang terpisah untuk setiap jenis dokumen.

---

# BR-08 Rekapitulasi

1. Jumlah hari perjalanan dihitung otomatis dari SPPD.
2. Sistem membedakan total usulan dari Nota Dinas dan total realisasi pembayaran dari rincian SPJ tervalidasi.
3. Data diperbarui secara real-time setelah transaksi selesai.
4. Rekapitulasi dapat dicetak atau diekspor sesuai hak akses.
5. Nominal pembayaran per pegawai bersumber dari `rincian.jumlah` Kuitansi individual berstatus Selesai yang memiliki snapshot konfirmasi pembayaran; pencocokan menggunakan Document ID dan `pegawaiId`, bukan total usulan Nota Dinas.
6. Role Pegawai hanya dapat melihat rekap miliknya sendiri dan tidak dapat mengganti filter pegawai.
7. Pencocokan pembayaran wajib mempertahankan kompatibilitas dokumen existing melalui relasi SPPD/SPT pada dokumen atau induk SPJ, tanpa menggandakan nominal pembayaran.

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

| ID     | Requirement                                                                                                                                      |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-001 | Pengguna dapat login menggunakan username dan password.                                                                                          |
| FR-002 | Sistem memverifikasi kredensial pengguna.                                                                                                        |
| FR-003 | Sistem menampilkan dashboard sesuai role.                                                                                                        |
| FR-004 | Pengguna dapat logout.                                                                                                                           |
| FR-005 | Pengguna dapat mengubah password.                                                                                                                |
| FR-006 | Sistem mencatat aktivitas login dan logout.                                                                                                      |
| FR-087 | Setiap akun login terhubung ke satu pegawai; role dan identitas sesi diturunkan otomatis dari Master Pegawai tanpa pemilih role pada form login. |

---

# 8.2 Dashboard

| ID     | Requirement                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-007 | Sistem menampilkan dashboard sesuai role, identitas pegawai, dan scope data pengguna.                                                                                                                                                                                                                                                                                                                            |
| FR-008 | Dashboard menghitung statistik perjalanan dinas dan keuangan dari data transaksi aktual, bukan nilai hardcoded.                                                                                                                                                                                                                                                                                                  |
| FR-009 | Dashboard menampilkan notifikasi.                                                                                                                                                                                                                                                                                                                                                                                |
| FR-010 | Dashboard menampilkan aktivitas terbaru dari Audit Log aktual.                                                                                                                                                                                                                                                                                                                                                   |
| FR-098 | Dashboard menampilkan panel Tugas Perjalanan Saya berdasarkan identitas pembuat dokumen, personel Nota Dinas Disetujui/Selesai, dan kewenangan approval; panel memperlihatkan dokumen buatan yang belum selesai, catatan Perlu Revisi, serta tahap dokumen berikutnya sampai Pembayaran Selesai tanpa menambah menu sidebar. Tugas approval Nota Dinas dan SPT bagi pejabat berwenang membuka route `/approval`. |
| FR-122 | Dashboard khusus Administrator menampilkan seluruh pegawai dalam tabel dengan kolom No Urut, Nama, NIP, Jumlah Hari SPPD, dan Jumlah Yang Dibayarkan berdasarkan transaksi aktual tahun berjalan.                                                                                                                                                                                                                |
| FR-123 | Dashboard setiap akun yang terhubung ke Master Pegawai menampilkan rekap personal berupa Nama, NIP, Jumlah Hari SPPD, dan Jumlah Yang Dibayarkan milik pegawai pada sesi aktif; akun non-Administrator tidak boleh melihat rekap pegawai lain.                                                                                                                                                                   |

---

# 8.3 Master Data

| ID     | Requirement                                                                                                                                                                                                                                                                                                                |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-011 | Sistem mengelola data Pegawai.                                                                                                                                                                                                                                                                                             |
| FR-012 | Sistem mengelola Jabatan.                                                                                                                                                                                                                                                                                                  |
| FR-013 | Sistem mengelola Unit Kerja.                                                                                                                                                                                                                                                                                               |
| FR-014 | Sistem mengelola Pangkat/Golongan dan menerima kode Golongan mulai dari satu karakter.                                                                                                                                                                                                                                     |
| FR-015 | Sistem mengelola Master Anggaran DIPA dengan Kode KRO, Klasifikasi Rincian Output (KRO), Kode Akun, Akun Perjalanan Dinas, Pagu Anggaran, dan Tahun Anggaran; tabel menampilkan gabungan `Kode KRO.Kode Akun` pada satu kolom Kode Akun serta Realisasi yang dihitung otomatis dari Kuitansi berstatus Pembayaran Selesai. |
| FR-119 | Realisasi Master Anggaran DIPA tidak dapat diinput manual dan wajib dihitung dari total pembayaran selesai yang menggunakan Kode Akun DIPA terkait.                                                                                                                                                                        |
| FR-016 | Sistem mengelola Pejabat Penandatangan.                                                                                                                                                                                                                                                                                    |
| FR-017 | Sistem mengelola Standar Biaya Masukan Akun Perjalanan Dinas.                                                                                                                                                                                                                                                              |
| FR-059 | Administrator dapat menentukan kategori dan role aplikasi setiap pegawai.                                                                                                                                                                                                                                                  |
| FR-060 | NIP dan Pangkat wajib untuk ASN/Sekretariat serta opsional untuk Ketua/Anggota KPU.                                                                                                                                                                                                                                        |
| FR-061 | Administrator dapat menambah peran dokumen pada Master Pejabat Penandatangan.                                                                                                                                                                                                                                              |
| FR-094 | Sistem menggunakan satu aturan urutan tampilan pegawai: Ketua KPU, Anggota KPU, Sekretaris, Kepala Sub Bagian/Kasubbag, lalu Staf; Staf diurutkan PNS `I/a`–`IV/d` berdasarkan pangkat tertinggi, kemudian PPPK `I`–`XI` berdasarkan jenjang tertinggi, lalu nama jika golongan sama.                                      |

---

# 8.4 Nota Dinas

| ID     | Requirement                                                                                                                                                                                                                                                                |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-018 | Supervisor dan Admin dapat membuat Nota Dinas.                                                                                                                                                                                                                             |
| FR-019 | Sistem menyediakan fitur Ambil Nomor.                                                                                                                                                                                                                                      |
| FR-020 | Sistem menghasilkan nomor Nota Dinas secara otomatis.                                                                                                                                                                                                                      |
| FR-021 | Sistem menyediakan tiga jenis Nota Dinas.                                                                                                                                                                                                                                  |
| FR-022 | Sistem membentuk lampiran sesuai jenis Nota Dinas.                                                                                                                                                                                                                         |
| FR-023 | Sistem mengambil Standar Biaya dari Master Standar Biaya Masukan.                                                                                                                                                                                                          |
| FR-024 | Sistem menghitung seluruh rincian biaya secara otomatis.                                                                                                                                                                                                                   |
| FR-025 | Sistem menyimpan Nota Dinas sebagai referensi SPT.                                                                                                                                                                                                                         |
| FR-062 | Sistem menyimpan tanggal perjalanan dan lokasi tujuan Nota Dinas.                                                                                                                                                                                                          |
| FR-063 | Sistem memperingatkan benturan jadwal personel terhadap Nota Dinas Disetujui/Selesai.                                                                                                                                                                                      |
| FR-064 | Sistem mengirim Nota Dinas untuk approval Sekretaris/PLT/PLH Sekretaris.                                                                                                                                                                                                   |
| FR-086 | Sistem menggunakan kembali nomor Nota Dinas dari form baru yang dibatalkan atau Nota Dinas yang dihapus, menahan nomor berikutnya hanya sampai reservasi sebelumnya disimpan, serta merekonsiliasi reservasi yatim ketika penyimpanan Nota Dinas kosong.                   |
| FR-088 | Sistem mengisi dan mengunci `Dari` Nota Dinas baru berdasarkan jabatan pegawai pada sesi login serta mengisi default `Kepada` dengan Sekretaris KPU Kabupaten Gorontalo.                                                                                                   |
| FR-089 | Sistem menyediakan tombol hapus per dokumen transaksi utama dan dokumen keuangan hanya kepada Administrator, dengan validasi relasi dokumen turunan sebelum penghapusan.                                                                                                   |
| FR-093 | Sistem mengunci pejabat penandatangan Nota Dinas berdasarkan akun pegawai yang login, tanpa dropdown pilihan, dan mempertahankan snapshot penandatangan ketika dokumen lama diedit.                                                                                        |
| FR-095 | Sistem menyediakan volume manual per personel untuk setiap komponen biaya yang tampil sesuai jenis Nota Dinas dan menghitung `tarif x volume`; durasi perjalanan tidak mengunci volume Uang Harian, Meeting, Full, Transport, Penginapan, Tiket, maupun Transport Bandara. |
| FR-097 | Sistem menampilkan tujuan pengiriman approval Nota Dinas secara dinamis sebagai Sekretaris, PLH. Sekretaris, atau PLT. Sekretaris berdasarkan status, periode, peran, dan pemetaan Master Pejabat Penandatangan yang ditetapkan Administrator.                             |
| FR-103 | Sistem menyediakan dialog Nota Dinas yang scrollable, menampilkan peringatan benturan perjalanan berwarna merah, menyimpan snapshot benturan saat dokumen disimpan, dan menampilkan penanda merah beserta nama personel terkait pada tabel.                                |
| FR-120 | Nota Dinas wajib memilih `dipaId` dari Master Anggaran DIPA; sistem menolak pengiriman ke Sekretaris/PLH/PLT apabila total usulan dokumen ditambah komitmen Nota Dinas lain pada sumber yang sama melebihi pagu, serta mencetak Kode Akun DIPA di bawah judul lampiran.    |
| FR-121 | Tabel Nota Dinas memisahkan Nomor dan Perihal serta Nota Dinas, SPT, dan SPPD menyediakan aksi Export Data ke file Excel sesuai data tabel yang dapat dilihat pengguna.                                                                                                    |

---

# 8.5 Surat Perintah Tugas (SPT)

| ID     | Requirement                                                                                                                                                                                                                                                                                              |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-026 | Sistem membuat SPT berdasarkan Nota Dinas.                                                                                                                                                                                                                                                               |
| FR-027 | Sistem mengambil personil dari lampiran Nota Dinas.                                                                                                                                                                                                                                                      |
| FR-028 | Sistem menyediakan field dinamis untuk Menimbang.                                                                                                                                                                                                                                                        |
| FR-029 | Sistem menyediakan field dinamis untuk Dasar.                                                                                                                                                                                                                                                            |
| FR-030 | Sistem menyediakan field dinamis untuk Kegiatan.                                                                                                                                                                                                                                                         |
| FR-031 | Sistem menyediakan fitur Ambil Nomor SPT.                                                                                                                                                                                                                                                                |
| FR-032 | Sistem mengirim SPT ke proses approval.                                                                                                                                                                                                                                                                  |
| FR-065 | Sistem memisahkan SPT Sekretariat dan SPT Komisioner dari Nota Dinas campuran.                                                                                                                                                                                                                           |
| FR-066 | Sistem menerapkan penandatangan SPT sesuai kelompok personel; approval SPT Komisioner tersedia bagi Ketua KPU atau Kasubbag sumber, dan kewenangan Kasubbag untuk seluruh SPT dibatasi hanya kepada Kasubbag pembuat/penandatangan Nota Dinas sumber.                                                    |
| FR-067 | Sistem menggunakan kembali Menimbang, Dasar, dan Uraian untuk SPT lanjutan pada Nota Dinas yang sama.                                                                                                                                                                                                    |
| FR-068 | Sistem mengizinkan penomoran SPT lanjutan dalam Nota Dinas yang sama tanpa menunggu approval SPT sebelumnya.                                                                                                                                                                                             |
| FR-101 | Sistem menerapkan lifecycle reservasi nomor SPT seperti Nota Dinas: nomor dilepas saat form baru ditutup/dibatalkan sebelum disimpan atau ketika SPT dihapus oleh Administrator, reservasi yatim lama direkonsiliasi, dan Booking Administrator tetap dipertahankan.                                     |
| FR-108 | Dokumen cetak SPT menggunakan Bookman Old Style; hanya nama KOP Komisi Pemilihan Umum Kabupaten Gorontalo yang dicetak bold, sedangkan isi lainnya menggunakan bobot regular.                                                                                                                            |
| FR-124 | Sistem menetapkan pembuat SPT pertama sebagai pengelola tunggal rangkaian berdasarkan `notaDinasId`; tombol Buat SPT/SPPD/Laporan dinonaktifkan bagi personel lain pada Nota Dinas yang sama dan tersedia kembali secara independen ketika personel tercantum pada Nota Dinas baru yang telah Disetujui. |

---

# 8.6 Surat Perintah Perjalanan Dinas (SPPD)

| ID     | Requirement                                                                                                                                                                                                                                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-033 | Sistem membuat SPPD berdasarkan SPT yang disetujui.                                                                                                                                                                                                                                                                       |
| FR-034 | Sistem mengambil personil secara otomatis dari SPT.                                                                                                                                                                                                                                                                       |
| FR-035 | Sistem menerbitkan satu nomor SPPD unik untuk setiap SPPD individual melalui Numbering Service SPPD saat dokumen berhasil disimpan.                                                                                                                                                                                       |
| FR-036 | Sistem menghitung lama perjalanan secara otomatis.                                                                                                                                                                                                                                                                        |
| FR-037 | Sistem menyimpan data transportasi sebagai data transaksi.                                                                                                                                                                                                                                                                |
| FR-038 | Sistem menyimpan tujuan sebagai data transaksi.                                                                                                                                                                                                                                                                           |
| FR-039 | Sistem mewajibkan pemilihan akun DIPA.                                                                                                                                                                                                                                                                                    |
| FR-069 | Sistem membuat satu SPPD untuk satu orang.                                                                                                                                                                                                                                                                                |
| FR-070 | Sistem menyinkronkan field perjalanan seluruh SPPD dengan SPT yang sama.                                                                                                                                                                                                                                                  |
| FR-071 | Sistem menyediakan SPPD Halaman 2 dengan blok Romawi dinamis.                                                                                                                                                                                                                                                             |
| FR-072 | Sistem menetapkan PPK sebagai penandatangan SPPD seluruh kategori personel.                                                                                                                                                                                                                                               |
| FR-099 | Personel yang memulai rangkaian menjadi pengelola SPT/SPPD/Laporan pada referensi yang sama; personel lain dan Supervisor/Kasubbag bukan pemilik hanya memperoleh akses lihat status serta dokumen, kecuali Administrator.                                                                                                |
| FR-105 | Sistem mengelola status SPPD secara otomatis sebagai Draft, Diproses, Selesai, dan Diarsipkan berdasarkan kelengkapan SPPD individual serta upload Arsip SPJ; SPPD tidak masuk workflow approval terpusat.                                                                                                                |
| FR-109 | Layout cetak SPPD menghilangkan border luar Halaman 1, menjaga indent baris lanjutan field, menggunakan nama instansi ringkas pada poin 9a, memisahkan nomor/tanggal ST pada poin 10, menjaga setiap blok Halaman 2 tetap utuh saat mengalir pada kertas F4, dan membolehkan pengguna menyesuaikan skala cetak Halaman 2. |
| FR-126 | Nomor SPPD tidak disinkronkan antar-personel dalam SPT yang sama; preview nomor tidak mengonsumsi running number, dokumen existing mempertahankan nomornya, dan nomor SPPD yang dihapus dapat dilepas melalui Numbering Service.                                                                                          |

---

# 8.7 Laporan Perjalanan Dinas

| ID     | Requirement                                                                                                                                                                                           |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-040 | Pegawai dapat mengisi laporan perjalanan dinas.                                                                                                                                                       |
| FR-041 | Sistem mendukung upload banyak foto dokumentasi.                                                                                                                                                      |
| FR-042 | Sistem menerima foto dokumentasi maksimal 100 MB per berkas tanpa caption pada output.                                                                                                                |
| FR-043 | Sistem menyediakan area tanda tangan manual seluruh personel SPT.                                                                                                                                     |
| FR-044 | Supervisor dapat memverifikasi laporan.                                                                                                                                                               |
| FR-073 | Sistem membatasi satu laporan untuk satu nomor SPT.                                                                                                                                                   |
| FR-074 | Sistem mengambil data dasar dari SPT dan tempat/waktu dari SPPD terkait.                                                                                                                              |
| FR-106 | Sistem menyediakan Kalimat Penutup yang dicetak setelah poin F dan sejajar dengan margin huruf F.                                                                                                     |
| FR-107 | Sistem menempatkan Poin G Dokumentasi setelah bagian penandatanganan dan selalu memulainya pada lembar cetak baru yang terpisah dari Poin A–F.                                                        |
| FR-110 | Dokumen cetak Laporan menggunakan Bookman Old Style dan menerapkan margin atas, bawah, kiri, serta kanan berdasarkan Pengaturan Template pada setiap lembar F4 tanpa mengubah page break Dokumentasi. |
| FR-111 | Bagian penandatanganan Laporan menampilkan NIP untuk ASN/Sekretariat, sedangkan Ketua/Anggota KPU menampilkan Jabatan dari Master Jabatan tanpa NIP.                                                  |
| FR-112 | KOP Laporan Komisioner menempatkan logo di atas nama instansi, sedangkan KOP Laporan Sekretariat mempertahankan logo di sisi kiri.                                                                    |
| FR-113 | Tabel Laporan menampilkan catatan perbaikan Supervisor di bawah status Perlu Revisi agar tetap terlihat setelah refresh.                                                                              |

---

# 8.8 Dokumen Keuangan

| ID     | Requirement                                                                                                                                                                                                                                                           |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-045 | Keuangan dapat melakukan Validasi SPJ.                                                                                                                                                                                                                                |
| FR-046 | Sistem menghasilkan SPBY otomatis.                                                                                                                                                                                                                                    |
| FR-047 | Sistem menghasilkan Daftar Nominatif otomatis.                                                                                                                                                                                                                        |
| FR-048 | Sistem menghasilkan Tanda Terima otomatis.                                                                                                                                                                                                                            |
| FR-049 | Sistem menghasilkan Kuitansi otomatis.                                                                                                                                                                                                                                |
| FR-050 | Sistem menggunakan Template Dokumen resmi untuk seluruh dokumen keuangan.                                                                                                                                                                                             |
| FR-075 | Hanya pegawai Unit Sub Bagian Keuangan yang dapat mengubah status Validasi SPJ dan generate dokumen keuangan.                                                                                                                                                         |
| FR-076 | Personel Nota Dinas dapat melihat hasil validasi dan dokumen keuangannya dalam mode read-only.                                                                                                                                                                        |
| FR-077 | Sistem menghubungkan seluruh dokumen keuangan menggunakan Document ID.                                                                                                                                                                                                |
| FR-078 | Sistem membuat SPBY, Tanda Terima, dan Kuitansi per orang serta Daftar Nominatif secara kolektif.                                                                                                                                                                     |
| FR-079 | Unit Sub Bagian Keuangan dapat membuat ulang SPBY untuk menimpa dokumen sebelumnya.                                                                                                                                                                                   |
| FR-083 | Hanya Unit Sub Bagian Keuangan yang dapat mengonfirmasi pembayaran Kuitansi individual sebagai Pembayaran Selesai; personel terkait melihat status dan detailnya secara read-only.                                                                                    |
| FR-084 | Master Pejabat Penandatangan menyimpan periode berlaku dan pemetaan jenis dokumen; dokumen transaksi menyimpan snapshot identitas penandatangan saat dibuat.                                                                                                          |
| FR-090 | Sistem menampilkan workflow Validasi SPJ dan Pembayaran dalam lima tahap, memberi indikator hijau pada tahap selesai, serta merekonsiliasi baris SPJ dengan rantai dokumen sumber.                                                                                    |
| FR-096 | Unit Sub Bagian Keuangan dapat mengisi serta memverifikasi realisasi Tiket Pesawat, Transport Bandara Asal/Tujuan, Uang Transport Harian, dan Penginapan per personel berdasarkan bukti SPJ; Uang Harian tetap mengikuti Nota Dinas.                                  |
| FR-102 | Administrator dapat mengatur penomoran SPBY, Daftar Nominatif, Tanda Terima, dan Kuitansi secara terpisah; sistem menerbitkan nomor otomatis per jenis dan tahun ketika dokumen di-generate tanpa mengubah nomor dokumen existing.                                    |
| FR-114 | Setiap Laporan Terverifikasi menghasilkan satu tugas aktif dan notifikasi persisten bagi akun Sub Bagian Keuangan pada setiap tahap SPJ sampai Pembayaran Selesai; lebih dari satu SPJ wajib tampil sebagai antrean terpisah.                                         |
| FR-115 | SPJ yang dikembalikan Unit Keuangan tetap berada pada tahap SPJ Diterima tetapi ditampilkan sebagai SPJ Perlu Dilengkapi; catatan wajib terlihat pada Dashboard, notifikasi personal, tabel, dan detail bagi seluruh personel SPT terkait.                            |
| FR-116 | Preview cetak SPBY, Daftar Nominatif, Tanda Terima, dan Kuitansi menggunakan ukuran F4 yang dikenali dialog cetak; SPBY, Daftar Nominatif, dan Kuitansi wajib muat satu lembar pada skala 100%, dengan layout serta identitas penandatangan mengikuti aturan dokumen. |
| FR-117 | Seluruh dokumen keuangan menggunakan formatter uraian bersama yang tidak mengulang lokasi, durasi, atau tanggal yang telah tercantum pada maksud perjalanan; kolom nominal Tanda Terima wajib menampilkan angka secara utuh.                                          |

---

# 8.9 Rekapitulasi, Notifikasi, dan Arsip

| ID     | Requirement                                                                                                                                                                                                                                                                                                                                                          |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-051 | Sistem menghasilkan Rekapitulasi perjalanan dinas.                                                                                                                                                                                                                                                                                                                   |
| FR-052 | Sistem menghitung jumlah hari perjalanan setiap pegawai.                                                                                                                                                                                                                                                                                                             |
| FR-053 | Sistem menghitung total biaya perjalanan.                                                                                                                                                                                                                                                                                                                            |
| FR-125 | Rekapitulasi menghitung Pembayaran Selesai dari rincian Kuitansi individual yang telah dikonfirmasi dibayar dan membatasi role Pegawai pada `pegawaiId` sesi dengan identitas pegawai hanya-baca.                                                                                                                                                                    |
| FR-054 | Sistem mengirim notifikasi sesuai workflow.                                                                                                                                                                                                                                                                                                                          |
| FR-055 | Sistem mengarsipkan seluruh dokumen secara digital.                                                                                                                                                                                                                                                                                                                  |
| FR-056 | Sistem menyediakan pencarian dokumen berdasarkan berbagai kriteria.                                                                                                                                                                                                                                                                                                  |
| FR-057 | Sistem mendukung cetak serta export DOC/XLS sesuai kemampuan dokumen dan hak akses.                                                                                                                                                                                                                                                                                  |
| FR-058 | Sistem mencatat seluruh aktivitas pengguna pada Log Aktivitas.                                                                                                                                                                                                                                                                                                       |
| FR-091 | Hanya Administrator yang dapat membersihkan Riwayat Approval dan Log Aktivitas; aksi wajib dikonfirmasi, tidak mengubah dokumen sumber, dan menghasilkan catatan audit pembersihan.                                                                                                                                                                                  |
| FR-118 | Seluruh dokumen cetak perjalanan dinas dan keuangan wajib menyertakan metadata ukuran kertas sesuai format dokumen dan dipusatkan horizontal pada lembar. Dokumen selain SPPD Halaman 2 mempertahankan layout default skala 100% tanpa transformasi atau zoom tambahan; SPPD Halaman 2 tidak mengunci skala agar pengguna dapat menyesuaikannya pada dialog printer. |
| FR-092 | Field Nomor Berikutnya menerbitkan nilai yang dimasukkan, berlanjut otomatis setelah digunakan, merekonsiliasi riwayat Terpakai Nota Dinas tanpa dokumen, mempertahankan Booking, dan menampilkan nomor aktual yang akan diterbitkan.                                                                                                                                |
| FR-080 | Sistem menyimpan notifikasi secara persisten serta mendukung tandai dibaca dan hapus.                                                                                                                                                                                                                                                                                |
| FR-081 | Administrator dapat booking, membatalkan, melepas, dan mengatur titik mulai running number.                                                                                                                                                                                                                                                                          |
| FR-082 | Seluruh preview dokumen menggunakan Template Provider yang sama tanpa menghilangkan desain khusus tiap dokumen.                                                                                                                                                                                                                                                      |
| FR-085 | Administrator dan Sub Bagian Keuangan dapat mengunggah dan mengganti satu arsip PDF SPJ fisik per Nota Dinas serta mengunduhnya kembali dari tabel riwayat.                                                                                                                                                                                                          |
| FR-100 | Notifikasi tugas perjalanan ditujukan kepada `pegawaiId` penerima, tetap persisten setelah refresh, dan menyediakan tautan ke modul dokumen terkait.                                                                                                                                                                                                                 |
| FR-104 | Seluruh tanggal pada tabel aplikasi ditampilkan dalam format `DD/MM/YYYY`; nilai waktu ditampilkan sebagai `DD/MM/YYYY HH:mm`, tanpa mengubah nilai tanggal ISO yang tersimpan.                                                                                                                                                                                      |

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
- Akun individual per pegawai
- Pengelolaan username, status akun, dan reset password oleh Administrator
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
- Pegawai yang dinonaktifkan pada Master Pegawai tidak dapat login.
- Role sesi wajib mengikuti role aplikasi pegawai dan tidak boleh dipilih pengguna.

---

# 9.2 Dashboard

## Tujuan

Menyediakan informasi ringkasan aktivitas dan statistik sesuai hak akses pengguna.

### Aktor

Semua Role

### Referensi

- FR-007 s.d. FR-010, FR-098, FR-114, dan FR-115

### Komponen

- Statistik
- Grafik
- Aktivitas Terbaru
- Notifikasi
- Panel Tugas Perjalanan Saya
- Shortcut Menu

### Output

Dashboard berbeda sesuai role pengguna.

### Sumber Data

- Statistik dan grafik dihitung dari Master Pegawai, DIPA, Nota Dinas, SPT, SPPD, Laporan, SPJ, dan dokumen keuangan yang tersimpan.
- Dashboard Pegawai hanya menghitung dokumen yang menugaskan `pegawaiId` pengguna tersebut.
- Panel Tugas Perjalanan Saya diturunkan dari rantai Nota Dinas, SPT, SPPD, Laporan, SPJ, dan Pembayaran untuk `pegawaiId` aktif; panel tidak menambah route atau menu sidebar.
- Untuk role Sub Bagian Keuangan, setiap Laporan Terverifikasi membentuk satu tugas SPJ aktif tersendiri sampai seluruh pembayaran pada SPJ tersebut selesai; seluruh antrean ditampilkan tanpa dibatasi satu dokumen.
- SPJ Diterima yang memiliki catatan pengembalian Unit Keuangan ditampilkan kepada personel terkait sebagai SPJ Perlu Dilengkapi, disertai catatan dan tautan ke detail SPJ.
- Aktivitas terbaru bersumber dari Audit Log, bukan teks simulasi.
- Jika belum ada transaksi, kartu menampilkan nilai nol dan grafik menampilkan seri kosong/nol.
- Data seed transaksi frontend tidak boleh dihitung sebagai realisasi aktual setelah migrasi data real dijalankan.

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
- Kategori Pegawai dan Role Aplikasi

### Referensi

- FR-011 s.d. FR-017 dan FR-059 s.d. FR-061

### Validasi

- Data tidak boleh duplikat.
- Data master yang telah digunakan transaksi tidak boleh dihapus, hanya dapat dinonaktifkan.

### Struktur Master Anggaran DIPA

- Kode KRO.
- Klasifikasi Rincian Output (KRO).
- Kode Akun.
- Akun Perjalanan Dinas.
- Pagu Anggaran.
- Realisasi.
- Tahun Anggaran.

Kode KRO, KRO, Kode Akun, dan Akun Perjalanan Dinas dapat memuat campuran huruf, angka, spasi, dan tanda. Sistem membentuk `kodeDipa` internal dari gabungan Kode KRO dan Kode Akun dengan pemisah titik untuk menjaga referensi akun DIPA pada transaksi existing. Tabel dan referensi dokumen menampilkan gabungan tersebut pada satu kolom/label **Kode Akun**.

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
- FR-018 s.d. FR-025, FR-062 s.d. FR-064, FR-086, FR-088, FR-089, FR-093, FR-095, dan FR-097

### Field Header

- Kepada (default: Sekretaris KPU Kabupaten Gorontalo; dapat diedit)
- Dari (otomatis dari Master Jabatan pengguna login; hanya-baca)
- Tembusan
- Nomor
- Tanggal
- Tanggal Berangkat
- Tanggal Kembali
- Lokasi Tujuan
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

Disesuaikan berdasarkan jenis Nota Dinas, dapat memuat Sekretariat dan Komisioner, serta menggunakan Standar Biaya Masukan secara otomatis. Pemilihan personel menjalankan pemeriksaan benturan jadwal. Setiap komponen yang tampil sesuai jenis perjalanan memiliki tarif dan volume manual tersendiri. Lampiran merinci tarif, volume, dan subtotal, sedangkan durasi perjalanan hanya menjadi informasi referensi. Komponen bernilai nol tidak ditampilkan pada dokumen cetak.

### Output

- Dokumen cetak Nota Dinas
- Referensi SPT

### Status

- Draft
- Nomor Diambil
- Menunggu Approval — label aksi menampilkan tujuan Sekretaris/PLH. Sekretaris/PLT. Sekretaris aktif
- Disetujui
- Perlu Revisi
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
- FR-026 s.d. FR-032, FR-065 s.d. FR-068, dan FR-101

### Field

- Nomor SPT
- Referensi Nota Dinas
- Menimbang (Dinamis)
- Dasar (Dinamis)
- Personil
- Kelompok Personil (Sekretariat/Komisioner)
- Kegiatan (Dinamis)
- Penandatangan

### Output

- Dokumen SPT
- Referensi SPPD

SPT Sekretariat dan SPT Komisioner merupakan dokumen terpisah dengan nomor serta otoritas tanda tangan/approval masing-masing.

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
- FR-033 s.d. FR-039, FR-069 s.d. FR-072, FR-099, dan FR-105

### Field

- Nomor SPPD
- Referensi SPT
- Personil tunggal
- Transportasi
- Tempat Berangkat
- Tempat Tujuan
- Tanggal Berangkat
- Tanggal Kembali
- Lama Perjalanan (Otomatis)
- Akun DIPA
- Jumlah Blok Halaman 2
- Riwayat Perjalanan dan Penandatangan Tujuan

### Output

- Dokumen SPPD

### Status

- Draft
- Diproses
- Selesai
- Diarsipkan

Status hanya-baca pada form dan dihitung otomatis oleh sistem.

---

# 9.7 Laporan Perjalanan Dinas

## Tujuan

Mendokumentasikan hasil pelaksanaan perjalanan dinas.

### Aktor

- Pegawai

### Referensi

- BP-04
- BR-05
- FR-040 s.d. FR-044, FR-073 s.d. FR-074, dan FR-106 s.d. FR-107

### Struktur Dokumen

A. Dasar Pelaksanaan

B. Maksud

C. Tujuan

D. Materi

E. Tempat dan Waktu Pelaksanaan

F. Hasil Pelaksanaan

Kalimat Penutup tanpa kode poin, dicetak setelah poin F dan sejajar dengan margin huruf F.

Bagian Tanda Tangan Manual Seluruh Pelaksana

G. Dokumentasi, ditempatkan setelah bagian penandatanganan dan dimulai pada lembar cetak baru yang terpisah dari poin A–F.

### Dokumentasi

- Multi Upload Foto
- Preview
- Hapus Foto
- Maksimum 100 MB per berkas

### Output

- Dokumen Laporan Perjalanan Dinas

---

# 9.8 Validasi SPJ dan Pembayaran

## Tujuan

Melakukan pemeriksaan kelengkapan dokumen dan memantau proses sampai pembayaran selesai.

### Aktor

- Sub Bagian Keuangan

### Referensi

- BP-05
- BR-06
- FR-045, FR-075, FR-076, FR-083, FR-090, FR-096, FR-114, dan FR-115

### Akses

- Unit Sub Bagian Keuangan: kelola dan validasi.
- Personel Nota Dinas sumber: lihat hasil validasi.

### Status

- SPJ Diterima
- Validasi SPJ
- Validasi Selesai
- Proses Pembayaran
- Pembayaran Selesai

### Rincian Realisasi per Personel

- Uang Harian Paket Meeting dan Uang Harian Full: otomatis dari Nota Dinas, hanya-baca.
- Tiket Pesawat: diisi Unit Keuangan berdasarkan bukti.
- Transport Bandara Asal: diisi Unit Keuangan berdasarkan bukti.
- Transport Bandara Tujuan: diisi Unit Keuangan berdasarkan bukti.
- Uang Transport Harian: diisi Unit Keuangan berdasarkan bukti.
- Penginapan: diisi Unit Keuangan berdasarkan bukti.
- Status pemeriksaan per personel: wajib ditandai sebelum Validasi Selesai.

---

# 9.9 Dokumen Keuangan

## Tujuan

Menghasilkan dokumen pertanggungjawaban keuangan secara otomatis.

### Aktor

- Sub Bagian Keuangan

### Referensi

- BP-06
- BR-07
- FR-046 s.d. FR-050, FR-075 s.d. FR-079, FR-096, FR-102, FR-116, dan FR-117

### Dokumen

#### SPBY

Data diambil otomatis dari transaksi dan dibuat per orang. SPBY dapat dibuat ulang untuk menimpa dokumen yang keliru.

Preview cetak menggunakan F4 portrait dan muat satu halaman pada skala 100%. Border luar dihilangkan, alamat KOP dipertahankan satu baris dengan auto-scale, jarak Tanggal/Nomor dibuat proporsional, serta nama Bendahara, penerima, dan PPK di-auto-scale satu baris. Penerima dari Sekretariat menampilkan NIP, sedangkan Ketua/Anggota KPU tidak menampilkan NIP maupun label NIP.

Uraian pembayaran menggunakan formatter bersama. Lokasi, durasi, dan rentang tanggal dari SPPD hanya ditambahkan jika belum tercantum pada maksud perjalanan.

#### Daftar Nominatif

Dibuat kolektif untuk personel dalam SPT. Kolom Uang Harian mengikuti Nota Dinas, sedangkan Tiket Pesawat, Transport Bandara Asal/Tujuan, Uang Transport Harian, dan Penginapan mengikuti realisasi bukti SPJ yang telah diverifikasi.

Preview cetak menggunakan F4 landscape dan auto-scale agar tabel kolektif muat satu halaman pada skala 100%.

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

Dibuat per orang.

Setiap komponen pada rincian biaya menggunakan bullet; baris nominal pada kolom Jumlah wajib sejajar dengan baris komponen dan perkaliannya.

Kolom Perincian dan Jumlah wajib menyediakan ruang serta auto-scale angka yang cukup agar nominal satuan, nominal per komponen, dan total tidak menyentuh garis atau terpotong.

Field:

- Nomor Urut
- Perincian Biaya
- Jumlah
- Keterangan
- Bendahara Pengeluaran
- Yang Menerima

#### Kuitansi

Dibuat per orang. Bagian pengesahan menggunakan pejabat sesuai Master Pejabat Penandatangan.

Preview cetak menggunakan F4 portrait, tanpa border luar, dan muat satu halaman pada skala 100%. Tanggal pada teks **Lunas dibayar, Tanggal** berasal dari tanggal konfirmasi pembayaran dan tetap kosong sebelum pembayaran dikonfirmasi.

Field:

- Sudah Terima Dari
- Jumlah Uang
- Terbilang
- Untuk Pembayaran
- Tanda Tangan

### Output

- Preview dan cetak sesuai template resmi.
- Export DOC/XLS pada dokumen yang mendukung.

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
- Penerima notifikasi (`pegawaiId` pembuat dokumen)

### Pembersihan Riwayat

- Tombol **Bersihkan Riwayat Approval** hanya tersedia untuk Administrator.
- Pembersihan memerlukan konfirmasi dan hanya menghapus data riwayat, bukan Nota Dinas atau SPT sumber.
- Jumlah riwayat yang dibersihkan dicatat pada Log Aktivitas.

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
- Peringatan Jadwal Perjalanan Ganda
- Tugas Perjalanan Dinas Baru
- Status penerbitan SPT, SPPD, Laporan, Validasi SPJ, dan Pembayaran

Notifikasi tetap tersedia setelah refresh, hanya terlihat oleh `pegawaiId`
penerima (selain notifikasi global), dapat ditandai dibaca atau dihapus, dan
dapat mengarahkan pengguna ke modul dokumen terkait.

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

### Pembersihan Log

- Tombol **Bersihkan Log Aktivitas** hanya tersedia untuk Administrator.
- Pembersihan memerlukan konfirmasi.
- Setelah entri lama dibersihkan, sistem tetap menyimpan satu catatan audit mengenai pelaksana dan jumlah entri yang dibersihkan.

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
- Booking dan pembatalan booking nomor
- Pengembalian nomor dari Nota Dinas yang dihapus
- Rekonsiliasi reservasi yatim ketika penyimpanan Nota Dinas kosong
- Pengaturan running number sebagai titik mulai baru

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
3. Sistem mengisi `Dari` dari jabatan pengguna login dan default `Kepada`; pengguna melengkapi data dokumen, rencana tanggal/lokasi perjalanan, jenis, dan lampiran personel/anggaran.
4. Sistem menghitung biaya dan memeriksa potensi benturan perjalanan personel.
5. Klik **Ambil Nomor** dan simpan.
6. Kirim Nota Dinas untuk approval.
7. Sekretaris/PLT/PLH Sekretaris menyetujui atau mengembalikan untuk revisi.

---

# UF-03 Pembuatan SPT

### Aktor

- Administrator
- Supervisor
- Pegawai

### Alur

1. Membuka menu SPT.
2. Klik Tambah SPT.
3. Memilih Nota Dinas Disetujui yang dapat diakses pengguna.
4. Memilih kelompok SPT Sekretariat atau Komisioner; personel muncul otomatis.
5. Mengisi atau menggunakan kembali Menimbang, Dasar, dan Uraian Tugas.
6. Memilih penandatangan sesuai kelompok dan mengambil nomor.
7. Simpan atau pilih **Simpan & Next Buat SPT Komisioner** untuk Nota Dinas campuran.
8. Kirim masing-masing SPT untuk approval sesuai otoritas jabatan.

---

# UF-04 Approval Nota Dinas dan SPT

### Aktor

- Sekretaris/PLT/PLH Sekretaris
- Kepala Sub Bagian/Kasubbag pembuat/penandatangan Nota Dinas sumber untuk SPT Sekretariat maupun SPT Komisioner
- Ketua KPU untuk SPT Komisioner

### Alur

1. Membuka daftar approval.
2. Memilih dokumen.
3. Melihat isi dokumen.
4. Menyetujui atau menolak.
5. Jika ditolak wajib mengisi catatan revisi.
6. Sistem menyimpan riwayat, audit, dan notifikasi.

---

# UF-05 Pembuatan SPPD

### Aktor

- Administrator
- Supervisor
- Pegawai

### Alur

1. Membuka menu SPPD.
2. Memilih SPT Disetujui/Selesai.
3. Sistem menampilkan preview nomor SPPD berikutnya dan menerbitkan nomor unik ketika SPPD individual berhasil disimpan.
4. Memilih satu personel.
5. Mengisi field perjalanan, DIPA, PPK, dan konfigurasi Halaman 2.
6. Sistem menghitung lama perjalanan.
7. Simpan SPPD.
8. Ulangi hanya pemilihan personel untuk personel SPT berikutnya; field bersama disalin dan disinkronkan otomatis.

---

# UF-06 Pelaksanaan Perjalanan Dinas

### Aktor

- Pegawai

### Alur

1. Melaksanakan perjalanan.
2. Membuka menu Laporan.
3. Memilih satu nomor SPT yang belum memiliki laporan.
4. Sistem mengisi data dasar dari SPT dan SPPD terkait.
5. Mengisi Judul, Dasar, Maksud, Tujuan, Materi, Hasil, dan tempat/tanggal laporan.
6. Mengunggah foto tanpa caption output.
7. Kirim laporan untuk verifikasi; tanda tangan dilakukan manual setelah dokumen dicetak.

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

# UF-08 Validasi SPJ dan Pembayaran

### Aktor

- Sub Bagian Keuangan

### Alur

1. Membuka daftar SPJ.
2. Memeriksa kelengkapan.
3. Mengubah status:

   - SPJ Diterima
   - Validasi SPJ
   - Validasi Selesai
   - Proses Pembayaran
   - Pembayaran Selesai

4. Jika lengkap maka lanjut ke proses pembayaran.
5. Saat dokumen keuangan mulai dibuat, status otomatis menjadi Proses Pembayaran.
6. Saat seluruh Kuitansi individual telah dibayar, status otomatis menjadi Pembayaran Selesai.
7. Personel Nota Dinas dapat melihat hasil validasi dan pembayaran tanpa mengubahnya.

---

# UF-09 Generate Dokumen Keuangan

### Aktor

- Sub Bagian Keuangan

### Alur

1. Membuka transaksi.
2. Generate SPBY per orang.
3. Generate Daftar Nominatif kolektif.
4. Generate Tanda Terima per orang.
5. Generate Kuitansi per orang.
6. Gunakan **Buat Ulang** jika SPBY keliru.
7. Preview.
8. Print.
9. Setelah dana dibayarkan, buka Kuitansi individual dan pilih **Tandai Pembayaran Selesai**.
10. Isi tanggal, metode, dan referensi pembayaran bila tersedia; sistem mencatat petugas, membuat notifikasi, audit log, dan memperbarui rekapitulasi.

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
5. Cetak atau export sesuai permission.

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
Approval Nota Dinas
   │
   ▼
SPT Sekretariat dan/atau SPT Komisioner
   │
   ▼
Approval SPT
   │
   ▼
SPPD per orang
   │
   ▼
Pelaksanaan Perjalanan
   │
   ▼
Laporan per nomor SPT
   │
   ▼
Validasi SPJ dan Pembayaran
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

- Nomor Nota Dinas/SPT diperoleh melalui layanan penomoran masing-masing; setiap SPPD individual memperoleh nomor unik dari layanan penomoran SPPD.
- Nomor tidak boleh diketik manual oleh pengguna biasa.
- Nomor tidak boleh ganda.
- Nomor tidak dapat diubah setelah dokumen disimpan, kecuali oleh Administrator sesuai hak akses.
- Booking tidak boleh menggunakan kombinasi jenis, tahun, dan sequence yang sudah Terpakai/Booking.
- Nomor yang dilepas hanya dapat digunakan kembali jika tidak memiliki penggunaan aktif.

---

# VR-03 Nota Dinas

- Nomor wajib ada.
- Tanggal wajib diisi.
- Tanggal berangkat dan tanggal kembali wajib diisi.
- Tanggal kembali tidak boleh sebelum tanggal berangkat.
- Lokasi tujuan wajib diisi.
- Kepada wajib diisi.
- Dari wajib diisi.
- Dari harus sama dengan Master Jabatan pegawai yang terhubung ke sesi login dan tidak dapat diubah manual pada form baru.
- Perihal wajib diisi.
- Isi Nota Dinas wajib diisi.
- Jenis Nota Dinas wajib dipilih.
- Minimal terdapat satu personil pada lampiran.
- Penandatangan wajib dipilih.
- Lampiran tidak boleh kosong.
- Penandatangan harus Kasubbag/Kepala Sub Bagian.
- Approval hanya dapat diproses Sekretaris/PLT/PLH Sekretaris.
- Catatan Perlu Revisi wajib disimpan dan terlihat oleh Kasubbag pembuat Nota Dinas.

---

# VR-04 Surat Perintah Tugas (SPT)

- Referensi Nota Dinas wajib dipilih.
- Nomor SPT wajib tersedia.
- Minimal satu personil.
- Minimal satu poin Menimbang.
- Minimal satu poin Dasar.
- Minimal satu poin Kegiatan.
- Tidak dapat diajukan sebelum seluruh data lengkap.
- Seluruh personel dalam satu SPT harus berasal dari kelompok Sekretariat atau kelompok Komisioner, tidak boleh campuran.
- SPT Sekretariat wajib memakai penandatangan Sekretaris/PLT/PLH Sekretaris.
- SPT Komisioner wajib memakai penandatangan Ketua KPU.
- Kasubbag hanya dapat memproses approval SPT Sekretariat maupun SPT Komisioner apabila dirinya merupakan pembuat/penandatangan Nota Dinas sumber; SPT Komisioner juga dapat diproses Ketua KPU.
- Catatan Perlu Revisi wajib disimpan dan terlihat oleh pegawai pembuat SPT.

---

# VR-05 Surat Perintah Perjalanan Dinas (SPPD)

- Referensi SPT wajib dipilih.
- Nomor SPPD wajib tersedia.
- Nomor SPPD wajib unik untuk setiap personel/dokumen dan tidak boleh disinkronkan dengan SPPD lain dalam SPT yang sama.
- Tepat satu personel dan harus berasal dari SPT.
- Transportasi wajib dipilih atau diisi.
- Tempat berangkat wajib diisi.
- Tempat tujuan wajib diisi.
- Tanggal kembali tidak boleh lebih awal dari tanggal berangkat.
- Akun DIPA wajib dipilih.
- Lama perjalanan dihitung otomatis dan tidak dapat diubah manual.
- Penandatangan SPPD adalah PPK.
- Perubahan rangkaian SPT/SPPD/Laporan hanya dapat dilakukan pengelola rangkaian atau Administrator.

---

# VR-06 Laporan Perjalanan Dinas

- Hanya personel dalam scope Nota Dinas/SPT yang dapat mengisi.
- Satu nomor SPT tidak boleh memiliki lebih dari satu laporan.
- Dasar Pelaksanaan wajib diisi.
- Maksud wajib diisi.
- Tujuan wajib diisi.
- Materi wajib diisi.
- Tempat dan Waktu wajib diisi.
- Hasil Pelaksanaan wajib diisi.
- Minimal satu foto dokumentasi.
- Ukuran setiap foto maksimal 100 MB.
- Tanda tangan disediakan manual pada hasil cetak untuk seluruh personel SPT.

---

# VR-07 Validasi SPJ dan Pembayaran

- SPJ tidak dapat diproses tanpa laporan yang telah diverifikasi.
- Status SPJ harus mengikuti urutan:

  1. SPJ Diterima
  2. Validasi SPJ
  3. Validasi Selesai
  4. Proses Pembayaran
  5. Pembayaran Selesai

- Catatan perbaikan mengembalikan proses ke status **SPJ Diterima**.
- Hanya status **Validasi Selesai** yang dapat memulai proses keuangan.
- Hanya pegawai Unit Sub Bagian Keuangan yang dapat mengubah checklist dan status.
- SPJ tidak boleh ditampilkan jika Laporan, SPPD, SPT, atau Nota Dinas sumbernya sudah tidak tersedia.

---

# VR-08 Dokumen Keuangan

- SPBY hanya dapat dibuat setelah Validasi SPJ selesai.
- Daftar Nominatif hanya dapat dibuat jika SPBY tersedia.
- Tanda Terima hanya dapat dibuat jika Daftar Nominatif tersedia.
- Kuitansi hanya dapat dibuat jika Tanda Terima tersedia.
- Uang Harian diambil otomatis dari Nota Dinas yang disetujui.
- Tiket Pesawat, Transport Bandara Asal/Tujuan, Uang Transport Harian, dan Penginapan wajib berasal dari realisasi bukti SPJ per personel yang telah ditandai sudah diperiksa oleh Unit Sub Bagian Keuangan.
- Dokumen keuangan tidak dapat dibuat apabila masih ada personel yang realisasi biayanya belum diperiksa.
- SPBY, Tanda Terima, dan Kuitansi wajib memiliki satu penerima per dokumen.
- Daftar Nominatif memuat rincian kolektif personel SPT.
- Seluruh dokumen wajib menyimpan `notaDinasId`, `sptId`, `sppdId`, `laporanId`, dan parent document yang relevan.

---

# VR-09 Rekapitulasi

- Data dihitung secara otomatis.
- Jumlah hari perjalanan berdasarkan tanggal berangkat dan tanggal kembali.
- Total biaya berdasarkan transaksi keuangan yang telah selesai.
- Hak akses terhadap nominal mengikuti matriks hak akses.

---

# VR-10 Manajemen Dokumen

- Dokumen tidak dapat dihapus apabila telah menjadi referensi dokumen lain.
- Hanya Administrator yang dapat menjalankan aksi hapus pada Nota Dinas, SPT, SPPD, Laporan Perjalanan, SPBY, Daftar Nominatif, Tanda Terima, dan Kuitansi.
- Dokumen keuangan wajib dihapus dari urutan paling akhir pada rantai Kuitansi -> Tanda Terima -> Daftar Nominatif -> SPBY; dokumen induk tidak dapat dihapus selama dokumen turunannya masih tersedia.
- Setiap perubahan dokumen dicatat pada Log Aktivitas.
- Dokumen yang telah diarsipkan tetap dapat dicari dan diunduh sesuai hak akses.

---

# VR-11 Master Anggaran DIPA

- Kode KRO, Klasifikasi Rincian Output (KRO), Kode Akun, dan Akun Perjalanan Dinas wajib diisi.
- Kode KRO, KRO, Kode Akun, dan Akun Perjalanan Dinas menerima campuran huruf dan angka serta tidak dibatasi hanya salah satu jenis karakter.
- Pagu Anggaran dan Realisasi wajib berupa angka serta tidak boleh negatif.
- Tahun Anggaran wajib terdiri dari empat digit angka.
- Kode DIPA internal dibentuk otomatis dari gabungan Kode KRO dan Kode Akun.
- Gabungan kode ditampilkan sebagai `Kode KRO.Kode Akun` pada satu kolom Kode Akun di tabel dan referensi dokumen.
- Data DIPA lama wajib tetap dapat digunakan oleh transaksi existing melalui migrasi kompatibel.

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
- `Dari` otomatis menampilkan jabatan pengguna login dalam keadaan hanya-baca dan `Kepada` default menampilkan Sekretaris KPU Kabupaten Gorontalo.
- Perhitungan biaya dilakukan otomatis.
- Pada seluruh jenis perjalanan, pengguna dapat mengubah volume setiap komponen yang tersedia tanpa dikunci durasi. Contoh Luar Daerah 3 hari dapat menggunakan Meeting 1 hari, Full 2 hari, Transport 3 hari, Penginapan 2 malam, Tiket 2 kali, serta volume Bandara Asal/Tujuan sesuai rencana yang ditetapkan pengguna.
- Lampiran dan preview/cetak Nota Dinas menampilkan tarif, volume, subtotal setiap komponen bernilai, dan total usulan.
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
- Nomor SPPD diterbitkan otomatis saat SPPD individual berhasil disimpan; membatalkan form tidak mengonsumsi nomor.
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
- Poin G Dokumentasi dicetak setelah bagian penandatanganan dan selalu dimulai pada lembar baru yang terpisah dari poin A–F.

---

# AC-06 Validasi SPJ dan Pembayaran

### Kriteria

- Status SPJ mengikuti urutan yang telah ditentukan.
- SPJ yang belum lengkap tidak dapat diproses ke tahap keuangan.
- Status berubah menjadi **Validasi Selesai** setelah seluruh persyaratan dipenuhi.
- Unit Keuangan dapat mengisi realisasi lima komponen berbasis bukti untuk setiap personel, melihat nilai usulan sebagai pembanding, dan menandai setiap baris sudah diperiksa.
- Validasi Selesai ditolak apabila terdapat realisasi personel yang belum diperiksa.
- Status berubah menjadi **Proses Pembayaran** ketika dokumen keuangan mulai dibuat.
- Status berubah menjadi **Pembayaran Selesai** setelah seluruh Kuitansi individual dikonfirmasi selesai.
- Tahap yang selesai tampil hijau dan baris SPJ yatim tidak muncul pada tabel.
- Setiap Laporan Terverifikasi tampil sebagai tugas tersendiri pada Dashboard Sub Bagian Keuangan, menghasilkan notifikasi personal sesuai tahap SPJ, dan hilang dari daftar tugas aktif setelah Pembayaran Selesai.
- Saat Unit Keuangan memilih Kembalikan untuk Dilengkapi, seluruh personel SPT terkait menerima notifikasi personal dan dapat melihat label SPJ Perlu Dilengkapi beserta catatan pada Dashboard, tabel, serta detail SPJ.

---

# AC-07 Dokumen Keuangan

### Kriteria

- SPBY berhasil dibuat setelah Validasi SPJ selesai.
- Daftar Nominatif, Tanda Terima, dan Kuitansi berhasil dihasilkan otomatis.
- Uang Harian sesuai Nota Dinas, sedangkan lima komponen berbasis bukti sesuai realisasi SPJ yang telah tervalidasi.
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
- Notifikasi tugas hanya terlihat oleh pegawai penerima.
- Dashboard menampilkan tahap dokumen yang belum diterbitkan untuk tugas pengguna aktif.
- Setelah rangkaian SPPD dimulai oleh satu anggota, anggota lain hanya melihat progres penerbitan SPPD.

---

# AC-10 Audit Trail & Manajemen Dokumen

### Kriteria

- Seluruh aktivitas penting tercatat pada Log Aktivitas.
- Dokumen dapat dicari berdasarkan nomor, pegawai, tanggal, dan jenis dokumen.
- Dokumen yang telah diarsipkan tetap dapat diunduh sesuai hak akses.
- Riwayat perubahan dokumen dapat ditelusuri.
- Supervisor dan role non-Administrator tidak melihat tombol pembersihan Riwayat Approval maupun Log Aktivitas.
- Pembersihan Riwayat Approval tidak mengubah status atau menghapus Nota Dinas/SPT.
- Pembersihan Log Aktivitas menyisakan catatan audit pembersihan terbaru.

---

# AC-11 Master Anggaran DIPA

### Kriteria

- Administrator dapat mengisi Kode KRO, Klasifikasi Rincian Output (KRO), Kode Akun, dan Akun Perjalanan Dinas.
- Field Kode KRO, KRO, Kode Akun, dan Akun Perjalanan Dinas menerima campuran huruf dan angka.
- Pagu Anggaran, Realisasi, dan Tahun Anggaran hanya menerima nilai numerik yang valid.
- Tabel menampilkan kolom No Urut, Kode Akun gabungan (`Kode KRO.Kode Akun`), Klasifikasi Rincian Output (KRO), Akun Perjalanan Dinas, Pagu Anggaran, Realisasi, Tahun Anggaran, dan Aksi.
- Data DIPA existing tetap dapat dipilih pada SPPD dan dibaca oleh dashboard/dokumen keuangan.

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
| Versi           | 1.1                                                    |
| Status          | Aktif - Business Process Consolidated                  |
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

| Status              | Keterangan                                                      |
| ------------------- | --------------------------------------------------------------- |
| Draft               | Dokumen masih dalam proses penyusunan.                          |
| Nomor Diambil       | Nomor dokumen telah diperoleh melalui fitur **Ambil Nomor**.    |
| Menunggu Approval   | Dokumen telah diajukan untuk persetujuan.                       |
| Disetujui           | Dokumen telah disetujui.                                        |
| Perlu Revisi        | Dokumen dikembalikan untuk diperbaiki.                          |
| Menunggu Verifikasi | Laporan telah dikirim kepada Supervisor.                        |
| Terverifikasi       | Laporan telah diverifikasi dan dapat membentuk SPJ.             |
| SPJ Diterima        | SPJ terbentuk dari Laporan Terverifikasi.                       |
| Diproses            | Dokumen sedang diproses pada tahapan berikutnya.                |
| Pelaksanaan         | Perjalanan dinas sedang berlangsung.                            |
| Validasi SPJ        | Dokumen sedang diperiksa oleh Sub Bagian Keuangan.              |
| Validasi Selesai    | Seluruh checklist SPJ lengkap dan keuangan dapat diproses.      |
| Proses Pembayaran   | Dokumen keuangan sedang dibuat atau pembayaran sedang berjalan. |
| Pembayaran Selesai  | Seluruh Kuitansi individual telah dikonfirmasi dibayar.         |
| Selesai             | Seluruh proses administrasi telah selesai.                      |
| Diarsipkan          | Dokumen telah menjadi arsip digital.                            |

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

| Modul                    | Referensi Utama                                        | Kardinalitas                          |
| ------------------------ | ------------------------------------------------------ | ------------------------------------- |
| Nota Dinas               | Master Pegawai, DIPA, SBM, Penandatangan               | Banyak personel; boleh campuran       |
| SPT                      | `notaDinasId`                                          | Satu atau dua kelompok per Nota Dinas |
| SPPD                     | `sptId`                                                | Satu dokumen per orang                |
| Laporan Perjalanan Dinas | `sptId` dan kumpulan SPPD terkait                      | Satu laporan per SPT                  |
| Validasi SPJ             | `laporanId`                                            | Satu proses validasi per laporan      |
| SPBY                     | `spjId`, `laporanId`, `sppdId`, `sptId`, `notaDinasId` | Satu dokumen per orang                |
| Daftar Nominatif         | SPBY pada rantai Document ID                           | Kolektif per SPT                      |
| Tanda Terima             | Daftar Nominatif dan personel                          | Satu dokumen per orang                |
| Kuitansi                 | Tanda Terima dan personel                              | Satu dokumen per orang                |
| Arsip SPJ Fisik          | `notaDinasId`, SPT, SPPD, dan personel terkait         | Satu PDF per Nota Dinas               |
| Rekapitulasi             | Seluruh rantai Document ID                             | Sesuai filter dan role                |

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

| Versi | Tanggal               | Perubahan                                                                                                                                                                                                                                                                          | Oleh                  |
| ----- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| 1.0   | (Tanggal Persetujuan) | Penyusunan awal Product Requirement Document (PRD).                                                                                                                                                                                                                                | Tim Pengembang        |
| 1.1   | 17 Juli 2026          | Konsolidasi workflow aktual, RBAC berbasis jabatan/unit, relasi Document ID, penomoran, dan granularitas dokumen.                                                                                                                                                                  | Codex / User SIMPENAS |
| 1.2   | 17 Juli 2026          | Periode/pemetaan Pejabat Penandatangan, snapshot dokumen, dan Arsip SPJ fisik satu PDF per Nota Dinas.                                                                                                                                                                             | Codex / User SIMPENAS |
| 1.3   | 18 Juli 2026          | Reservasi nomor Nota Dinas dilepas saat form dibatalkan; nomor berikutnya tersedia setelah dokumen tersimpan tanpa menunggu approval.                                                                                                                                              | Codex / User SIMPENAS |
| 1.4   | 18 Juli 2026          | Perluasan struktur Master Anggaran DIPA menjadi hierarki Program sampai Detil dengan kode manual, kode DIPA gabungan, dan tabel terkonsolidasi.                                                                                                                                    | Codex / User SIMPENAS |
| 1.5   | 18 Juli 2026          | Otomatisasi pengirim Nota Dinas baru dari jabatan pengguna login dan default penerima Sekretaris KPU Kabupaten Gorontalo.                                                                                                                                                          | Codex / User SIMPENAS |
| 1.6   | 18 Juli 2026          | Pelepasan nomor setiap Nota Dinas yang dihapus dan rekonsiliasi reservasi nomor yatim ketika data Nota Dinas kosong.                                                                                                                                                               | Codex / User SIMPENAS |
| 1.7   | 18 Juli 2026          | Penghapusan dokumen transaksi/keuangan dibatasi hanya untuk Administrator dan Administrator memperoleh akses kelola Arsip SPJ.                                                                                                                                                     | Codex / User SIMPENAS |
| 1.8   | 18 Juli 2026          | Tombol hapus dokumen keuangan Administrator-only dengan validasi dependency dan audit penghapusan.                                                                                                                                                                                 | Codex / User SIMPENAS |
| 1.9   | 18 Juli 2026          | Modul Validasi SPJ dan Pembayaran menggunakan workflow lima tahap, indikator selesai hijau, dan rekonsiliasi baris SPJ yatim terhadap rantai dokumen sumber.                                                                                                                       | Codex / User SIMPENAS |
| 1.10  | 18 Juli 2026          | Pembersihan Riwayat Approval dan Log Aktivitas dibatasi untuk Administrator, memakai konfirmasi, tidak menghapus dokumen, dan tercatat pada audit log.                                                                                                                             | Codex / User SIMPENAS |
| 1.11  | 19 Juli 2026          | Running Number diubah menjadi Nomor Berikutnya; nilai 1 menerbitkan 001, riwayat Terpakai Nota Dinas tanpa dokumen direkonsiliasi, Booking dipertahankan, dan preview nomor aktual ditampilkan.                                                                                    | Codex / User SIMPENAS |
| 1.12  | 19 Juli 2026          | Pejabat penandatangan Nota Dinas dikunci dari akun pegawai yang login dan dropdown pemilihan dihapus; snapshot dokumen lama tetap dipertahankan.                                                                                                                                   | Codex / User SIMPENAS |
| 1.13  | 19 Juli 2026          | Daftar pegawai pada menu, dropdown, lampiran, approval, arsip, dan dokumen kolektif diurutkan secara struktural lalu berdasarkan Pangkat/Golongan tertinggi.                                                                                                                       | Codex / User SIMPENAS |
| 1.14  | 19 Juli 2026          | Urutan Staf dibedakan menjadi PNS Golongan I/a–IV/d lebih dahulu, kemudian PPPK Golongan I–XI; masing-masing menurun menurut pangkat dan alfabetis jika sama.                                                                                                                      | Codex / User SIMPENAS |
| 1.15  | 19 Juli 2026          | Tanggal pada preview dan dokumen cetak Nota Dinas diformat menjadi hari dua digit, nama bulan Indonesia, dan tahun, misalnya 03 Juli 2026.                                                                                                                                         | Codex / User SIMPENAS |
| 1.16  | 19 Juli 2026          | Kalkulasi Luar Daerah dirinci per komponen: meeting/transport mengikuti durasi, penginapan durasi dikurangi satu, tiket dua kali, bandara asal/tujuan masing-masing dua kali, dan uang harian full opsional 0-2 hari; subtotal disinkronkan ke dokumen keuangan.                   | Codex / User SIMPENAS |
| 1.17  | 19 Juli 2026          | Uang Harian Full tidak dibatasi maksimum hari; Nota Dinas ditegaskan sebagai nilai usulan, sedangkan tiket, bandara asal/tujuan, transport harian, dan penginapan dokumen keuangan berasal dari realisasi bukti SPJ per personel yang diverifikasi Unit Keuangan.                  | Codex / User SIMPENAS |
| 1.18  | 19 Juli 2026          | Volume Uang Harian Paket Meeting dipisahkan dari durasi perjalanan dan diisi manual per personel; volume Meeting dan Full tidak saling mengunci serta tidak wajib berjumlah sama dengan durasi perjalanan.                                                                         | Codex / User SIMPENAS |
| 1.19  | 19 Juli 2026          | Seluruh komponen biaya pada semua jenis Lampiran Nota Dinas memperoleh volume manual per personel; durasi hanya menjadi referensi dan tidak lagi menjadi multiplier otomatis biaya.                                                                                                | Codex / User SIMPENAS |
| 1.20  | 19 Juli 2026          | Label status dan notifikasi pengiriman approval Nota Dinas mengikuti Sekretaris/PLH. Sekretaris/PLT. Sekretaris aktif berdasarkan konfigurasi serta periode Master Pejabat Penandatangan.                                                                                          | Codex / User SIMPENAS |
| 1.21  | 19 Juli 2026          | Dashboard memperoleh panel Tugas Perjalanan Saya dan notifikasi personal berbasis pegawai; satu anggota mengelola rangkaian SPPD individual pada satu SPT sedangkan anggota lain hanya memantau status.                                                                            | Codex / User SIMPENAS |
| 1.22  | 19 Juli 2026          | Lifecycle reservasi nomor SPT disamakan dengan Nota Dinas: form baru yang ditutup/dibatalkan melepaskan nomor, reservasi yatim lama direkonsiliasi, dan Booking Administrator tetap dipertahankan.                                                                                 | Codex / User SIMPENAS |
| 1.23  | 19 Juli 2026          | SPBY, Daftar Nominatif, Tanda Terima, dan Kuitansi memperoleh konfigurasi serta running number terpisah per tahun; nomor diterbitkan otomatis saat generate dengan perlindungan data existing dan Booking.                                                                         | Codex / User SIMPENAS |
| 1.24  | 19 Juli 2026          | Dialog Nota Dinas dibuat scrollable; peringatan dan snapshot potensi perjalanan ganda ditampilkan merah pada form serta tabel; seluruh tanggal tabel distandardisasi menjadi DD/MM/YYYY.                                                                                           | Codex / User SIMPENAS |
| 1.25  | 20 Juli 2026          | Master Anggaran DIPA disederhanakan menjadi Klasifikasi Rincian Output (KRO), Akun Perjalanan Dinas, Pagu Anggaran, Realisasi, dan Tahun Anggaran; data lama dimigrasikan kompatibel untuk transaksi existing.                                                                     | Codex / User SIMPENAS |
| 1.26  | 20 Juli 2026          | Master Anggaran DIPA menambahkan Kode KRO dan Kode Akun; kode DIPA internal dibentuk dari kedua kode tersebut dan migrasi data lama tetap menjaga referensi transaksi existing.                                                                                                    | Codex / User SIMPENAS |
| 1.27  | 20 Juli 2026          | Catatan revisi Nota Dinas/SPT dipersistenkan dan ditujukan ke pembuat; approval difilter menurut identitas pejabat dan Kasubbag sumber; pemilik rangkaian membatasi edit; tugas approval membuka `/approval`; kode DIPA ditampilkan gabungan pada satu kolom.                      | Codex / User SIMPENAS |
| 1.28  | 20 Juli 2026          | Nota Dinas Menunggu Approval ditambahkan ke Tugas Perjalanan Saya milik Sekretaris; filter approval menerima seluruh pejabat aktif pada prioritas kewenangan tertinggi agar record default tidak menutupi akun aktual.                                                             | Codex / User SIMPENAS |
| 1.29  | 20 Juli 2026          | Dokumen Nota Dinas/SPT yang belum selesai ditambahkan ke Tugas Perjalanan Saya dan notifikasi personal milik pembuat; status Perlu Revisi menampilkan catatan pejabat dan mengarah ke modul dokumen terkait.                                                                       | Codex / User SIMPENAS |
| 1.30  | 20 Juli 2026          | Status approval manual dihapus dari SPPD dan diganti lifecycle dokumen otomatis Draft, Diproses, Selesai, serta Diarsipkan berdasarkan kelengkapan SPPD individual dan upload Arsip SPJ.                                                                                           | Codex / User SIMPENAS |
| 1.31  | 20 Juli 2026          | Guard pembuatan Laporan diselaraskan dengan lifecycle SPPD: seri Selesai atau Diarsipkan menjadi sumber Laporan, sedangkan seri Diproses tetap menunggu kelengkapan seluruh SPPD individual.                                                                                       | Codex / User SIMPENAS |
| 1.39  | 21 Juli 2026          | Dashboard Sub Bagian Keuangan menampilkan setiap SPJ aktif dari Laporan Terverifikasi sebagai tugas terpisah dan membuat notifikasi personal sesuai tahap Validasi SPJ hingga Proses Pembayaran.                                                                                   | Codex / User SIMPENAS |
| 1.40  | 21 Juli 2026          | Pengembalian SPJ oleh Unit Keuangan ditampilkan sebagai SPJ Perlu Dilengkapi; catatan dipublikasikan melalui Dashboard, notifikasi personal, tabel, dan detail kepada seluruh personel SPT terkait tanpa menambah tahap workflow.                                                  | Codex / User SIMPENAS |
| 1.41  | 21 Juli 2026          | Layout cetak dokumen keuangan dikunci pada F4: SPBY/Nominatif/Kuitansi satu halaman pada skala 100%, identitas SPBY auto-scale dengan aturan NIP, rincian Tanda Terima sejajar, dan tanggal pelunasan Kuitansi mengikuti konfirmasi pembayaran.                                    | Codex / User SIMPENAS |
| 1.42  | 21 Juli 2026          | Redaksi SPBY, Daftar Nominatif, Tanda Terima, dan Kuitansi dikonsolidasikan agar lokasi/durasi/tanggal tidak berulang; kolom Perincian dan Jumlah Tanda Terima diperlebar serta nominal besar di-auto-scale.                                                                       | Codex / User SIMPENAS |
| 1.43  | 22 Juli 2026          | Page setup seluruh dokumen perjalanan dinas dan keuangan distandarkan: metadata A4/F4 mengikuti jenis dokumen, lembar dipusatkan horizontal, margin dokumen dipertahankan sebagai padding internal, dan output memakai skala 100% tanpa transformasi tambahan.                     | Codex / User SIMPENAS |
| 1.44  | 22 Juli 2026          | Ukuran cetak SPT Sekretariat dan SPT Komisioner diubah dari A4 portrait menjadi F4 portrait tanpa mengubah isi, template, business logic, atau workflow dokumen.                                                                                                                   | Codex / User SIMPENAS |
| 1.45  | 22 Juli 2026          | Sumber DIPA diwajibkan pada Nota Dinas dengan guard pagu saat dikirim; realisasi DIPA dihitung dari pembayaran selesai; tabel Nota Dinas dipisah Nomor/Perihal; Nota Dinas, SPT, dan SPPD memperoleh Export Excel; Dashboard Administrator memperoleh rekap seluruh pegawai.       | Codex / User SIMPENAS |
| 1.46  | 22 Juli 2026          | Dashboard setiap akun pegawai memperoleh rekap personal NIP, Jumlah Hari SPPD, dan Jumlah Yang Dibayarkan; Administrator tetap memperoleh tabel seluruh pegawai, sedangkan akun lain hanya melihat identitasnya sendiri.                                                           | Codex / User SIMPENAS |
| 1.47  | 22 Juli 2026          | Pengelola rangkaian dikunci berdasarkan pembuat SPT pertama per Nota Dinas; personel lain hanya melihat/pratinjau dan tombol pembuatan SPT, SPPD, serta Laporan baru dinonaktifkan sampai terdapat Nota Dinas baru Disetujui yang mencantumkan dirinya.                            | Codex / User SIMPENAS |
| 1.48  | 22 Juli 2026          | Rekapitulasi Pembayaran Selesai diintegrasikan dengan rincian Kuitansi yang telah dikonfirmasi dibayar; akun Pegawai otomatis dibatasi pada rekap `pegawaiId` sendiri dan filter seluruh pegawai diganti identitas hanya-baca.                                                     | Codex / User SIMPENAS |
| 1.49  | 22 Juli 2026          | Sinkronisasi Rekapitulasi-Keuangan ditahan sampai sumber Laporan/SPPD selesai dimuat; pencocokan Kuitansi existing diperkuat melalui rantai SPPD/SPT induk SPJ dan status pembayaran dipulihkan dari snapshot konfirmasi.                                                          | Codex / User SIMPENAS |
| 1.50  | 22 Juli 2026          | Tabel Validasi SPJ dan Pembayaran menampilkan Personil SPPD berdasarkan relasi `spj.sppdId -> sppd.personil -> Master Pegawai`, disertai fallback ID dan dukungan scroll horizontal.                                                                                               | Codex / User SIMPENAS |
| 1.51  | 22 Juli 2026          | SPPD tetap dibuat per orang dan kini memakai satu nomor unik per dokumen/personel dari Numbering Service SPPD; nomor diterbitkan saat penyimpanan, tidak ikut sinkronisasi seri, dokumen existing dipertahankan, dan nomor terhapus dapat dilepas.                                 | Codex / User SIMPENAS |
| 1.52  | 22 Juli 2026          | Penghapusan SPT oleh Administrator melepaskan nomor pada seluruh status dokumen; reservasi `Terpakai` yatim dari penghapusan lama direkonsiliasi agar dapat digunakan kembali, sedangkan Booking Administrator tetap dipertahankan.                                                | Codex / User SIMPENAS |
| 1.53  | 22 Juli 2026          | Approval SPT Komisioner diberikan kepada Ketua KPU atau Kasubbag pembuat/penandatangan Nota Dinas sumber; identitas Ketua dapat dikenali dari kategori/jabatan Master Pegawai ketika nama penandatangan masih generik, dan tugas tampil langsung pada Dashboard serta `/approval`. | Codex / User SIMPENAS |
| 1.54  | 27 Juli 2026          | Print SPPD Halaman 2 tidak lagi mengunci skala 100%; blok tanda tangan Romawi memiliki tinggi natural dengan minimum area yang wajar dan setiap blok dipindahkan utuh ke halaman berikutnya jika melewati batas bawah.                                                             | Codex / User SIMPENAS |
| 2.0   |                       |                                                                                                                                                                                                                                                                                    |                       |

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
