# PANDUAN DEPLOYMENT SIMPENAS KE GOOGLE APPS SCRIPT & GOOGLE SHEETS

Dokumen ini berisi petunjuk lengkap langkah demi langkah untuk mengonfigurasi dan menghubungkan aplikasi **SIMPENAS (Sistem Informasi Manajemen Perjalanan Dinas)** dengan **Google Spreadsheet** sebagai basis data (_database_) menggunakan **Google Apps Script (GAS) Web App**.

---

## 1. Ringkasan Arsitektur

```text
┌────────────────────────────────────────────────────────┐
│               FRONTEND APLIKASI SIMPENAS               │
│        (Next.js 15, React 19, Tailwind CSS, PWA)       │
│             Aplikasi Desktop / Tablet / HP             │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP POST (CORS Simple Request)
                            ▼
┌────────────────────────────────────────────────────────┐
│           BACKEND: GOOGLE APPS SCRIPT WEB APP          │
│                       (Code.gs)                        │
│          doGet(e) / doPost(e) + LockService            │
└───────────────────────────┬────────────────────────────┘
                            │ SpreadsheetApp API
                            ▼
┌────────────────────────────────────────────────────────┐
│             DATABASE: GOOGLE SPREADSHEET               │
│   Sheet: user_accounts, pegawai, nota_dinas, spt,      │
│          sppd, laporan, kuitansi, dipa, sbm, dll.      │
└────────────────────────────────────────────────────────┘
```

---

## 2. Langkah-Langkah Deployment

### Langkah 1: Buat Google Spreadsheet Baru

1. Buka browser dan kunjungi [Google Sheets](https://sheets.new).
2. Beri nama spreadsheet tersebut, misalnya:
   `SIMPENAS Database - KPU Kab. Gorontalo`.

---

### Langkah 2: Buka Apps Script Editor

1. Pada menu navigasi Google Spreadsheet, klik **Ekstensi (Extensions)**.
2. Pilih **Apps Script**.
3. Tab baru editor Google Apps Script akan terbuka.
4. Beri nama proyek skrip (di pojok kiri atas), misalnya: `SIMPENAS Backend API`.

---

### Langkah 3: Tempelkan Source Code

1. Pada editor skrip, buka berkas `Code.gs`.
2. Hapus seluruh kode bawaan yang ada di editor.
3. Salin seluruh isi berkas [google-apps-script/Code.gs](file:///e:/SIMPENAS-APP/google-apps-script/Code.gs) yang telah disediakan.
4. Tempelkan (_paste_) ke dalam `Code.gs`.
5. Klik ikon **Simpan (Save)** atau tekan `Ctrl + S`.

---

### Langkah 4: Inisialisasi Database Otomatis

Fungsi `setupDatabase()` akan secara otomatis membuat 24 lembar kerja (_sheet_), mengatur baris _header_, warna tabel, serta mengisikan data master awal (Akun Admin, Pegawai, Unit Kerja, Jabatan, Pangkat, Penomoran, DIPA, dan SBM).

1. Pada bilah pilihan fungsi di bagian atas editor (di sebelah tombol _Jalankan / Run_), pilih fungsi **`setupDatabase`**.
2. Klik tombol **Jalankan (Run)**.
3. Google akan meminta izin otorisasi pada eksekusi pertama:
   - Klik **Tinjau Izin (Review permissions)**.
   - Pilih akun Google Anda.
   - Jika muncul peringatan _"Google belum memverifikasi aplikasi ini"_, klik **Lanjutan (Advanced)** di kiri bawah, lalu klik **Buka SIMPENAS Backend API (tidak aman)**.
   - Klik **Izinkan (Allow)**.
4. Tunggu beberapa detik hingga proses selesai.
5. Kembali ke Google Spreadsheet Anda: seluruh tabel kini telah tercipta rapi secara otomatis!

> **Tips Tambahan:**
> Setelah spreadsheet dimuat ulang (_refresh_), akan muncul menu baru di bilah menu spreadsheet bernama **⚡ SIMPENAS**. Anda dapat mengklik menu ini kapan saja untuk mengecek ringkasan status database atau melakukan inisialisasi ulang.

---

### Langkah 5: Terapkan (Deploy) Sebagai Web App

1. Di pojok kanan atas editor Apps Script, klik tombol biru **Terapkan (Deploy)**.
2. Pilih **Penerapan baru (New deployment)**.
3. Klik ikon gerigi ⚙️ di sebelah kiri _"Pilih jenis"_, lalu pilih **Aplikasi web (Web app)**.
4. Isi konfigurasi sebagai berikut:
   - **Deskripsi:** `SIMPENAS Production API v1`
   - **Jalankan sebagai (Execute as):** `Saya (email Anda)`
   - **Yang memiliki akses (Who has access):** `Siapa saja (Anyone)` _(Wajib dipilih 'Siapa saja' agar frontend SIMPENAS dapat berkomunikasi tanpa terblokir)._
5. Klik **Terapkan (Deploy)**.
6. Salin **URL Aplikasi Web** yang dihasilkan.
   Contoh format URL:
   ```text
   https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
   ```

---

### Langkah 6: Hubungkan ke Frontend SIMPENAS

1. Buka berkas [.env.local](file:///e:/SIMPENAS-APP/.env.local) dan/atau [.env.production](file:///e:/SIMPENAS-APP/.env.production) pada proyek SIMPENAS.
2. Perbarui nilai `NEXT_PUBLIC_API_URL` dengan URL Web App yang baru saja Anda salin:
   ```env
   NEXT_PUBLIC_API_URL=https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
   ```
3. Simpan berkas tersebut.

---

## 3. Akun Pengguna Bawaan (Default Login)

Setelah database diinisialisasi, Anda dapat langsung masuk ke aplikasi menggunakan akun bawaan berikut:

| Peran              | Username   | Kata Sandi    | Keterangan                                         |
| :----------------- | :--------- | :------------ | :------------------------------------------------- |
| **Administrator**  | `admin`    | `password123` | Akses penuh seluruh master data, akun & pengaturan |
| **Pegawai**        | `eriyanto` | `password123` | Buat Nota Dinas, usulkan SPT, input Laporan        |
| **Supervisor**     | `andi`     | `password123` | Verifikasi dan persetujuan (Approval)              |
| **Supervisor/KPA** | `herman`   | `password123` | Persetujuan tingkat pimpinan (KPA)                 |

> **Catatan Keamanan:**
> Sangat disarankan untuk segera mengubah kata sandi akun Administrator setelah sistem berhasil terpasang melalui menu **Ubah Kata Sandi** di aplikasi SIMPENAS.

---

## 4. Keunggulan & Fitur Khusus Backend Google Apps Script

1. **Bebas Masalah CORS (Cross-Origin Resource Sharing)**:
   Lapisan API [src/services/api.ts](file:///e:/SIMPENAS-APP/src/services/api.ts) SIMPENAS telah dioptimalkan untuk mengirim permintaan sebagai _CORS Simple Request_, sehingga browser tidak akan memicu kesalahan _preflight OPTIONS_ saat menghubungi Google Apps Script.
2. **Nomor Dokumen Aman dari Tabrakan (_Race-Condition Free_)**:
   Fitur **Ambil Nomor** menggunakan `LockService.getScriptLock()` dengan batas antrean 30 detik. Ini memastikan bahwa meskipun beberapa operator menekan tombol _Ambil Nomor_ secara serentak, nomor dokumen tidak akan pernah ganda.
3. **Data Transparan & Mudah Dibagikan**:
   Seluruh data tersimpan dalam bentuk baris Google Sheets. Anda dapat dengan mudah melakukan filter, cetak laporan Excel langsung, atau membagikan hak baca lembar kerja kepada pimpinan.
4. **Biaya Infrastruktur Nol (_Zero Cost_)**:
   Tidak memerlukan sewa VPS, domain khusus backend, maupun langganan basis data bulanan.
