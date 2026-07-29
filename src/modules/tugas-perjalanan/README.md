# Tugas Perjalanan

Modul ini membentuk informasi tugas personal dari rantai dokumen yang sudah
tersimpan dan menampilkannya pada Dashboard.

## Referensi

- BP-03 — penerbitan SPPD individual dari SPT.
- BP-08 — Dashboard sesuai identitas dan scope pegawai.
- BP-10 — notifikasi persisten sesuai penerima.
- FR-098 — panel Tugas Perjalanan Saya.
- FR-099 — satu pengelola rangkaian SPPD per SPT.
- FR-100 — notifikasi personal berdasarkan `pegawaiId`.

- FR-114: seluruh SPJ aktif menjadi antrean tugas dan notifikasi personal Unit Keuangan.
- FR-115: catatan SPJ yang dikembalikan tampil dan ternotifikasi kepada seluruh personel SPT terkait.

## Sumber Data

`Nota Dinas → SPT → SPPD → Laporan → SPJ/Pembayaran` melalui service modul
yang sudah ada. Modul tidak menyimpan salinan transaksi.

## Batas Implementasi Mock

Data dan notifikasi masih menggunakan localStorage browser. Sinkronisasi
antarperangkat baru tersedia setelah service diarahkan ke Backend API dan
database terpusat.

Untuk role Sub Bagian Keuangan, service membuat satu tugas untuk setiap `spj.id`
yang belum berstatus Pembayaran Selesai. Aksi tugas mengikuti tahap Validasi SPJ,
penerbitan SPBY, dan Proses Pembayaran.
