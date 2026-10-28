"use client";

import { useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QRCodeSVG } from "qrcode.react";
import {
  KeyRound,
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
} from "lucide-react";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";
import { useAuth } from "@/hooks/useAuth";
import type { UserSession } from "@/stores/auth.store";
import { generateTotpSecret, generateOtpAuthUrl } from "@/lib/totp";

type LoginStep = "CREDENTIALS" | "VERIFY_2FA" | "SETUP_2FA";

export default function LoginPage() {
  const {
    checkCredentials,
    verifyTotpAndLogin,
    setupTotpAndLogin,
    isLoading,
    error: authError,
  } = useAuth();

  const [step, setStep] = useState<LoginStep>("CREDENTIALS");
  const [pendingSession, setPendingSession] = useState<UserSession | null>(null);
  const [totpSecret, setTotpSecret] = useState<string>("");
  const [qrUrl, setQrUrl] = useState<string>("");
  const [otpCode, setOtpCode] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Tahap 1: Verifikasi Username & Password
  const onCredentialsSubmit = async (data: LoginInput) => {
    setLocalError(null);
    const result = await checkCredentials(data);

    if (result.status === "INVALID") {
      setLocalError(
        result.message ||
          "Nama pengguna atau kata sandi tidak valid, atau akun telah dinonaktifkan.",
      );
      return;
    }

    if (result.status === "NEED_VERIFY_2FA") {
      setPendingSession(result.session!);
      setOtpCode("");
      setStep("VERIFY_2FA");
      return;
    }

    if (result.status === "NEED_SETUP_2FA") {
      const secret = generateTotpSecret();
      const accountName = result.session!.username;
      const url = generateOtpAuthUrl(accountName, secret);
      setPendingSession(result.session!);
      setTotpSecret(secret);
      setQrUrl(url);
      setOtpCode("");
      setStep("SETUP_2FA");
    }
  };

  // Tahap 2A: Verifikasi Kode Google Authenticator
  const onVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setLocalError("Masukkan 6-digit kode numerik Google Authenticator.");
      return;
    }

    if (!pendingSession) {
      setStep("CREDENTIALS");
      return;
    }

    const success = await verifyTotpAndLogin(pendingSession, cleanCode);
    if (!success) {
      setLocalError(
        "Kode autentikasi tidak cocok atau sudah kedaluwarsa. Silakan periksa kembali aplikasi Google Authenticator Anda.",
      );
    }
  };

  // Tahap 2B: Aktivasi Pertama Kali Google Authenticator
  const onSetupOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setLocalError("Masukkan 6-digit kode numerik dari aplikasi.");
      return;
    }

    if (!pendingSession || !totpSecret) {
      setStep("CREDENTIALS");
      return;
    }

    const success = await setupTotpAndLogin(pendingSession, totpSecret, cleanCode);
    if (!success) {
      setLocalError(
        "Kode 6 digit konfirmasi tidak cocok. Pastikan Anda telah memindai QR Code di aplikasi Google Authenticator.",
      );
    }
  };

  const handleCopySecret = () => {
    if (!totpSecret) return;
    navigator.clipboard.writeText(totpSecret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackToCredentials = () => {
    setLocalError(null);
    setOtpCode("");
    setPendingSession(null);
    setStep("CREDENTIALS");
  };

  const displayError = localError || authError;

  return (
    <div className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 sm:p-6 relative transition-colors duration-200">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl z-10">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <Image
            src="/images/logo-kpu.png"
            alt="Logo Komisi Pemilihan Umum"
            width={72}
            height={72}
            priority
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain mx-auto mb-3"
          />
          <h1 className="text-2xl font-black tracking-tight text-primary">
            SIMPENAS
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-orange-600">
            Sistem Informasi Manajemen Perjalanan Dinas
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Komisi Pemilihan Umum Kabupaten Gorontalo
          </p>
        </div>

        {/* Global Error Alert */}
        {displayError && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs font-semibold mb-5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{displayError}</span>
          </div>
        )}

        {/* TAHAP 1: INPUT USERNAME & PASSWORD */}
        {step === "CREDENTIALS" && (
          <form onSubmit={handleSubmit(onCredentialsSubmit)} className="space-y-4">
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
                  disabled={isLoading}
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 text-foreground"
                />
              </div>
              {errors.username && (
                <p className="text-[10px] text-danger font-bold mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

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
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 text-foreground"
                />
              </div>
              {errors.password && (
                <p className="text-[10px] text-danger font-bold mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-xl font-bold transition-all mt-6 group cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memeriksa Kredensial...</span>
                </>
              ) : (
                <>
                  <span>Lanjut Verifikasi 2FA</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        )}

        {/* TAHAP 2A: VERIFIKASI DENGAN GOOGLE AUTHENTICATOR */}
        {step === "VERIFY_2FA" && (
          <form onSubmit={onVerifyOtpSubmit} className="space-y-4">
            <div className="text-center mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2 border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verifikasi Dua Langkah (2FA)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Akun: <strong className="text-foreground">@{pendingSession?.username}</strong>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Buka aplikasi <strong>Google Authenticator</strong> di ponsel Anda, lalu masukkan 6 digit kode keamanan yang tampil.
              </p>
            </div>

            <div>
              <label className="block text-center text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Kode Google Authenticator (6 Digit)
              </label>
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                disabled={isLoading}
                className="w-full text-center font-mono text-2xl tracking-[0.4em] font-extrabold py-3.5 px-4 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-xl font-bold transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Kode...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verifikasi & Masuk Portal</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBackToCredentials}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali ke Login</span>
              </button>
            </div>
          </form>
        )}

        {/* TAHAP 2B: SETUP PERTAMA KALI GOOGLE AUTHENTICATOR (WAJIB) */}
        {step === "SETUP_2FA" && (
          <form onSubmit={onSetupOtpSubmit} className="space-y-4">
            <div className="text-center mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2 border border-primary/20">
                <QrCode className="w-3.5 h-3.5" />
                <span>Aktivasi 2FA Google Authenticator</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Akun: <strong className="text-foreground">@{pendingSession?.username}</strong>
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Pindai QR Code di bawah menggunakan aplikasi <strong>Google Authenticator</strong> pada ponsel Anda.
              </p>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-border shadow-sm my-2">
              {qrUrl ? (
                <QRCodeSVG
                  value={qrUrl}
                  size={168}
                  level="M"
                  includeMargin={false}
                />
              ) : (
                <div className="w-40 h-40 flex items-center justify-center text-xs text-muted-foreground">
                  Membuat QR Code...
                </div>
              )}
            </div>

            {/* Manual Secret Key Fallback */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border text-xs">
              <div className="truncate mr-2 font-mono text-[11px] text-muted-foreground select-all">
                Kunci Manual: <span className="font-bold text-foreground">{totpSecret}</span>
              </div>
              <button
                type="button"
                onClick={handleCopySecret}
                className="shrink-0 px-2.5 py-1 text-[10px] font-bold bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Tersalin" : "Salin Kunci"}</span>
              </button>
            </div>

            {/* Confirmation 6-digit input */}
            <div>
              <label className="block text-center text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Masukkan Kode 6-Digit Konfirmasi
              </label>
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                autoFocus
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                disabled={isLoading}
                className="w-full text-center font-mono text-2xl tracking-[0.4em] font-extrabold py-3 px-4 bg-muted/40 border border-border rounded-xl focus:outline-none focus:border-primary text-foreground"
              />
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-xl font-bold transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengaktifkan 2FA...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Aktivasi & Masuk Portal</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBackToCredentials}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Batal & Kembali</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
