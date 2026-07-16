"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, type UserRole } from "@/stores/auth.store";
import type { LoginInput } from "@/schemas/auth.schema";

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    login: storeLogin,
    logout: storeLogout,
    refreshUserFromMaster,
  } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refreshUserFromMaster();
  }, [refreshUserFromMaster]);

  const login = async (input: LoginInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await storeLogin(
        input.username,
        input.password,
        input.role,
      );
      if (success) {
        router.push("/dashboard");
        return true;
      } else {
        setError("Peran atau kredensial pengguna tidak valid.");
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

    // Admin has access to almost everything (CRUD/etc.)
    if (role === "Administrator") {
      return true;
    }

    // Role Supervisor permissions mapping
    if (role === "Supervisor") {
      if (moduleName === "Pengaturan Penomoran") return action === "R";
      if (moduleName === "Approval") return ["R", "A"].includes(action);
      if (moduleName === "Rekapitulasi")
        return ["R", "V", "P", "E"].includes(action);
      if (moduleName === "Nota Dinas")
        return ["C", "R", "U", "A", "G", "P", "N"].includes(action);
      if (moduleName === "SPT")
        return ["C", "R", "U", "D", "A", "G", "P", "N"].includes(action);
      if (moduleName === "SPPD")
        return ["C", "R", "U", "D", "A", "G", "P", "N"].includes(action);
      if (moduleName === "Laporan Perjalanan Dinas")
        return ["R", "U", "A", "G", "P"].includes(action);
      if (moduleName === "Validasi SPJ") return ["R", "P"].includes(action); // Can read/print
      if (moduleName === "Dashboard") return action === "V";
      return ["R", "V"].includes(action); // Default read/view
    }

    // Role Pegawai permissions mapping
    if (role === "Pegawai") {
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
      if (moduleName === "Validasi SPJ") return action === "R";
      if (moduleName === "Dashboard") return action === "V";
      if (moduleName === "Master Anggaran DIPA") return action === "R";
      if (moduleName === "Master Standar Biaya Masukan") return action === "R";
      return ["R", "V"].includes(action);
    }

    // Role Sub Bagian Keuangan permissions mapping
    if (role === "Sub Bagian Keuangan") {
      if (moduleName === "Pengaturan Penomoran") return false;
      if (moduleName === "Approval") return false;
      if (moduleName === "Template Dokumen") return action === "R";
      if (moduleName === "Rekapitulasi")
        return ["R", "V", "P", "E"].includes(action);
      if (moduleName === "Validasi SPJ")
        return ["C", "R", "U", "D", "A", "G", "P"].includes(action);
      if (moduleName === "SPBY")
        return ["C", "R", "U", "D", "A", "G", "P"].includes(action);
      if (moduleName === "Daftar Nominatif")
        return ["C", "R", "U", "D", "A", "G", "P"].includes(action);
      if (moduleName === "Tanda Terima")
        return ["C", "R", "U", "D", "A", "G", "P"].includes(action);
      if (moduleName === "Kuitansi")
        return ["C", "R", "U", "D", "A", "G", "P"].includes(action);
      if (moduleName === "Dashboard") return action === "V";
      return ["R", "V", "P", "E"].includes(action);
    }

    return false;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    hasRole,
    hasPermission,
  };
}
