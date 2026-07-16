"use client";

import { useAuth } from "@/hooks/useAuth";
import { useNotificationStore } from "@/stores/notification.store";
import {
  Users,
  FileText,
  CheckSquare,
  Wallet,
  Map,
  Clock,
  Activity,
  AlertCircle,
  FileSpreadsheet,
  PlusCircle,
  Bell,
  TrendingUp,
  FileDown,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Mock Chart Datasets
const adminData = [
  { name: "Jan", Pagu: 1200, Realisasi: 420 },
  { name: "Feb", Pagu: 1200, Realisasi: 680 },
  { name: "Mar", Pagu: 1200, Realisasi: 840 },
  { name: "Apr", Pagu: 1200, Realisasi: 980 },
];

const supervisorData = [
  { name: "Jan", Perjalanan: 12, Selesai: 10 },
  { name: "Feb", Perjalanan: 24, Selesai: 18 },
  { name: "Mar", Perjalanan: 36, Selesai: 30 },
  { name: "Apr", Perjalanan: 22, Selesai: 15 },
];

const pegawaiData = [
  { name: "Jan", Hari: 4 },
  { name: "Feb", Hari: 10 },
  { name: "Mar", Hari: 16 },
  { name: "Apr", Hari: 8 },
];

const keuanganData = [
  { name: "Jan", SPBY: 150, Kuitansi: 120 },
  { name: "Feb", Pagu: 320, Kuitansi: 280 },
  { name: "Mar", Pagu: 480, Kuitansi: 410 },
  { name: "Apr", Pagu: 550, Kuitansi: 490 },
];

// Animation configurations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
} as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const { addNotification } = useNotificationStore();

  if (!user) {
    return (
      <div className="flex-1 min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-10 h-10 text-primary animate-bounce mb-3" />
        <p className="text-sm font-bold text-muted-foreground">
          Sesi pengguna tidak ditemukan. Mengarahkan ke halaman masuk...
        </p>
      </div>
    );
  }

  const role = user.role;

  // Custom function to add a mock task from Quick Actions
  const triggerMockNotification = () => {
    const roleMessages: Record<string, string> = {
      Administrator:
        "Sistem mendeteksi upaya login admin baru dari Gorontalo Kota.",
      Supervisor: "Nota Dinas baru nomor ND-922/KPU telah diajukan oleh staf.",
      Pegawai: "Kuitansi Perjalanan Dinas Anda telah disetujui oleh keuangan.",
      "Sub Bagian Keuangan": "SPJ Perjalanan Dinas Eriyanto siap divalidasi.",
    };

    addNotification(
      "Pemberitahuan Dasbor",
      roleMessages[role] || "Aktivitas dasbor diperbarui.",
      "info",
    );
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome Banner */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border border-border rounded-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold mb-2">
            <span>Sesi:</span>
            <span className="capitalize">{role}</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
            Dasbor SIMPENAS
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Selamat datang kembali,{" "}
            <span className="font-bold text-foreground">{user.name}</span>.
            Kelola perjalanan dinas KPU Gorontalo dengan mudah.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Quick theme status or time */}
          <span className="px-4 py-2 border border-border rounded-xl bg-card text-xs font-bold">
            TA: 2026
          </span>
          <span className="px-4 py-2 border border-border rounded-xl bg-card text-xs font-bold text-primary">
            DIPA AKTIF
          </span>
        </div>
      </motion.div>

      {/* RENDER ADMINISTRATOR VIEW */}
      {role === "Administrator" && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <motion.div
            variants={containerVariants}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card border border-border rounded-2xl shadow-sm relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Total Pegawai
                </span>
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black">120</p>
              <div className="flex items-center gap-1 text-[10px] text-success font-bold mt-2">
                <TrendingUp className="w-3.5 h-3.5" />{" "}
                <span>+4 Pegawai baru bulan ini</span>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card border border-border rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Total Perjalanan
                </span>
                <div className="p-2 bg-accent/10 text-accent rounded-xl">
                  <Map className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black">248</p>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                SPT aktif berjalan: 12
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card border border-border rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Anggaran DIPA
                </span>
                <div className="p-2 bg-success/10 text-success rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black">Rp 1.2M</p>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                Sumber Dana: DIPA KPU Gorontalo
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card border border-border rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Realisasi
                </span>
                <div className="p-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black">Rp 842Jt</p>
              <p className="text-xs text-muted-foreground mt-2 font-medium">
                Presentase: 70.1% Anggaran DIPA
              </p>
            </motion.div>
          </motion.div>

          {/* Chart Section */}
          <motion.div
            variants={itemVariants}
            className="p-6 bg-card border border-border rounded-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">
                  Grafik Realisasi Anggaran Perjalanan
                </h2>
                <p className="text-xs text-muted-foreground">
                  Komparasi Pagu DIPA vs Realisasi Bulanan (Juta Rupiah)
                </p>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={adminData}>
                  <defs>
                    <linearGradient
                      id="colorRealisasi"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="var(--primary)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="name"
                    className="text-xs text-muted-foreground font-semibold"
                  />
                  <YAxis className="text-xs text-muted-foreground font-semibold" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Realisasi"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRealisasi)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Pagu"
                    stroke="var(--border)"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    fill="none"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Quick Actions & Activities */}
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              variants={itemVariants}
              className="p-6 bg-card border border-border rounded-2xl"
            >
              <h2 className="text-lg font-bold mb-4">Tindakan Cepat</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={triggerMockNotification}
                  className="flex flex-col items-center justify-center p-4 border border-border hover:border-primary/50 hover:bg-primary/5 rounded-2xl transition-all gap-2 text-center"
                >
                  <PlusCircle className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold">Trigger Notifikasi</span>
                </button>
                <Link
                  href="/master/pegawai"
                  className="flex flex-col items-center justify-center p-4 border border-border hover:border-primary/50 hover:bg-primary/5 rounded-2xl transition-all gap-2 text-center"
                >
                  <Users className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold">Kelola Pegawai</span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-6 bg-card border border-border rounded-2xl"
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Log Aktivitas
                Sistem
              </h2>
              <div className="space-y-4 text-xs font-semibold">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">
                      Modul Phase 2 - Auth Service berhasil diaktifkan
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Baru saja
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-success mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">
                      Admin memperbarui variabel kuki sesi middleware
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      5 menit yang lalu
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* RENDER SUPERVISOR VIEW */}
      {role === "Supervisor" && (
        <div className="space-y-6">
          <motion.div
            variants={containerVariants}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card border border-border rounded-2xl shadow-sm border-l-4 border-l-primary"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Persetujuan Menunggu
                </span>
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black">5 Dokumen</p>
              <p className="text-xs text-muted-foreground mt-2">
                3 SPT dan 2 SPPD menanti verifikasi
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card border border-border rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Perjalanan Aktif
                </span>
                <div className="p-2 bg-accent/10 text-accent rounded-xl">
                  <Map className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black">15 Staf</p>
              <p className="text-xs text-muted-foreground mt-2">
                Sedang dinas di luar daerah
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card border border-border rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Total SPT
                </span>
                <div className="p-2 bg-success/10 text-success rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black">96 SPT</p>
              <p className="text-xs text-muted-foreground mt-2">
                Selesai diterbitkan tahun ini
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card border border-border rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Total Hari Dinas
                </span>
                <div className="p-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black">182 Hari</p>
              <p className="text-xs text-muted-foreground mt-2">
                Akumulasi seluruh dinas lapangan
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-6 bg-card border border-border rounded-2xl"
          >
            <h2 className="text-lg font-bold mb-2">
              Sebaran Perjalanan Dinas Bulanan
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              Jumlah perjalanan diajukan vs disetujui (Dokumen)
            </p>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={supervisorData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="name"
                    className="text-xs text-muted-foreground font-semibold"
                  />
                  <YAxis className="text-xs text-muted-foreground font-semibold" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                    }}
                  />
                  <Bar
                    dataKey="Perjalanan"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Selesai"
                    fill="var(--accent)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              variants={itemVariants}
              className="p-6 bg-card border border-border rounded-2xl"
            >
              <h2 className="text-lg font-bold mb-4">Aksi Verifikasi Cepat</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={triggerMockNotification}
                  className="flex flex-col items-center justify-center p-4 border border-border hover:border-primary/50 hover:bg-primary/5 rounded-2xl transition-all gap-2 text-center"
                >
                  <Bell className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold">Simulasi Notif Staf</span>
                </button>
                <Link
                  href="/spt"
                  className="flex flex-col items-center justify-center p-4 border border-border hover:border-primary/50 hover:bg-primary/5 rounded-2xl transition-all gap-2 text-center"
                >
                  <CheckSquare className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold">Tinjau Pending SPT</span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-6 bg-card border border-border rounded-2xl"
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Riwayat
                Persetujuan Terakhir
              </h2>
              <div className="space-y-4 text-xs font-semibold">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-success mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">
                      Selesai menyetujui SPT Eriyanto (Konsultasi Logistik)
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      1 jam yang lalu
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* RENDER PEGAWAI VIEW */}
      {role === "Pegawai" && (
        <div className="space-y-6">
          <motion.div
            variants={containerVariants}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card border border-border rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Tugas Dinas Saya
                </span>
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Map className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black">12 Tugas</p>
              <p className="text-xs text-muted-foreground mt-2">
                Daftar dinas luar terkumpul
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card border border-border rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Status SPT Aktif
                </span>
                <div className="p-2 bg-success/10 text-success rounded-xl">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black text-success">Disetujui</p>
              <p className="text-xs text-muted-foreground mt-2">
                SPT/04/2026 disetujui Kasubag
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card border border-border rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Laporan Diunggah
                </span>
                <div className="p-2 bg-accent/10 text-accent rounded-xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black">11 Laporan</p>
              <p className="text-xs text-muted-foreground mt-2 text-danger font-bold">
                1 laporan butuh diunggah segera
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card border border-border rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Hari Dinas Mandiri
                </span>
                <div className="p-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black">24 Hari</p>
              <p className="text-xs text-muted-foreground mt-2">
                Total hari dinas lapangan saya
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-6 bg-card border border-border rounded-2xl"
          >
            <h2 className="text-lg font-bold mb-2">
              Riwayat Hari Dinas Lapangan Per Bulan
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              Total hari penugasan luar kantor saya
            </p>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pegawaiData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="name"
                    className="text-xs text-muted-foreground font-semibold"
                  />
                  <YAxis className="text-xs text-muted-foreground font-semibold" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Hari"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    dot={{ r: 5, fill: "var(--primary)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              variants={itemVariants}
              className="p-6 bg-card border border-border rounded-2xl"
            >
              <h2 className="text-lg font-bold mb-4">Aksi Pengguna</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={triggerMockNotification}
                  className="flex flex-col items-center justify-center p-4 border border-border hover:border-primary/50 hover:bg-primary/5 rounded-2xl transition-all gap-2 text-center"
                >
                  <Clock className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold">Ajukan Notif Update</span>
                </button>
                <Link
                  href="/laporan"
                  className="flex flex-col items-center justify-center p-4 border border-border hover:border-primary/50 hover:bg-primary/5 rounded-2xl transition-all gap-2 text-center"
                >
                  <FileDown className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold">
                    Kirim Laporan Perjalanan
                  </span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-6 bg-card border border-border rounded-2xl"
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Timeline
                Perjalanan Dinas Terakhir
              </h2>
              <div className="space-y-4 text-xs font-semibold">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">
                      Perjalanan dinas ke Limboto selesai dilakukan
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      3 hari yang lalu
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* RENDER KEUANGAN VIEW */}
      {role === "Sub Bagian Keuangan" && (
        <div className="space-y-6">
          <motion.div
            variants={containerVariants}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card border border-border rounded-2xl shadow-sm border-l-4 border-l-yellow-500"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Validasi SPJ Tertunda
                </span>
                <div className="p-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black">4 Dokumen</p>
              <p className="text-xs text-muted-foreground mt-2">
                Menunggu validasi berkas SPJ kuitansi
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card border border-border rounded-2xl shadow-sm border-l-4 border-l-primary"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Antrean SPBY
                </span>
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black">2 Antrean</p>
              <p className="text-xs text-muted-foreground mt-2">
                Siap untuk pembuatan kuitansi
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card border border-border rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Pencairan Hari Ini
                </span>
                <div className="p-2 bg-success/10 text-success rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black">Rp 15.5Jt</p>
              <p className="text-xs text-muted-foreground mt-2">
                Kumulatif pembayaran kuitansi
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="p-6 bg-card border border-border rounded-2xl shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Total Belanja DIPA
                </span>
                <div className="p-2 bg-accent/10 text-accent rounded-xl">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-black">Rp 842Jt</p>
              <p className="text-xs text-muted-foreground mt-2">
                Telah terpakai dari pagu DIPA
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="p-6 bg-card border border-border rounded-2xl"
          >
            <h2 className="text-lg font-bold mb-2">
              Statistik Pencairan SPBY & Kuitansi
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              Akumulasi nominal pencairan bulanan (Juta Rupiah)
            </p>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={keuanganData}>
                  <defs>
                    <linearGradient id="colorSpby" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--accent)"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--accent)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="name"
                    className="text-xs text-muted-foreground font-semibold"
                  />
                  <YAxis className="text-xs text-muted-foreground font-semibold" />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Kuitansi"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSpby)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              variants={itemVariants}
              className="p-6 bg-card border border-border rounded-2xl"
            >
              <h2 className="text-lg font-bold mb-4">Aksi Cepat Keuangan</h2>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={triggerMockNotification}
                  className="flex flex-col items-center justify-center p-4 border border-border hover:border-primary/50 hover:bg-primary/5 rounded-2xl transition-all gap-2 text-center"
                >
                  <PlusCircle className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold">Minta Update SPJ</span>
                </button>
                <Link
                  href="/spj"
                  className="flex flex-col items-center justify-center p-4 border border-border hover:border-primary/50 hover:bg-primary/5 rounded-2xl transition-all gap-2 text-center"
                >
                  <ShieldCheck className="w-6 h-6 text-primary" />
                  <span className="text-xs font-bold">
                    Verifikasi Berkas SPJ
                  </span>
                </Link>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="p-6 bg-card border border-border rounded-2xl"
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Transaksi Keuangan
                Terakhir
              </h2>
              <div className="space-y-4 text-xs font-semibold">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-success mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">
                      Selesai membayar kuitansi perjalanan Eriyanto sebesar Rp
                      1.500.000
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      30 menit yang lalu
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
