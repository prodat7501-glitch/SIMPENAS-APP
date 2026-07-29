"use client";

import { AlertCircle, Database, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { DashboardActivity } from "@/modules/dashboard/components/DashboardActivity";
import { DashboardChart } from "@/modules/dashboard/components/DashboardChart";
import { DashboardMetricCard } from "@/modules/dashboard/components/DashboardMetricCard";
import { DashboardEmployeePaymentTable } from "@/modules/dashboard/components/DashboardEmployeePaymentTable";
import { DashboardQuickActions } from "@/modules/dashboard/components/DashboardQuickActions";
import { useDashboard } from "@/modules/dashboard/useDashboard";
import { TravelTaskPanel } from "@/modules/tugas-perjalanan/components/TravelTaskPanel";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
} as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, refresh } = useDashboard(user);

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="mb-3 h-10 w-10 animate-bounce text-primary" />
        <p className="text-sm font-bold text-muted-foreground">
          Sesi pengguna tidak ditemukan. Silakan masuk kembali.
        </p>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-sm font-semibold text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        Menghitung data Dashboard aktual...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-4">
        <Alert variant="error" title="Dashboard gagal dimuat">
          {error}
        </Alert>
        <Button type="button" onClick={() => void refresh()}>
          <RefreshCw className="h-4 w-4" /> Coba Lagi
        </Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-accent/5 to-transparent p-6"
      >
        <div className="pointer-events-none absolute right-0 top-0 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 inline-flex rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
              Sesi: {user.role}
            </div>
            <h1 className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
              Dashboard SIMPENAS
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Selamat datang, <strong>{user.name}</strong>. Seluruh angka di
              bawah dihitung dari data transaksi aktual.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold">
              TA: {data.year}
            </span>
            <span className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-primary">
              {data.activeDipaCount} DIPA AKTIF
            </span>
            <Button
              type="button"
              variant="outline"
              onClick={() => void refresh()}
              disabled={loading}
              title="Muat ulang data Dashboard"
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Perbarui
            </Button>
          </div>
        </div>
      </motion.section>

      {data.removedDemoRecords > 0 && (
        <Alert variant="success" title="Data demo berhasil dibersihkan">
          {data.removedDemoRecords} transaksi demo bawaan yang belum pernah
          diubah telah dihapus. Data input Anda tetap dipertahankan.
        </Alert>
      )}

      {error && (
        <Alert variant="warning" title="Pembaruan terakhir gagal">
          {error}. Dashboard tetap menampilkan hasil terakhir yang berhasil.
        </Alert>
      )}

      {user.pegawaiId && (
        <motion.div variants={itemVariants}>
          <TravelTaskPanel tasks={data.travelTasks} />
        </motion.div>
      )}

      <motion.section
        variants={containerVariants}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {data.metrics.map((metric) => (
          <motion.div key={metric.label} variants={itemVariants}>
            <DashboardMetricCard metric={metric} />
          </motion.div>
        ))}
      </motion.section>

      <motion.div variants={itemVariants}>
        <DashboardChart chart={data.chart} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <DashboardEmployeePaymentTable
          items={data.employeeSummaries}
          year={data.year}
          personal={user.role !== "Administrator"}
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={itemVariants}>
          <DashboardQuickActions items={data.quickActions} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <DashboardActivity items={data.activities} />
        </motion.div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-[10px] text-muted-foreground">
        <Database className="h-4 w-4 text-primary" />
        Sumber saat ini adalah data input pada localStorage browser. Setelah
        backend tersedia, service Dashboard dapat diarahkan ke API tanpa
        mengubah layout ini.
      </div>
    </motion.div>
  );
}
