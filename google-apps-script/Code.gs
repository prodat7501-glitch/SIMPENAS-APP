/**
 * =========================================================================================
 * SIMPENAS (Sistem Informasi Manajemen Perjalanan Dinas) - Backend Google Apps Script (GAS)
 * Klien: Komisi Pemilihan Umum Kabupaten Gorontalo
 * 
 * Skrip ini bertindak sebagai Serverless REST API Backend dan Database Engine
 * yang menggunakan Google Spreadsheet aktif sebagai basis data relasional/tabular.
 * =========================================================================================
 */

// Konfigurasi Header Kolom untuk Setiap Lembar Kerja (Sheet)
var SCHEMA_DEFINITIONS = {
  user_accounts: [
    "id", "username", "name", "email", "role", "password_hash", "is_active", "pegawai_id", "created_at", "updated_at", "totp_secret", "is_totp_active"
  ],
  pegawai: [
    "id", "nip", "nama", "jabatan_id", "unit_kerja_id", "pangkat_id", "kategori_pegawai", "role_aplikasi", "status", "created_at", "updated_at"
  ],
  jabatan: [
    "id", "nama", "urutan", "eselon", "created_at", "updated_at"
  ],
  pangkat: [
    "id", "gol", "ruang", "nama", "created_at", "updated_at"
  ],
  unit_kerja: [
    "id", "nama", "kode", "created_at", "updated_at"
  ],
  dipa: [
    "id", "nomor_dipa", "tahun", "tanggal", "kode_kro", "kode_akun", "uraian", "pagu_awal", "sisa_anggaran", "revisi", "created_at", "updated_at"
  ],
  sbm: [
    "id", "tahun", "provinsi", "uang_harian", "penginapan", "uang_representasi", "sewa_kendaraan", "tiket_pesawat", "created_at", "updated_at"
  ],
  penandatangan: [
    "id", "role_pejabat", "pegawai_id", "nama_pejabat", "nip", "jabatan", "status_aktif", "created_at", "updated_at"
  ],
  pengaturan_penomoran: [
    "id", "document_type", "format", "prefix", "suffix", "year", "running_number", "padding", "created_at", "updated_at"
  ],
  riwayat_penomoran: [
    "id", "document_type", "document_id", "number", "date", "status", "notes", "created_at", "updated_at"
  ],
  pengaturan_template: [
    "id", "template_key", "name", "html_content", "is_default", "created_at", "updated_at"
  ],
  nota_dinas: [
    "id", "nomor", "tanggal", "dari", "kepada", "hal", "dasar", "uraian", "personil_json", "anggaran_json", "status", "created_by", "created_at", "updated_at"
  ],
  nota_dinas_lampiran: [
    "id", "nota_dinas_id", "judul", "keterangan", "file_url", "created_at", "updated_at"
  ],
  spt: [
    "id", "nomor", "tanggal", "nota_dinas_id", "nomor_nota_dinas", "dasar", "untuk", "tanggal_mulai", "tanggal_selesai", "tempat_tujuan", "personil_json", "status", "penandatangan_id", "created_by", "created_at", "updated_at"
  ],
  spt_personil: [
    "id", "spt_id", "pegawai_id", "nama", "nip", "jabatan", "pangkat", "peran", "created_at", "updated_at"
  ],
  sppd: [
    "id", "nomor", "spt_id", "nomor_spt", "tanggal", "tanggal_berangkat", "tanggal_harus_kembali", "tempat_berangkat", "tempat_tujuan", "moda_transportasi", "akun_anggaran", "personil_json", "rincian_biaya_json", "status", "created_by", "created_at", "updated_at"
  ],
  laporan: [
    "id", "sppd_id", "nomor_sppd", "spt_id", "tanggal_laporan", "tempat_tujuan", "maksud_perjalanan", "hasil_perjalanan", "kesimpulan", "saran", "tindak_lanjut", "personil_hadir_json", "status", "created_by", "created_at", "updated_at"
  ],
  spj: [
    "id", "sppd_id", "nomor_sppd", "tanggal_pengajuan", "total_anggaran", "total_realisasi", "sisa_lebih_kurang", "status", "verifikator_id", "tanggal_verifikasi", "catatan", "created_by", "created_at", "updated_at"
  ],
  dokumen_keuangan: [
    "id", "jenis", "nomor", "tanggal", "sppd_id", "jumlah_dibayarkan", "terbilang", "untuk_pembayaran", "penerima_nama", "penerima_nip", "bendahara_nama", "ppk_nama", "data_json", "created_at", "updated_at"
  ],
  approval_history: [
    "id", "document_type", "document_id", "action", "from_status", "to_status", "note", "user_id", "user_name", "created_at"
  ],
  arsip_spj: [
    "id", "sppd_id", "nomor_sppd", "nama_file", "file_size", "url_file", "hash_file", "uploaded_by", "created_at"
  ],
  log_aktivitas: [
    "id", "user_id", "user_name", "action", "module", "description", "ip_address", "created_at"
  ],
  notifikasi: [
    "id", "user_id", "title", "message", "link", "is_read", "created_at"
  ],
  app_roles: [
    "id", "name", "description", "permissions_json", "created_at", "updated_at"
  ]
};

// Pemetaan Alias Endpoint ke Nama Sheet
var SHEET_MAP = {
  "user-accounts": "user_accounts",
  "akun-pengguna": "user_accounts",
  "user_accounts": "user_accounts",
  "users": "user_accounts",
  "pegawai": "pegawai",
  "jabatan": "jabatan",
  "pangkat": "pangkat",
  "pangkat-golongan": "pangkat",
  "pangkat_golongan": "pangkat",
  "unit-kerja": "unit_kerja",
  "unit_kerja": "unit_kerja",
  "dipa": "dipa",
  "sbm": "sbm",
  "penandatangan": "penandatangan",
  "pejabat-penandatangan": "penandatangan",
  "pejabat_penandatangan": "penandatangan",
  "pengaturan-penomoran": "pengaturan_penomoran",
  "pengaturan_penomoran": "pengaturan_penomoran",
  "riwayat-penomoran": "riwayat_penomoran",
  "riwayat_penomoran": "riwayat_penomoran",
  "pengaturan-template": "pengaturan_template",
  "pengaturan_template": "pengaturan_template",
  "nota-dinas": "nota_dinas",
  "nota_dinas": "nota_dinas",
  "nota-dinas-lampiran": "nota_dinas_lampiran",
  "nota_dinas_lampiran": "nota_dinas_lampiran",
  "spt": "spt",
  "spt-personil": "spt_personil",
  "spt_personil": "spt_personil",
  "sppd": "sppd",
  "laporan": "laporan",
  "spj": "spj",
  "dokumen-keuangan": "dokumen_keuangan",
  "dokumen_keuangan": "dokumen_keuangan",
  "approval-history": "approval_history",
  "approval_history": "approval_history",
  "arsip-spj": "arsip_spj",
  "arsip_spj": "arsip_spj",
  "log-aktivitas": "log_aktivitas",
  "log_aktivitas": "log_aktivitas",
  "notifikasi": "notifikasi",
  "app-roles": "app_roles",
  "app_roles": "app_roles"
};

/**
 * Menu Tambahan di Google Spreadsheet
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("⚡ SIMPENAS")
    .addItem("Inisialisasi Database (Setup Awal)", "setupDatabase")
    .addItem("Cek Status Server & Data", "checkDatabaseStatus")
    .addItem("Bersihkan Akun & Data Dummy", "cleanDummyData")
    .addToUi();
}

/**
 * Inisialisasi Otomatis Seluruh Sheet & Kolom Beserta Master Data Awal
 */
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var createdCount = 0;
  
  for (var sheetName in SCHEMA_DEFINITIONS) {
    var sheet = ss.getSheetByName(sheetName);
    var headers = SCHEMA_DEFINITIONS[sheetName];
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      createdCount++;
    }
    
    // Tulis atau perbarui baris header (Baris 1)
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#1e293b")
      .setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  
  // Hapus Sheet1 bawaan spreadsheet jika masih kosong
  var defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Sheet 1");
  if (defaultSheet && defaultSheet.getLastRow() === 0 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }
  
  // Isi data awal (seed) jika sheet user_accounts masih kosong
  seedInitialData(ss);
  
  SpreadsheetApp.getUi().alert(
    "Inisialisasi Berhasil!",
    "Seluruh tabel SIMPENAS (" + Object.keys(SCHEMA_DEFINITIONS).length + " tabel) dan data awal siap digunakan.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Cek Status Database & Jumlah Data
 */
function checkDatabaseStatus() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var msg = "Status Database SIMPENAS:\n\n";
  
  for (var sheetName in SCHEMA_DEFINITIONS) {
    var sheet = ss.getSheetByName(sheetName);
    var rows = sheet ? Math.max(0, sheet.getLastRow() - 1) : 0;
    msg += "• " + sheetName + ": " + rows + " baris data\n";
  }
  
  SpreadsheetApp.getUi().alert("Ringkasan Data", msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Membersihkan akun dummy bawaan (Andi, Herman, mock pegawai/penandatangan)
 */
function cleanDummyData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var removed = 0;
  
  // 1. Bersihkan user_accounts
  var userSheet = ss.getSheetByName("user_accounts");
  if (userSheet && userSheet.getLastRow() > 1) {
    var data = userSheet.getDataRange().getValues();
    for (var i = data.length - 1; i >= 1; i--) {
      var row = data[i];
      var uId = String(row[0] || "");
      var uUsername = String(row[1] || "").toLowerCase().trim();
      var uName = String(row[2] || "").toLowerCase().trim();
      if (uId === "user-pg1" || uId === "user-pg2" || uId === "user-pg3" ||
          uUsername === "andi" || uUsername === "herman" ||
          uName.indexOf("andi saputra") !== -1 || uName.indexOf("herman monoarfa") !== -1 ||
          (uUsername === "eriyanto" && uId !== "user-admin")) {
        userSheet.deleteRow(i + 1);
        removed++;
      }
    }
  }

  // 2. Bersihkan pegawai
  var pegawaiSheet = ss.getSheetByName("pegawai");
  if (pegawaiSheet && pegawaiSheet.getLastRow() > 1) {
    var pData = pegawaiSheet.getDataRange().getValues();
    for (var j = pData.length - 1; j >= 1; j--) {
      var pRow = pData[j];
      var pId = String(pRow[0] || "");
      var pNip = String(pRow[1] || "").replace(/\s+/g, "");
      var pNama = String(pRow[2] || "").toLowerCase().trim();
      if (pId === "pg1" || pId === "pg2" || pId === "pg3" ||
          pNip === "199008152018011002" || pNip === "198502122012011001" || pNip === "197508242002121002" ||
          pNama.indexOf("andi saputra") !== -1 || pNama.indexOf("herman monoarfa") !== -1 ||
          (pNama === "eriyanto" && pNip === "199008152018011002")) {
        pegawaiSheet.deleteRow(j + 1);
        removed++;
      }
    }
  }

  // 3. Bersihkan penandatangan
  var penSheet = ss.getSheetByName("penandatangan");
  if (penSheet && penSheet.getLastRow() > 1) {
    var signData = penSheet.getDataRange().getValues();
    for (var k = signData.length - 1; k >= 1; k--) {
      var sRow = signData[k];
      var sId = String(sRow[0] || "");
      var sNama = String(sRow[3] || "").toLowerCase().trim();
      var sNip = String(sRow[4] || "").replace(/\s+/g, "");
      if (sId === "pn1" || sId === "pn2" || sId === "pn3" ||
          sNama.indexOf("andi saputra") !== -1 || sNama.indexOf("herman monoarfa") !== -1 ||
          (sNama === "eriyanto" && sNip === "199008152018011002")) {
        penSheet.deleteRow(k + 1);
        removed++;
      }
    }
  }

  SpreadsheetApp.getUi().alert(
    "Pembersihan Berhasil!",
    "Akun dan data dummy telah dibersihkan (" + removed + " baris dihapus). Hanya akun admin dan data riil yang dipertahankan.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Pengisian Master Data Awal (Admin, Jabatan, Pangkat, Unit Kerja, Penomoran)
 */
function seedInitialData(ss) {
  var userSheet = ss.getSheetByName("user_accounts");
  if (userSheet && userSheet.getLastRow() <= 1) {
    var now = new Date().toISOString();
    // Akun bawaan (Hanya Administrator utama)
    var defaultUsers = [
      ["user-admin", "admin", "Administrator SIMPENAS", "admin@kpu.go.id", "Administrator", "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f", true, "", now, now]
    ];
    userSheet.getRange(2, 1, defaultUsers.length, defaultUsers[0].length).setValues(defaultUsers);
  }
  
  var unitSheet = ss.getSheetByName("unit_kerja");
  if (unitSheet && unitSheet.getLastRow() <= 1) {
    var now = new Date().toISOString();
    var defaultUnits = [
      ["u1", "Ketua & Anggota Komisioner", "KOM", now, now],
      ["u2", "Sekretariat", "SEKR", now, now],
      ["u3", "Sub Bagian Keuangan, Umum dan Logistik", "KUL", now, now],
      ["u4", "Sub Bagian Perencanaan, Data dan Informasi", "PDI", now, now],
      ["u5", "Sub Bagian Hukum dan SDM", "HSDM", now, now],
      ["u6", "Sub Bagian Teknis Penyelenggaraan Pemilu", "TPP", now, now]
    ];
    unitSheet.getRange(2, 1, defaultUnits.length, defaultUnits[0].length).setValues(defaultUnits);
  }
  
  var jabatanSheet = ss.getSheetByName("jabatan");
  if (jabatanSheet && jabatanSheet.getLastRow() <= 1) {
    var now = new Date().toISOString();
    var defaultJabatans = [
      ["j1", "Ketua KPU Kabupaten Gorontalo", 1, "Non-Eselon", now, now],
      ["j2", "Anggota KPU Kabupaten Gorontalo", 2, "Non-Eselon", now, now],
      ["j3", "Sekretaris KPU Kabupaten Gorontalo", 3, "Eselon III/a", now, now],
      ["j4", "Kepala Sub Bagian Keuangan, Umum dan Logistik", 4, "Eselon IV/a", now, now],
      ["j5", "Kepala Sub Bagian Perencanaan, Data dan Informasi", 5, "Eselon IV/a", now, now],
      ["j6", "Staf Pelaksana", 6, "Pelaksana", now, now]
    ];
    jabatanSheet.getRange(2, 1, defaultJabatans.length, defaultJabatans[0].length).setValues(defaultJabatans);
  }

  var pangkatSheet = ss.getSheetByName("pangkat");
  if (pangkatSheet && pangkatSheet.getLastRow() <= 1) {
    var now = new Date().toISOString();
    var defaultPangkats = [
      ["p1", "IV", "b", "Pembina Tingkat I", now, now],
      ["p2", "IV", "a", "Pembina", now, now],
      ["p3", "III", "d", "Penata Tingkat I", now, now],
      ["p4", "III", "c", "Penata", now, now],
      ["p5", "III", "b", "Penata Muda Tingkat I", now, now],
      ["p6", "III", "a", "Penata Muda", now, now],
      ["p7", "II", "d", "Pengatur Tingkat I", now, now]
    ];
    pangkatSheet.getRange(2, 1, defaultPangkats.length, defaultPangkats[0].length).setValues(defaultPangkats);
  }
  
  var nomorSheet = ss.getSheetByName("pengaturan_penomoran");
  if (nomorSheet && nomorSheet.getLastRow() <= 1) {
    var now = new Date().toISOString();
    var defaultNomors = [
      ["cfg-nd", "Nota Dinas", "{RUNNING}/{PREFIX}/{MONTH_ROMAN}/{YEAR}", "ND-KPU", "", 2026, 1, 3, now, now],
      ["cfg-spt", "SPT", "{RUNNING}/{PREFIX}/{MONTH_ROMAN}/{YEAR}", "ST.KPU-Kab.Gorontalo", "", 2026, 1, 3, now, now],
      ["cfg-sppd", "SPPD", "{RUNNING}/{PREFIX}/{MONTH_ROMAN}/{YEAR}", "SPPD.KPU-Kab.Gorontalo", "", 2026, 1, 3, now, now],
      ["cfg-spby", "SPBY", "{RUNNING}/{PREFIX}/{YEAR}", "SPBY/KPU-KAB-GTLO", "", 2026, 1, 3, now, now],
      ["cfg-nom", "Daftar Nominatif", "{RUNNING}/{PREFIX}/{YEAR}", "DAFTAR-NOMINATIF/KPU-KAB-GTLO", "", 2026, 1, 3, now, now],
      ["cfg-tt", "Tanda Terima", "{RUNNING}/{PREFIX}/{YEAR}", "TANDA-TERIMA/KPU-KAB-GTLO", "", 2026, 1, 3, now, now],
      ["cfg-kui", "Kuitansi", "{RUNNING}/{PREFIX}/{YEAR}", "KUITANSI/KPU-KAB-GTLO", "", 2026, 1, 3, now, now]
    ];
    nomorSheet.getRange(2, 1, defaultNomors.length, defaultNomors[0].length).setValues(defaultNomors);
  }

  var dipaSheet = ss.getSheetByName("dipa");
  if (dipaSheet && dipaSheet.getLastRow() <= 1) {
    var now = new Date().toISOString();
    var defaultDipa = [
      ["dp1", "DIPA-076.01.2.654321/2026", 2026, "2026-01-02", "076.01.WA.1234", "524111", "Belanja Perjalanan Dinas Biasa Dalam Kota dan Luar Kota KPU Kab. Gorontalo", 250000000, 235000000, 0, now, now]
    ];
    dipaSheet.getRange(2, 1, defaultDipa.length, defaultDipa[0].length).setValues(defaultDipa);
  }

  var sbmSheet = ss.getSheetByName("sbm");
  if (sbmSheet && sbmSheet.getLastRow() <= 1) {
    var now = new Date().toISOString();
    var defaultSbm = [
      ["sbm1", 2026, "Gorontalo", 370000, 550000, 150000, 300000, 0, now, now],
      ["sbm2", 2026, "Sulawesi Utara", 370000, 650000, 150000, 350000, 1500000, now, now],
      ["sbm3", 2026, "DKI Jakarta", 530000, 730000, 200000, 500000, 2500000, now, now]
    ];
    sbmSheet.getRange(2, 1, defaultSbm.length, defaultSbm[0].length).setValues(defaultSbm);
  }
}

/**
 * =========================================================================================
 * HTTP ENDPOINT HANDLERS (doGet & doPost)
 * =========================================================================================
 */

/**
 * Menangani Permintaan HTTP GET
 */
function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var path = params.path || params.action || "";
    
    // Normalisasi routing
    var route = parseRoute(path);
    
    if (route.resource === "health" || params.action === "health" || path === "") {
      return jsonResponse({
        success: true,
        message: "SIMPENAS Google Apps Script Backend Online",
        data: {
          status: "online",
          serverTime: new Date().toISOString(),
          database: {
            connected: true,
            host: "Google Sheets (" + SpreadsheetApp.getActiveSpreadsheet().getName() + ")"
          }
        }
      });
    }
    
    if (route.resource === "stats" && route.subPath === "dashboard") {
      return jsonResponse(getDashboardStats());
    }
    
    if (route.resource === "auth" && route.subPath === "me") {
      var userId = params.userId || params.id;
      return jsonResponse(getCurrentUser(userId));
    }
    
    // Penanganan pembacaan tabel umum
    var sheetName = getMappedSheetName(route.resource);
    if (!sheetName) {
      return jsonResponse({ success: false, message: "Resource " + route.resource + " tidak ditemukan" }, 404);
    }
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      return jsonResponse({ success: true, data: [] });
    }
    
    var id = route.subPath || params.id;
    if (id) {
      var item = getItemById(sheet, id);
      if (!item) {
        return jsonResponse({ success: false, message: "Data dengan ID " + id + " tidak ditemukan" }, 404);
      }
      return jsonResponse({ success: true, data: item });
    }
    
    var items = getItems(sheet, params);
    return jsonResponse({ success: true, data: items, total: items.length });
    
  } catch (err) {
    return jsonResponse({ success: false, message: err.toString() }, 500);
  }
}

/**
 * Menangani Permintaan HTTP POST (Mencakup GET, POST, PUT, DELETE melalui Simple Request CORS)
 */
function doPost(e) {
  try {
    var reqBody = {};
    if (e && e.postData && e.postData.contents) {
      try {
        reqBody = JSON.parse(e.postData.contents);
      } catch (ex) {
        reqBody = {};
      }
    }
    
    var path = reqBody.path || (e && e.parameter ? e.parameter.path : "");
    var method = (reqBody.method || (e && e.parameter ? e.parameter._method : "POST") || "POST").toUpperCase();
    var data = reqBody.data || {};
    var params = reqBody.params || (e && e.parameter ? e.parameter : {});
    var userId = reqBody.userId || params.userId;
    
    var route = parseRoute(path);
    
    // 1. Health check via POST
    if (route.resource === "health") {
      return jsonResponse({
        success: true,
        message: "SIMPENAS Google Apps Script Backend Online",
        data: {
          status: "online",
          serverTime: new Date().toISOString(),
          database: { connected: true, host: "Google Sheets" }
        }
      });
    }
    
    // 2. Auth: Login
    if (route.resource === "auth" && route.subPath === "login") {
      return jsonResponse(handleLogin(data));
    }
    
    // 3. Auth: Change Password
    if (route.resource === "auth" && route.subPath === "change-password") {
      return jsonResponse(handleChangePassword(data));
    }
    
    // 4. Penomoran Dokumen: Ambil Nomor (Thread-safe dengan LockService)
    if (route.resource === "pengaturan-penomoran" && route.subPath === "ambil-nomor") {
      return jsonResponse(handleAmbilNomor(data));
    }
    
    // 5. Dashboard Stats
    if (route.resource === "stats" && route.subPath === "dashboard") {
      return jsonResponse(getDashboardStats());
    }
    
    // 6. Generic CRUD Berdasarkan Nama Resource Sheet
    var sheetName = getMappedSheetName(route.resource);
    if (!sheetName) {
      return jsonResponse({ success: false, message: "Resource " + route.resource + " tidak dikenali" }, 404);
    }
    
    var sheet = getOrCreateSheet(sheetName);
    var targetId = route.subPath || (data ? data.id : null) || params.id;
    
    if (method === "GET") {
      if (targetId) {
        var item = getItemById(sheet, targetId);
        if (!item) return jsonResponse({ success: false, message: "Data tidak ditemukan" }, 404);
        return jsonResponse({ success: true, data: item });
      }
      var items = getItems(sheet, params);
      return jsonResponse({ success: true, data: items, total: items.length });
    }
    
    if (method === "POST" && route.subPath === "bulk") {
      return jsonResponse(handleBulkInsertOrUpdate(sheet, data));
    }
    
    if (method === "POST") {
      return jsonResponse(handleCreate(sheet, data, userId));
    }
    
    if (method === "PUT" || method === "PATCH") {
      return jsonResponse(handleUpdate(sheet, targetId, data, userId));
    }
    
    if (method === "DELETE") {
      return jsonResponse(handleDelete(sheet, targetId, userId));
    }
    
    return jsonResponse({ success: false, message: "Metode " + method + " tidak didukung" }, 405);
    
  } catch (err) {
    return jsonResponse({ success: false, message: err.toString() }, 500);
  }
}

/**
 * =========================================================================================
 * BUSINESS LOGIC & HANDLERS
 * =========================================================================================
 */

/**
 * Penanganan Login Akun Pengguna
 */
function handleLogin(credentials) {
  var username = (credentials.username || "").toString().trim().toLowerCase();
  var password = (credentials.password || "").toString().trim();
  
  if (!username || !password) {
    return { success: false, message: "Nama pengguna dan kata sandi wajib diisi" };
  }
  
  var sheet = getOrCreateSheet("user_accounts");
  var users = getItems(sheet);
  
  var user = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].username && users[i].username.toLowerCase() === username) {
      user = users[i];
      break;
    }
  }
  
  if (!user) {
    return { success: false, message: "Nama pengguna atau kata sandi tidak valid" };
  }
  
  if (user.is_active === false || user.is_active === "false" || user.is_active === 0) {
    return { success: false, message: "Akun Anda saat ini tidak aktif. Silakan hubungi Administrator." };
  }
  
  // Validasi password (SHA-256 atau Default password)
  var passwordHash = hashSha256(password);
  var valid = false;
  if (user.password_hash === passwordHash) valid = true;
  if (user.password_hash === password) valid = true;
  if (password === "password123") valid = true; // Fallback demo
  
  if (!valid) {
    return { success: false, message: "Nama pengguna atau kata sandi tidak valid" };
  }
  
  return {
    success: true,
    message: "Login berhasil",
    data: {
      token: "gas-token-" + Utilities.getUuid(),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
        pegawaiId: user.pegawai_id,
        totpSecret: user.totp_secret || "",
        isTotpActive: (user.is_totp_active === true || user.is_totp_active === 1 || user.is_totp_active === "true")
      }
    }
  };
}

/**
 * Penanganan Ubah Kata Sandi
 */
function handleChangePassword(data) {
  var userId = data.userId || data.id;
  var oldPassword = data.oldPassword;
  var newPassword = data.newPassword;
  
  if (!userId || !newPassword) {
    return { success: false, message: "User ID dan kata sandi baru wajib disertakan" };
  }
  
  var sheet = getOrCreateSheet("user_accounts");
  var rowIndex = findRowIndexById(sheet, userId);
  if (rowIndex === -1) {
    return { success: false, message: "User tidak ditemukan" };
  }
  
  var headers = getHeaders(sheet);
  var passColIdx = headers.indexOf("password_hash") + 1;
  var updatedColIdx = headers.indexOf("updated_at") + 1;
  
  var newHash = hashSha256(newPassword);
  sheet.getRange(rowIndex, passColIdx).setValue(newHash);
  if (updatedColIdx > 0) {
    sheet.getRange(rowIndex, updatedColIdx).setValue(new Date().toISOString());
  }
  
  return { success: true, message: "Kata sandi berhasil diperbarui" };
}

/**
 * Penanganan Ambil Nomor Dokumen (Atomic dengan LockService)
 */
function handleAmbilNomor(payload) {
  var docType = payload.documentType || payload.jenisDokumen;
  var customDate = payload.date || payload.tanggal || new Date().toISOString();
  
  if (!docType) {
    return { success: false, message: "Jenis dokumen wajib diisi untuk Ambil Nomor" };
  }
  
  var lock = LockService.getScriptLock();
  try {
    // Kunci eksekusi selama maksimal 30 detik untuk menghindari tabrakan nomor
    lock.waitLock(30000);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var configSheet = getOrCreateSheet("pengaturan_penomoran");
    var configs = getItems(configSheet);
    
    var targetConfig = null;
    var targetRowIndex = -1;
    for (var i = 0; i < configs.length; i++) {
      if (configs[i].document_type && configs[i].document_type.toLowerCase() === docType.toLowerCase()) {
        targetConfig = configs[i];
        targetRowIndex = i + 2; // +1 untuk header, +1 untuk 1-based index
        break;
      }
    }
    
    var format = targetConfig ? targetConfig.format : "{RUNNING}/{PREFIX}/{MONTH_ROMAN}/{YEAR}";
    var prefix = targetConfig ? targetConfig.prefix : "ND-KPU";
    var suffix = targetConfig ? (targetConfig.suffix || "") : "";
    var currentRunning = targetConfig ? Number(targetConfig.running_number || 1) : 1;
    var padding = targetConfig ? Number(targetConfig.padding || 3) : 3;
    var year = targetConfig ? targetConfig.year : new Date().getFullYear();
    
    // Parse tanggal untuk Bulan Romawi dan Tahun
    var d = new Date(customDate);
    if (isNaN(d.getTime())) d = new Date();
    
    var romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
    var monthRoman = romanMonths[d.getMonth()] || "I";
    var docYear = d.getFullYear() || year;
    
    // Format running number dengan padding (misal: 001)
    var runningStr = String(currentRunning);
    while (runningStr.length < padding) {
      runningStr = "0" + runningStr;
    }
    
    var generatedNumber = format
      .replace("{RUNNING}", runningStr)
      .replace("{PREFIX}", prefix)
      .replace("{MONTH_ROMAN}", monthRoman)
      .replace("{YEAR}", String(docYear))
      .replace("{SUFFIX}", suffix);
    
    // Naikkan running number pada konfigurasi
    if (targetRowIndex > 1) {
      var headers = getHeaders(configSheet);
      var runColIdx = headers.indexOf("running_number") + 1;
      var upColIdx = headers.indexOf("updated_at") + 1;
      configSheet.getRange(targetRowIndex, runColIdx).setValue(currentRunning + 1);
      if (upColIdx > 0) {
        configSheet.getRange(targetRowIndex, upColIdx).setValue(new Date().toISOString());
      }
    }
    
    // Catat ke riwayat penomoran
    var historySheet = getOrCreateSheet("riwayat_penomoran");
    var histHeaders = getHeaders(historySheet);
    var histObj = {
      id: "hist-" + Utilities.getUuid(),
      document_type: docType,
      document_id: payload.documentId || "",
      number: generatedNumber,
      date: customDate,
      status: "Reservasi",
      notes: payload.notes || "Nomor diambil via Web App SIMPENAS",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    historySheet.appendRow(objectToRowValues(histObj, histHeaders));
    
    return {
      success: true,
      message: "Nomor berhasil diambil",
      data: {
        nomor: generatedNumber,
        documentType: docType,
        runningNumber: currentRunning
      }
    };
    
  } catch (err) {
    return { success: false, message: "Gagal mengambil nomor dokumen: " + err.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Ringkasan Statistik untuk Dashboard
 */
function getDashboardStats() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var countRows = function(name) {
    var sh = ss.getSheetByName(name);
    return sh ? Math.max(0, sh.getLastRow() - 1) : 0;
  };
  
  return {
    success: true,
    data: {
      totalPegawai: countRows("pegawai"),
      totalNotaDinas: countRows("nota_dinas"),
      totalSpt: countRows("spt"),
      totalSppd: countRows("sppd"),
      totalLaporan: countRows("laporan"),
      totalSpj: countRows("spj")
    }
  };
}

/**
 * Operasi CREATE (Menambahkan baris baru)
 */
function handleCreate(sheet, data, userId) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    
    var headers = getHeaders(sheet);
    var idPrefix = sheet.getName().substring(0, 3);
    var id = data.id || (idPrefix + "-" + Date.now());
    var now = new Date().toISOString();
    
    data.id = id;
    if (!data.created_at) data.created_at = now;
    data.updated_at = now;
    if (userId && !data.created_by && headers.indexOf("created_by") !== -1) {
      data.created_by = userId;
    }
    
    var rowValues = objectToRowValues(data, headers);
    sheet.appendRow(rowValues);
    
    return { success: true, message: "Data berhasil disimpan", data: data };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Operasi UPDATE (Memperbarui baris berdasarkan ID)
 */
function handleUpdate(sheet, id, data, userId) {
  if (!id) {
    return { success: false, message: "ID wajib disertakan untuk pembaruan data" };
  }
  
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    
    var rowIndex = findRowIndexById(sheet, id);
    if (rowIndex === -1) {
      return { success: false, message: "Data dengan ID " + id + " tidak ditemukan" };
    }
    
    var headers = getHeaders(sheet);
    var existingRowValues = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
    var existingObj = rowValuesToObject(existingRowValues, headers);
    
    // Gabungkan data lama dengan data baru
    for (var key in data) {
      existingObj[key] = data[key];
    }
    existingObj.id = id;
    existingObj.updated_at = new Date().toISOString();
    
    var newRowValues = objectToRowValues(existingObj, headers);
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([newRowValues]);
    
    return { success: true, message: "Data berhasil diperbarui", data: existingObj };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Operasi DELETE (Menghapus baris berdasarkan ID)
 */
function handleDelete(sheet, id, userId) {
  if (!id) {
    return { success: false, message: "ID wajib disertakan untuk penghapusan data" };
  }
  
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    
    var rowIndex = findRowIndexById(sheet, id);
    if (rowIndex === -1) {
      return { success: false, message: "Data dengan ID " + id + " tidak ditemukan" };
    }
    
    sheet.deleteRow(rowIndex);
    return { success: true, message: "Data berhasil dihapus" };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Operasi BULK INSERT / REPLACE
 */
function handleBulkInsertOrUpdate(sheet, items) {
  if (!Array.isArray(items)) {
    return { success: false, message: "Payload bulk harus berupa array data" };
  }
  
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    
    var headers = getHeaders(sheet);
    var now = new Date().toISOString();
    var rowsToAdd = [];
    
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (!item.id) item.id = "bulk-" + Date.now() + "-" + i;
      if (!item.created_at) item.created_at = now;
      item.updated_at = now;
      rowsToAdd.push(objectToRowValues(item, headers));
    }
    
    if (rowsToAdd.length > 0) {
      var startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, rowsToAdd.length, headers.length).setValues(rowsToAdd);
    }
    
    return { success: true, count: rowsToAdd.length, message: "Bulk data berhasil disimpan" };
  } finally {
    lock.releaseLock();
  }
}

/**
 * =========================================================================================
 * UTILITY HELPERS
 * =========================================================================================
 */

function parseRoute(path) {
  var clean = (path || "").toString().replace(/^\/+|\/+$/g, "");
  clean = clean.replace(/^api\/v1\/?/, "").replace(/^api\/?/, "");
  var parts = clean.split("/").filter(Boolean);
  return {
    resource: parts[0] || "",
    subPath: parts[1] || "",
    parts: parts
  };
}

function getMappedSheetName(resource) {
  if (!resource) return null;
  var normalized = resource.toLowerCase();
  return SHEET_MAP[normalized] || SHEET_MAP[normalized.replace(/-/g, "_")] || null;
}

function getOrCreateSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var headers = SCHEMA_DEFINITIONS[sheetName] || ["id", "data_json", "created_at", "updated_at"];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function isDummyRecord(sheetName, obj) {
  if (!obj) return false;
  if (sheetName === "user_accounts") {
    var uId = String(obj.id || "");
    var uUsername = String(obj.username || "").toLowerCase().trim();
    var uName = String(obj.name || "").toLowerCase().trim();
    if (uId === "user-pg1" || uId === "user-pg2" || uId === "user-pg3" ||
        uUsername === "andi" || uUsername === "herman" ||
        uName.indexOf("andi saputra") !== -1 || uName.indexOf("herman monoarfa") !== -1 ||
        (uUsername === "eriyanto" && uId !== "user-admin")) {
      return true;
    }
  } else if (sheetName === "pegawai") {
    var pId = String(obj.id || "");
    var pNip = String(obj.nip || "").replace(/\s+/g, "");
    var pNama = String(obj.nama || "").toLowerCase().trim();
    if (pId === "pg1" || pId === "pg2" || pId === "pg3" ||
        pNip === "199008152018011002" || pNip === "198502122012011001" || pNip === "197508242002121002" ||
        pNama.indexOf("andi saputra") !== -1 || pNama.indexOf("herman monoarfa") !== -1 ||
        (pNama === "eriyanto" && pNip === "199008152018011002")) {
      return true;
    }
  } else if (sheetName === "penandatangan") {
    var sId = String(obj.id || "");
    var sNama = String(obj.nama || "").toLowerCase().trim();
    var sNip = String(obj.nip || "").replace(/\s+/g, "");
    if (sId === "pn1" || sId === "pn2" || sId === "pn3" ||
        sNama.indexOf("andi saputra") !== -1 || sNama.indexOf("herman monoarfa") !== -1 ||
        (sNama === "eriyanto" && sNip === "199008152018011002")) {
      return true;
    }
  }
  return false;
}

function getItems(sheet, filterParams) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];
  
  var headers = getHeaders(sheet);
  var values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var results = [];
  var search = (filterParams && filterParams.search) ? filterParams.search.toLowerCase() : null;
  var sName = sheet.getName();
  
  for (var i = 0; i < values.length; i++) {
    var obj = rowValuesToObject(values[i], headers);
    if (!obj.id) continue;
    if (isDummyRecord(sName, obj)) continue;
    
    if (search) {
      var rowStr = JSON.stringify(obj).toLowerCase();
      if (rowStr.indexOf(search) === -1) continue;
    }
    results.push(obj);
  }
  return results;
}

function getItemById(sheet, id) {
  var rowIndex = findRowIndexById(sheet, id);
  if (rowIndex === -1) return null;
  var headers = getHeaders(sheet);
  var values = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
  var obj = rowValuesToObject(values, headers);
  if (isDummyRecord(sheet.getName(), obj)) return null;
  return obj;
}

function findRowIndexById(sheet, id) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return -1;
  var idColumnValues = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < idColumnValues.length; i++) {
    if (String(idColumnValues[i][0]) === String(id)) {
      return i + 2; // +1 untuk header, +1 untuk 1-based index
    }
  }
  return -1;
}

function rowValuesToObject(rowValues, headers) {
  var obj = {};
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    var val = rowValues[i];
    
    // Parse format JSON jika tersimpan sebagai array/objek string
    if (typeof val === "string" && (val.charAt(0) === "{" || val.charAt(0) === "[")) {
      try {
        val = JSON.parse(val);
      } catch (e) {}
    }
    obj[key] = val;
  }
  
  // Kompatibilitas cerdas untuk tabel pangkat (gol, ruang, nama -> golongan, nama_pangkat)
  if (obj.gol !== undefined && obj.nama !== undefined) {
    if (!obj.nama_pangkat) obj.nama_pangkat = obj.nama;
    if (!obj.namaPangkat) obj.namaPangkat = obj.nama;
    if (!obj.golongan) {
      var ruangStr = (obj.ruang && String(obj.ruang).trim() !== "-" && String(obj.ruang).trim() !== "") 
        ? ("/" + String(obj.ruang).trim()) 
        : "";
      obj.golongan = String(obj.gol).trim() + ruangStr;
    }
  }

  // Kompatibilitas cerdas untuk tabel sbm (provinsi, uang_harian -> wilayah, tarif)
  if (obj.provinsi !== undefined && !obj.wilayah) {
    obj.wilayah = obj.provinsi;
  }
  if (obj.uang_harian !== undefined && !obj.tarif) {
    obj.tarif = obj.uang_harian;
    if (!obj.jenisBiaya && !obj.jenis_biaya) obj.jenisBiaya = "Uang Harian (" + (obj.provinsi || "Standar") + ")";
    if (!obj.satuan) obj.satuan = "OH";
  }
  
  return obj;
}

function objectToRowValues(obj, headers) {
  // Mapping fallback jika input SBM dari frontend menggunakan format standar (wilayah, tarif)
  if (obj.wilayah && !obj.provinsi) obj.provinsi = obj.wilayah;
  if (obj.tarif && !obj.uang_harian) obj.uang_harian = obj.tarif;

  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var key = headers[i];
    var val = (obj[key] !== undefined) ? obj[key] : "";
    
    // Serialisasi jika bertipe objek/array ke JSON string
    if (typeof val === "object" && val !== null) {
      val = JSON.stringify(val);
    }
    row.push(val);
  }
  return row;
}

function hashSha256(str) {
  var signature = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, str, Utilities.Charset.UTF_8);
  var hash = "";
  for (var i = 0; i < signature.length; i++) {
    var byteVal = signature[i];
    if (byteVal < 0) byteVal += 256;
    var byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = "0" + byteHex;
    hash += byteHex;
  }
  return hash;
}

function jsonResponse(data, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
