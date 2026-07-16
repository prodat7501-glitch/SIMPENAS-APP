"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "Administrator",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    await login(data);
  };

  // Helper function to fill mock logins quickly for testing
  const selectMockUser = (role: LoginInput["role"]) => {
    const roleUsernames: Record<LoginInput["role"], string> = {
      Administrator: "admin",
      Supervisor: "supervisor",
      Pegawai: "pegawai",
      "Sub Bagian Keuangan": "keuangan",
    };
    setValue("role", role);
    setValue("username", roleUsernames[role]);
    setValue("password", "password123");
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 relative transition-colors duration-200">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-lg z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Image
            src="/images/logo-kpu.png"
            alt="Logo Komisi Pemilihan Umum"
            width={80}
            height={80}
            priority
            className="w-20 h-20 object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl font-black tracking-tight text-primary">
              SIMPENAS
          </h1>

          <p className="text-sm font-semibold tracking-wide text-orange-600">
              Sistem Informasi Manajemen Perjalanan Dinas
          </p>
          <p className="text-xs text-muted-foreground mt-1">
             Komisi Pemilihan Umum Kabupaten Gorontalo
          </p>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Role selector field */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Hak Akses / Peran
            </label>
            <select
              {...register("role")}
              className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 text-foreground"
            >
              <option value="Administrator">Administrator (Penuh)</option>
              <option value="Supervisor">
                Supervisor (Verifikator & Approval)
              </option>
              <option value="Pegawai">Pegawai (Pelaksana Perjalanan)</option>
              <option value="Sub Bagian Keuangan">Sub Bagian Keuangan</option>
            </select>
            {errors.role && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Username field */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Nama Pengguna (Username)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Masukkan username Anda"
                {...register("username")}
                className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 text-foreground"
              />
            </div>
            {errors.username && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Kata Sandi
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="Masukkan kata sandi"
                {...register("password")}
                className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 text-foreground"
              />
            </div>
            {errors.password && (
              <p className="text-[10px] text-danger font-bold mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-xl font-bold transition-all mt-6 group"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Masuk...</span>
              </>
            ) : (
              <>
                <span>Masuk Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Quick Mock Login shortcuts for developer convenience */}
        <div className="mt-8 pt-6 border-t border-border/80">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center mb-3">
            Pintasan Pengujian (Mock Login)
          </p>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
            <button
              onClick={() => selectMockUser("Administrator")}
              className="py-2 px-3 border border-border rounded-lg bg-muted/20 hover:bg-muted/50 transition-colors"
            >
              Administrator
            </button>
            <button
              onClick={() => selectMockUser("Supervisor")}
              className="py-2 px-3 border border-border rounded-lg bg-muted/20 hover:bg-muted/50 transition-colors"
            >
              Supervisor
            </button>
            <button
              onClick={() => selectMockUser("Pegawai")}
              className="py-2 px-3 border border-border rounded-lg bg-muted/20 hover:bg-muted/50 transition-colors"
            >
              Pegawai
            </button>
            <button
              onClick={() => selectMockUser("Sub Bagian Keuangan")}
              className="py-2 px-3 border border-border rounded-lg bg-muted/20 hover:bg-muted/50 transition-colors"
            >
              Keuangan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
