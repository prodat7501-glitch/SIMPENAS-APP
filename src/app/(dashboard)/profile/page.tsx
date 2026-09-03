"use client";

import React, { useState } from "react";
import {
  Save,
  User,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth.store";
import { AuthService } from "@/services/auth.service";
import { useActivityStore } from "@/stores/activity.store";

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const { addToast } = useToast();

  // Profile Form States
  const [name, setName] = useState(() => user?.name ?? "");
  const [email, setEmail] = useState(() => user?.email ?? "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password Form States
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Save Profile Info
  const handleSaveProfile = async () => {
    if (name.trim().length < 3) {
      addToast("Nama lengkap minimal 3 karakter", "error");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      addToast("Format email tidak valid", "error");
      return;
    }

    setIsSavingProfile(true);
    try {
      updateProfile(name.trim(), email.trim());
      useActivityStore.getState().add({
        action: "Update",
        module: "Profil",
        description: `Memperbarui informasi profil pengguna (${name.trim()})`,
        user: user?.name || "Pengguna",
      });
      addToast("Informasi profil berhasil diperbarui", "success");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      addToast("Sesi pengguna tidak valid. Silakan masuk kembali.", "error");
      return;
    }

    if (!oldPassword) {
      addToast("Silakan masukkan password lama Anda", "error");
      return;
    }

    if (newPassword.length < 6) {
      addToast("Password baru minimal 6 karakter", "error");
      return;
    }

    if (newPassword === oldPassword) {
      addToast("Password baru tidak boleh sama dengan password lama", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast("Konfirmasi password baru tidak cocok", "error");
      return;
    }

    setIsChangingPassword(true);
    try {
      const targetUserId =
        user.username.toLowerCase() === "admin" || user.id === "user-admin"
          ? "user-admin"
          : user.id;

      const success = await AuthService.changePassword(
        targetUserId,
        oldPassword,
        newPassword,
      );

      if (success) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        useActivityStore.getState().add({
          action: "Update",
          module: "Keamanan Akun",
          description: `Pengguna ${user.name} berhasil mengubah password secara mandiri`,
          user: user.name,
        });
        addToast("Password berhasil diubah. Silakan gunakan password baru pada login berikutnya.", "success");
      } else {
        addToast("Password lama yang Anda masukkan tidak sesuai", "error");
      }
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Gagal mengubah password. Silakan coba lagi.",
        "error",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          Profil Saya
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Kelola informasi identitas akun dan keamanan kata sandi Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: User Summary Card */}
        <div className="md:col-span-4">
          <Card className="border border-border/80 shadow-xs">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-black text-2xl shadow-inner">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <div>
                <h3 className="font-extrabold text-base text-foreground">
                  {user?.name || "Nama Pengguna"}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  @{user?.username || "username"}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{user?.role || "Pegawai"}</span>
              </div>

              <div className="pt-3 border-t border-border/60 text-left space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>ID Akun:</span>
                  <span className="font-mono text-foreground font-semibold">{user?.id}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Email:</span>
                  <span className="text-foreground font-semibold truncate max-w-[160px]" title={user?.email}>
                    {user?.email || "-"}
                  </span>
                </div>
                {user?.pegawaiId && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>ID Pegawai:</span>
                    <span className="font-mono text-foreground font-semibold">{user.pegawaiId}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="md:col-span-8 space-y-6">
          {/* Card 1: Informasi Profil */}
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <User className="w-4 h-4 text-primary" />
                <span>Informasi Akun</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Perbarui nama tampilan dan alamat email aktif Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Username</label>
                  <Input
                    value={user?.username ?? ""}
                    disabled
                    className="bg-muted/50 cursor-not-allowed text-xs font-mono"
                  />
                  <span className="text-[10px] text-muted-foreground">Username dikelola oleh Administrator</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Peran / Hak Akses</label>
                  <Input
                    value={user?.role ?? ""}
                    disabled
                    className="bg-muted/50 cursor-not-allowed text-xs"
                  />
                  <span className="text-[10px] text-muted-foreground">Sesuai penugasan Master Pegawai</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Nama Lengkap <span className="text-destructive">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">
                  Alamat Email <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@kpu.go.id"
                  className="text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="gap-2 text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingProfile ? "Menyimpan..." : "Simpan Profil"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Ubah Password Mandiri */}
          <Card className="border border-border/80 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
                <KeyRound className="w-4 h-4 text-primary" />
                <span>Ubah Password Mandiri</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Perbarui kata sandi akun Anda secara berkala untuk menjaga keamanan data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Password Lama */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-muted-foreground" />
                    <span>Password Saat Ini (Lama)</span>
                    <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Masukkan password saat ini"
                      className="text-xs pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                      aria-label={showOldPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Password Baru */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <KeyRound className="w-3 h-3 text-muted-foreground" />
                      <span>Password Baru</span>
                      <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="text-xs pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                        aria-label={showNewPassword ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Konfirmasi Password Baru */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                      <span>Konfirmasi Password Baru</span>
                      <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password baru"
                        className="text-xs pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                        aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Match indicator */}
                {confirmPassword && (
                  <div className="text-[11px] flex items-center gap-1.5">
                    {newPassword === confirmPassword ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Password konfirmasi cocok
                      </span>
                    ) : (
                      <span className="text-destructive flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" /> Password konfirmasi belum cocok
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isChangingPassword || !oldPassword || !newPassword || !confirmPassword}
                    className="gap-2 text-xs"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isChangingPassword ? "Memproses..." : "Perbarui Password"}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
