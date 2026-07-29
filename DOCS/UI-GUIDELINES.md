# UI GUIDELINE

# Sistem Informasi Manajemen Perjalanan Dinas (SIMPENAS)

**Versi:** 1.27
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

Ketentuan data Dashboard:

- Statistic Card dan Chart wajib menggunakan data transaksi aktual sesuai role dan scope pengguna.
- Nilai hardcoded atau dataset simulasi tidak boleh ditampilkan sebagai data operasional.
- Kondisi tanpa data menampilkan nilai `0`, status `Belum Ada`, atau empty state yang jelas.
- Dashboard menyediakan aksi Perbarui untuk menghitung ulang data dari sumber penyimpanan aktif.
- Aktivitas terbaru menggunakan Audit Log aktual.
- Panel **Tugas Perjalanan Saya** menggunakan Card, Badge status, informasi tanggal/lokasi, dan satu aksi kontekstual; daftar panjang wajib scrollable tanpa memperpanjang halaman secara berlebihan.
- Aksi tugas berstatus **Nota Dinas Menunggu Approval** atau **SPT Menunggu Approval** bagi pejabat berwenang menggunakan label **Lihat Approval ...** dan menuju `/approval`; aksi penyusunan/revisi tetap menuju modul dokumen.
- Dokumen buatan akun aktif yang masih Draft/Nomor Diambil, Menunggu Approval, atau Perlu Revisi ditampilkan pada panel; tugas Perlu Revisi menggunakan Badge danger dan menyertakan catatan pejabat pada deskripsi.
- Pada Dashboard Sub Bagian Keuangan, setiap SPJ aktif ditampilkan sebagai Card terpisah dengan Badge tahap dan aksi kontekstual; daftar tidak boleh diringkas menjadi hanya satu dokumen dan tetap scrollable.
- SPJ Diterima yang memiliki catatan pengembalian menggunakan label tampilan **SPJ Perlu Dilengkapi**, Badge danger, dan catatan berwarna danger pada Dashboard, tabel, serta detail SPJ.
- Panel tugas hanya berada pada area konten Dashboard dan tidak menambah menu baru pada Sidebar.
- Empty state menjelaskan bahwa tugas muncul ketika pengguna ditugaskan, memiliki dokumen yang belum selesai, mempunyai kewenangan approval, atau memiliki antrean validasi dan pembayaran.
- Dashboard Administrator menampilkan tabel rekap seluruh pegawai setelah ringkasan utama dengan kolom No Urut, Nama, NIP, Jumlah Hari SPPD, dan Jumlah Yang Dibayarkan; nilai uang rata kanan dan data tanpa NIP menggunakan tanda `-`.
- Dashboard akun non-Administrator yang terhubung ke Master Pegawai menampilkan tabel rekap personal dengan struktur kolom yang sama dan hanya satu baris milik akun aktif. Judul menggunakan **Rekap Perjalanan dan Pembayaran Saya** dan tidak boleh membuka data pegawai lain.
- Tombol lonceng menampilkan badge jumlah belum dibaca dan efek pulse/ring berbasis design token selama masih ada notifikasi baru; status tetap memiliki `aria-label` yang deskriptif.
- Brand Sidebar menampilkan tiga baris identitas: SIMPENAS, nama lengkap sistem, dan KPU Kabupaten Gorontalo, dengan ukuran teks bertingkat agar tetap terbaca pada lebar Sidebar.

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

Textarea untuk isi dokumen yang panjang wajib memiliki tinggi awal yang cukup
dan bertambah otomatis mengikuti isi. Poin I–III pada Form SPT menggunakan
autosize agar seluruh teks dapat dibaca tanpa scroll horizontal atau input satu
baris.

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

## 16.1 Master Anggaran DIPA

- Form menampilkan Kode KRO, Klasifikasi Rincian Output (KRO), Kode Akun, Akun Perjalanan Dinas, Pagu Anggaran, dan Tahun Anggaran. Realisasi tidak memiliki input manual.
- Kode KRO/KRO serta Kode Akun/Akun Perjalanan Dinas berada dalam dua kolom pada desktop dan ditumpuk menjadi satu kolom pada layar kecil.
- Dialog form harus menyediakan area scroll agar seluruh field dan tombol aksi tetap dapat dijangkau.
- Pagu Anggaran dan Tahun Anggaran menggunakan input numerik dengan pesan validasi inline.
- Tabel Master DIPA menggunakan kolom: No Urut, Kode Akun gabungan (`Kode KRO.Kode Akun`), Klasifikasi Rincian Output (KRO), Akun Perjalanan Dinas, Pagu Anggaran, Realisasi Pembayaran, Tahun Anggaran, dan Aksi.
- Form Nota Dinas menampilkan dropdown Sumber Anggaran setelah bagian Lampiran Personil & Anggaran. Setiap opsi menampilkan Kode Akun, nama akun, tahun, dan sisa tersedia.
- Ringkasan sumber anggaran menampilkan Pagu, Komitmen Nota Dinas lain, Sisa Tersedia, dan Usulan dokumen aktif. Kondisi melebihi pagu wajib memakai Alert danger berwarna merah dan menjelaskan bahwa dokumen tidak dapat dikirim.
- Preview Nota Dinas menampilkan dua baris judul lampiran; baris kedua berbunyi `Sumber Anggaran : <Kode Akun DIPA>`.
- Tabel Nota Dinas menggunakan kolom Nomor dan Perihal yang terpisah.
- Header halaman Nota Dinas, SPT, dan SPPD menempatkan tombol outline **Export Data** di samping tombol **Buat Baru**; tombol nonaktif ketika tidak ada baris dan dialog nama file muncul sebelum unduhan Excel.
- Tabel tetap menggunakan container horizontal scroll pada layar yang tidak cukup lebar.

## 16.1.1 Catatan Revisi Dokumen

- Status **Perlu Revisi** pada tabel Nota Dinas, SPT, dan Laporan wajib menampilkan catatan pejabat/Supervisor tepat di bawah Badge status dengan warna danger dan ukuran teks ringkas namun terbaca.
- Catatan tidak hanya bergantung pada toast; informasi tetap terlihat setelah refresh karena menjadi bagian dari data dokumen.
- Tombol ubah hanya dirender untuk pemilik/pengelola dokumen sesuai hasil guard, sedangkan tombol pratinjau tetap tersedia bagi pengguna yang memiliki akses baca.

## 16.1.2 Status Dokumen SPPD

- Form menggunakan label **Status Dokumen (Otomatis)** dan menampilkan nilai hanya-baca; dropdown **Status Approval** tidak boleh ditampilkan.
- Status tabel dan filter hanya terdiri dari Draft, Diproses, Selesai, dan Diarsipkan.
- Badge menggunakan variant design system: Draft netral, Diproses warning, Selesai success, dan Diarsipkan info.
- Helper text menjelaskan bahwa status mengikuti kelengkapan SPPD per personel dan pengarsipan SPJ.
- Aksi **Buat Laporan** hanya aktif untuk seri SPPD Selesai/Diarsipkan yang belum memiliki Laporan; empty/disabled state menjelaskan bahwa seluruh SPPD individual perlu dilengkapi tanpa menyebut status approval lama.

## 16.1.2.1 Nomor Individual SPPD

- Field Nomor SPPD pada form baru bersifat hanya-baca dan menampilkan preview nomor berikutnya dari konfigurasi SPPD.
- Helper text wajib menjelaskan bahwa setiap personel memperoleh nomor SPPD unik dan nomor baru diterbitkan saat dokumen disimpan.
- Preview nomor tidak boleh mengonsumsi running number ketika dialog dibatalkan.
- Saat mengubah SPPD existing, nomor tersimpan tetap ditampilkan dan tidak berubah karena sinkronisasi field perjalanan.

## 16.1.2.2 Penguncian Pembuatan Rangkaian Nota Dinas

- Tombol **Buat SPT**, **Buat SPPD**, dan **Buat Laporan** tetap ditampilkan sesuai permission, tetapi berada dalam disabled state apabila akun aktif bukan pengelola rangkaian `notaDinasId` atau tidak memiliki sumber baru yang memenuhi syarat.
- Tampilkan Alert info yang menjelaskan bahwa rangkaian Nota Dinas sedang dikelola pegawai pembuat SPT pertama dan pengguna tetap dapat melihat status/pratinjau.
- Pengelola tetap dapat melengkapi SPT Sekretariat/Komisioner yang belum terbentuk dan seluruh SPPD individual yang belum diterbitkan; tombol dinonaktifkan setelah tidak ada dokumen lanjutan yang dapat dibuat.
- Nota Dinas baru berstatus Disetujui yang mencantumkan pengguna diperlakukan sebagai sumber baru dan mengaktifkan kembali aksi pembuatan secara independen.

## 16.1.3 Layout Cetak Laporan

- Dokumen menggunakan font Bookman Old Style.
- Margin atas, bawah, kiri, dan kanan seluruh lembar mengikuti nilai Margin pada Pengaturan Template; jangan menggabungkan margin `@page` dengan padding cetak tambahan yang memperkecil area isi.
- Urutan cetak adalah Poin A–F, Kalimat Penutup, bagian penandatanganan, lalu Poin G Dokumentasi.
- Poin G wajib menggunakan page break dan dimulai pada lembar baru, terpisah dari Poin A–F serta penandatanganan.
- Setiap foto tidak boleh terpotong di tengah halaman; kumpulan dokumentasi dapat mengalir ke lembar berikutnya secara natural.
- Identitas penandatangan ASN/Sekretariat menampilkan Nama dan NIP. Identitas Ketua/Anggota KPU menampilkan Nama dan Jabatan dari Master Jabatan tanpa NIP.
- KOP Laporan Komisioner menampilkan logo terpusat di atas dua baris nama instansi. KOP Laporan Sekretariat tetap menggunakan grid dengan logo di sisi kiri.

## 16.1.4 Layout Cetak SPT dan SPPD

- SPT menggunakan Bookman Old Style. Hanya dua baris nama KOP **KOMISI PEMILIHAN UMUM / KABUPATEN GORONTALO** yang bold; seluruh isi dokumen lainnya regular.
- SPPD Halaman 1 tidak menggunakan border kotak pada wrapper paling luar; border tabel isi tetap dipertahankan.
- Baris lanjutan nilai Jabatan/Instansi pada poin 3 sejajar dengan awal nilai, bukan dengan penanda `b.`.
- Poin 9a mencetak `KPU Kabupaten Gorontalo` dan poin 10 mencetak nomor ST pada baris pertama serta label `Tanggal` berikut nilainya pada baris kedua.
- SPPD Halaman 2 menggunakan F4 portrait dengan skala print yang dapat disesuaikan pengguna pada dialog printer. Tinggi blok tanda tangan mengikuti isi secara natural dengan minimum area yang wajar; bila sebuah blok melewati batas bawah, seluruh blok dipindahkan ke halaman berikutnya tanpa memisahkan garis dan isi.

## 16.2 Pengaturan Penomoran

- Field titik mulai wajib menggunakan label **Nomor Berikutnya**, bukan Running Number.
- Helper text wajib menjelaskan bahwa nilai `1` menerbitkan `001` dan urutan berikutnya berjalan otomatis.
- Form dan kartu ringkasan wajib menampilkan nomor lengkap yang benar-benar akan diterbitkan setelah memperhitungkan Booking aktif serta dokumen existing.
- Kartu konfigurasi wajib tersedia terpisah untuk Nota Dinas, SPT, SPPD, SPBY, Daftar Nominatif, Tanda Terima, dan Kuitansi.
- Informasi rekonsiliasi harus menjelaskan bahwa riwayat `Terpakai` tanpa dokumen sumber diubah menjadi `Dibatalkan`, sedangkan Booking hanya dapat dibatalkan manual.
- Nomor Berikutnya hanya menerima bilangan bulat minimal `1` dengan validasi inline.
- Form Booking dan tabel riwayat wajib menampilkan seluruh jenis dokumen bernomor yang didukung.

## 16.3 Penandatangan Nota Dinas

- Field menggunakan label **Pejabat Penandatangan (Terkunci)** dan ditampilkan hanya-baca.
- Jangan menampilkan dropdown atau kontrol penggantian penandatangan pada form Nota Dinas.
- Tampilkan nama dan jabatan resmi yang dipetakan dari akun login.
- Tampilkan helper text bahwa identitas mengikuti akun login dan tidak dapat diganti dari form.
- Jika pemetaan akun belum lengkap, tampilkan peringatan serta pesan validasi inline dan cegah penyimpanan.
- Pada mode edit, tampilkan snapshot penandatangan dokumen tersimpan dengan keterangan bahwa identitas dipertahankan.

## 16.4 Tanggal Cetak Nota Dinas

- Tanggal pada preview dan media print wajib menggunakan hari dua digit, nama bulan Indonesia, dan empat digit tahun.
- Contoh tampilan: **03 Juli 2026**.
- Jangan menampilkan nilai mentah `YYYY-MM-DD` atau `YYYY/MM/DD` pada dokumen cetak.
- Perubahan format tampilan tidak boleh mengubah nilai tanggal yang tersimpan.

## 16.5 Dialog Transaksi, Peringatan, dan Tanggal Tabel

- Dialog form transaksi dengan konten dinamis wajib dibatasi terhadap tinggi viewport dan menyediakan scroll vertikal pada area isi.
- Header dialog dan tombol aksi harus tetap dapat dijangkau tanpa pengguna memperkecil zoom browser.
- Peringatan potensi perjalanan ganda menggunakan varian danger: border, latar lembut, ikon, judul, dan teks berwarna merah dengan kontras yang tetap terbaca.
- Nota Dinas yang menyimpan snapshot potensi perjalanan ganda diberi latar baris merah lembut, label **Potensi Ganda**, serta nama personel terkait pada tabel.
- Tanggal pada seluruh tabel aplikasi menggunakan `DD/MM/YYYY`. Timestamp menggunakan `DD/MM/YYYY HH:mm`.
- Format tampilan tabel tidak boleh mengubah string ISO atau nilai tanggal yang disimpan oleh schema/service.

## 16.6 Filter Rekapitulasi Personal

- Role Pegawai tidak melihat dropdown **Semua Pegawai** pada Rekapitulasi.
- Field Pegawai diganti dengan input/identitas hanya-baca yang menampilkan nama pegawai pada sesi aktif.
- Kartu, grafik, tabel, dan preview Rekapitulasi wajib memakai scope `pegawaiId` yang sama sehingga data pegawai lain tidak bocor melalui filter, export, atau print.
- Kartu **Pembayaran Selesai** memakai nominal Kuitansi individual yang telah dikonfirmasi dibayar, bukan total usulan Nota Dinas.

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

Page setup seluruh dokumen perjalanan dinas dan keuangan:

- Nota Dinas menggunakan A4 portrait (`210mm x 297mm`).
- SPT Sekretariat dan SPT Komisioner menggunakan F4 portrait (`215mm x 330mm`).
- SPPD Halaman 1, SPPD Halaman 2, dan Laporan Perjalanan menggunakan F4 portrait (`215mm x 330mm`).
- SPBY, Tanda Terima, dan Kuitansi menggunakan F4 portrait (`215mm x 330mm`); Daftar Nominatif menggunakan F4 landscape (`330mm x 215mm`).
- Setiap preview menyisipkan metadata `@page` eksplisit agar opsi printer **Use page size to select paper source** dapat membaca ukuran lembar yang benar.
- Margin fisik `@page` ditetapkan nol dan jarak dokumen dipertahankan sebagai padding internal template agar dimensi lembar tidak menyusut.
- Lembar dan kontainer cetak wajib dipusatkan secara horizontal. Dokumen selain SPPD Halaman 2 menggunakan `zoom: 1` dan tanpa `transform` agar output default tetap pada skala 100%; SPPD Halaman 2 tidak mengunci kedua properti tersebut sehingga skala dapat disesuaikan pada dialog printer.

Khusus dokumen keuangan:

- `PrintPreview` menyisipkan ukuran `@page` aktif sesuai dokumen agar dialog cetak dapat memilih sumber kertas berdasarkan ukuran halaman.
- SPBY, Tanda Terima, dan Kuitansi menggunakan F4 portrait (`215mm x 330mm`); Daftar Nominatif menggunakan F4 landscape (`330mm x 215mm`).
- SPBY, Daftar Nominatif, dan Kuitansi harus tetap satu halaman pada skala 100%; area dokumen menggunakan ukuran tetap dan overflow cetak tidak boleh membentuk lembar kosong tambahan.
- SPBY dan Kuitansi tidak menggunakan border kotak terluar.
- Nama penandatangan SPBY harus satu baris dengan auto-scale; baris NIP ketiga kolom sejajar. Penerima Ketua/Anggota KPU tidak menampilkan NIP atau placeholder NIP.
- Alamat KOP SPBY tetap satu baris dengan auto-scale dan Tanggal/Nomor ditempatkan berdekatan secara proporsional.
- Rincian Tanda Terima menampilkan bullet per komponen dengan tinggi baris tetap yang sama pada kolom Perincian dan Jumlah.
- Kolom Perincian dan Jumlah Tanda Terima harus cukup lebar untuk menampilkan angka secara utuh; nominal menggunakan satu baris, tabular number, dan auto-scale sebelum menyentuh garis vertikal.
- Uraian pada seluruh dokumen keuangan memakai formatter yang sama. Konteks lokasi, durasi, dan tanggal hanya ditambahkan apabila belum terdapat pada maksud perjalanan.
- Kuitansi menampilkan tanggal pelunasan hanya dari tanggal konfirmasi pembayaran.

---

# 26. Design Tokens Mapping

Seluruh komponen wajib menggunakan Design Token.

Tidak diperbolehkan menggunakan warna hardcode.

Tidak diperbolehkan menggunakan spacing hardcode.

Tidak diperbolehkan menggunakan radius hardcode.

---

# 27. Component Mapping

| Business Process | Screen                      | Component                                      |
| ---------------- | --------------------------- | ---------------------------------------------- |
| BP-01            | Nota Dinas                  | Form, Table, Upload                            |
| BP-02            | SPT                         | Form Dinamis, Table                            |
| BP-03            | SPPD                        | Form, Date Picker                              |
| BP-04            | Laporan                     | Editor, Upload, Signature                      |
| BP-05            | Validasi SPJ dan Pembayaran | Stepper 5 tahap, Table Personil SPPD, Timeline |
| BP-06            | SPBY                        | Form, Preview                                  |
| BP-07            | Arsip                       | Table, Filter                                  |
| BP-07            | Arsip SPJ                   | Table, Search, Upload PDF                      |
| BP-08            | Rekapitulasi                | Chart, Table                                   |

---

# 28. Permission Mapping

Setiap screen wajib mengikuti Role-Based Access Control (RBAC).

Role:

- Administrator
- Supervisor
- Pegawai
- Sub Bagian Keuangan

Menu, tombol aksi, dan data yang ditampilkan harus mengikuti matriks hak akses pada PRD.

## 28.1 Authentication dan Akun Pengguna

- Form login hanya menampilkan field Username dan Password.
- Role tidak boleh ditampilkan sebagai pilihan karena role diturunkan otomatis dari akun dan Master Pegawai.
- Pintasan mock, apabila ditampilkan, harus menyebut identitas pegawai serta username dan tidak boleh menyamakan akun berdasarkan role.
- Master Akun Pengguna hanya terlihat dan dapat diakses oleh Administrator.
- Status akun, username, email, dan reset password dikelola pada dialog yang konsisten dengan komponen form dan dialog aplikasi.
- Role pada Master Akun Pengguna bersifat read-only; perubahan role dilakukan pada Master Pegawai.

## 28.2 Transfer Data Demo

- Kontrol Export/Import Data Demo hanya ditampilkan kepada Administrator pada halaman Pengaturan.
- Area transfer wajib menampilkan peringatan yang jelas bahwa fitur hanya digunakan pada lingkungan demo dan wajib dihapus ketika backend/database produksi tersedia.
- Tombol Export dan Import merupakan aksi terpisah, memiliki loading/disabled state, dan menggunakan komponen UI reusable.
- Sebelum import, sistem wajib menampilkan ringkasan sumber paket, waktu export, jumlah kelompok data, jumlah PDF Arsip SPJ, serta konfirmasi bahwa data browser tujuan akan diganti.
- Setelah import berhasil, pengguna diberi notifikasi lalu dialihkan ke halaman login.

## 28.3 Urutan Daftar Pegawai

- Semua menu, dropdown, detail approval, lampiran, arsip, dan preview dokumen yang menampilkan lebih dari satu pegawai wajib menggunakan urutan yang sama.
- Urutan struktural: **Ketua KPU → Anggota KPU → Sekretaris → Kepala Sub Bagian/Kasubbag → Staf**.
- Khusus kelompok Staf, tampilkan PNS Golongan `IV/d` turun sampai `I/a` terlebih dahulu, kemudian PPPK Golongan `XI` turun sampai `I`.
- Di dalam kategori dan Golongan yang sama, gunakan nama secara alfabetis sebagai pembanding akhir.
- Jangan mengubah urutan data tersimpan, relasi dokumen, atau nomor dokumen hanya untuk kebutuhan tampilan.
- Nomor urut pada tabel dan dokumen mengikuti hasil urutan tampilan tersebut.
- UI wajib mengingatkan bahwa paket berisi data operasional/akun demo dan bahwa transfer bukan sinkronisasi langsung antarperangkat.

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
