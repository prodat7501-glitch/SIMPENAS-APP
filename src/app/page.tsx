import Link from "next/link";
import {
  FileText,
  Users,
  ShieldCheck,
  Wallet,
  BarChart3,
  ArrowRight,
  ClipboardList,
  History,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <main className="relative max-w-5xl mx-auto px-6 py-16 flex flex-col justify-center min-h-[90vh]">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Milestone 1 — Project Foundation Active
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
            SIMPENAS
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
            Sistem Informasi Manajemen Perjalanan Dinas
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
            Komisi Pemilihan Umum (KPU) Kabupaten Gorontalo
          </p>
        </div>

        {/* Portal Options / Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Dashboard Portal */}
          <div className="group relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200">
            <div className="p-3 bg-primary/10 text-primary rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Dashboard Portal</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Akses panel utama pemantauan, grafik realisasi anggaran DIPA, hari
              perjalanan dinas, dan notifikasi aktivitas terbaru.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover group/link"
            >
              Masuk Dashboard{" "}
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Master Data Portal */}
          <div className="group relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200">
            <div className="p-3 bg-accent/10 text-accent rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Master Data</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Manajemen data pegawai, jabatan, unit kerja, pangkat, anggaran
              DIPA, serta Standar Biaya Masukan (SBM).
            </p>
            <Link
              href="/master/pegawai"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover group/link"
            >
              Kelola Master Data{" "}
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Transaksi Perjalanan Dinas */}
          <div className="group relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200">
            <div className="p-3 bg-success/10 text-success rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Perjalanan Dinas</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Pembuatan Nota Dinas, Surat Perintah Tugas (SPT), Surat Perintah
              Perjalanan Dinas (SPPD) dengan fitur **Ambil Nomor**.
            </p>
            <Link
              href="/nota-dinas"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover group/link"
            >
              Mulai Dokumen Perjalanan{" "}
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Pertanggungjawaban Keuangan */}
          <div className="group relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200">
            <div className="p-3 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
              <Wallet className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold mb-2">Administrasi Keuangan</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Validasi SPJ, serta otomatisasi pembuatan dokumen SPBY, Daftar
              Nominatif, Tanda Terima, dan Kuitansi.
            </p>
            <Link
              href="/spby"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover group/link"
            >
              Kelola Pembayaran{" "}
              <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Info Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-success" /> RBAC Enabled
            </span>
            <span className="flex items-center gap-1">
              <ClipboardList className="w-3.5 h-3.5 text-primary" /> Auto
              Numbering Active
            </span>
            <span className="flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-accent" /> Audit Trail
              Logging
            </span>
          </div>
          <div>SIMPENAS App — Gorontalo © 2026</div>
        </div>
      </main>
    </div>
  );
}
