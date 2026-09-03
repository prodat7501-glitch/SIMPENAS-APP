"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, type UserRole } from "@/stores/auth.store";
import type { LoginInput } from "@/schemas/auth.schema";

const ADMIN_ONLY_DOCUMENT_DELETE = new Set([
  "Nota Dinas",
  "SPT",
  "SPPD",
  "Laporan Perjalanan Dinas",
  "SPBY",
  "Daftar Nominatif",
  "Tanda Terima",
  "Kuitansi",
]);

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    hasHydrated,
    login: storeLogin,
    logout: storeLogout,
    refreshUserFromMaster,
  } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasHydrated && user) {
      refreshUserFromMaster();
    }
  }, [hasHydrated, user, refreshUserFromMaster]);

  const login = async (input: LoginInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await storeLogin(input.username, input.password);
      if (success) {
        router.push("/dashboard");
        return true;
      } else {
        setError(
          "Username atau kata sandi tidak valid, atau akun telah dinonaktifkan.",
        );
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan sistem saat mencoba masuk.";
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    storeLogout();
    router.push("/login");
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  // Check custom action permissions based on the PRD matrix
  const hasPermission = (
    moduleName: string,
    action: "C" | "R" | "U" | "D" | "A" | "G" | "P" | "E" | "N" | "V",
  ): boolean => {
    if (!user) return false;
    const role = user.role;

    if (action === "D" && ["Approval", "Log Aktivitas"].includes(moduleName)) {
      return role === "Administrator";
    }

    if (action === "D" && ADMIN_ONLY_DOCUMENT_DELETE.has(moduleName)) {
      return role === "Administrator";
    }

    // Admin has access to almost everything (CRUD/etc.)
    if (role === "Administrator") {
      return true;
    }

    // Role Supervisor permissions mapping
    if (role === "Supervisor") {
      if (moduleName === "Master Akun Pengguna") return false;
      if (moduleName === "Arsip SPJ") return false;
      if (moduleName === "Pengaturan Penomoran") return action === "R";
      if (moduleName === "Approval") return ["R", "A"].includes(action);
      if (moduleName === "Rekapitulasi")
        return ["R", "V", "P", "E"].includes(action);
      if (moduleName === "Nota Dinas")
        return ["C", "R", "U", "A", "G", "P", "N"].includes(action);
      if (moduleName === "SPT")
        return ["C", "R", "U", "A", "G", "P", "N"].includes(action);
      if (moduleName === "SPPD")
        return ["C", "R", "U", "A", "G", "P", "N"].includes(action);
      if (moduleName === "Laporan Perjalanan Dinas")
        return ["R", "U", "A", "G", "P"].includes(action);
      if (["Validasi SPJ", "Validasi SPJ dan Pembayaran"].includes(moduleName))
        return ["R", "P"].includes(action); // Can read/print
      if (moduleName === "Dashboard") return action === "V";
      return ["R", "V"].includes(action); // Default read/view
    }

    // Role Pegawai permissions mapping
    if (role === "Pegawai") {
      if (moduleName === "Master Akun Pengguna") return false;
      if (moduleName === "Arsip SPJ") return false;
      if (moduleName === "Pengaturan Penomoran") return false;
      if (moduleName === "Approval") return false;
      if (["Log Aktivitas", "Template Dokumen"].includes(moduleName))
        return false;
      if (moduleName === "Rekapitulasi") return ["R", "V"].includes(action);
      if (moduleName === "Nota Dinas") return action === "R";
      if (moduleName === "SPT")
        return ["C", "R", "U", "G", "P", "N"].includes(action);
      if (moduleName === "SPPD")
        return ["C", "R", "U", "G", "P", "N"].includes(action);
      if (moduleName === "Laporan Perjalanan Dinas")
        return ["C", "R", "U", "G", "P"].includes(action);
      if (["Validasi SPJ", "Validasi SPJ dan Pembayaran"].includes(moduleName))
        return action === "R";
      if (moduleName === "Dashboard") return action === "V";
      if (moduleName === "Master Anggaran DIPA") return action === "R";
      if (moduleName === "Master Standar Biaya Masukan") return action === "R";
      return ["R", "V"].includes(action);
    }

    // Role Sub Bagian Keuangan permissions mapping
    if (role === "Sub Bagian Keuangan") {
      if (moduleName === "Master Akun Pengguna") return false;
      if (moduleName === "Arsip SPJ") return ["C", "R", "U"].includes(action);
      if (moduleName === "Pengaturan Penomoran") return false;
      if (moduleName === "Approval") return false;
      if (moduleName === "Template Dokumen") return action === "R";
      if (moduleName === "Rekapitulasi")
        return ["R", "V", "P", "E"].includes(action);
      if (["Validasi SPJ", "Validasi SPJ dan Pembayaran"].includes(moduleName))
        return ["C", "R", "U", "D", "A", "G", "P"].includes(action);
      if (moduleName === "SPBY")
        return ["C", "R", "U", "A", "G", "P"].includes(action);
      if (moduleName === "Daftar Nominatif")
        return ["C", "R", "U", "A", "G", "P"].includes(action);
      if (moduleName === "Tanda Terima")
        return ["C", "R", "U", "A", "G", "P"].includes(action);
      if (moduleName === "Kuitansi")
        return ["C", "R", "U", "A", "G", "P"].includes(action);
      if (moduleName === "Dashboard") return action === "V";
      return ["R", "V", "P", "E"].includes(action);
    }

    return false;
  };

  return {
    user,
    isAuthenticated,
    hasHydrated,
    isLoading,
    error,
    login,
    logout,
    hasRole,
    hasPermission,
  };
}
