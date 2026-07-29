import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthService } from "@/services/auth.service";
import { useActivityStore } from "@/stores/activity.store";

export type UserRole =
  "Administrator" | "Supervisor" | "Pegawai" | "Sub Bagian Keuangan";

export interface UserSession {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  email: string;
  pegawaiId?: string;
}

interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string, email: string) => void;
  refreshUserFromMaster: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        const userSession = await AuthService.login(username, password);
        if (userSession) {
          set({ user: userSession, isAuthenticated: true });
          useActivityStore.getState().add({
            action: "Login",
            module: "Autentikasi",
            description: "Pengguna masuk ke SIMPENAS",
            user: userSession.name,
          });
          // Set kuki sesi agar terbaca oleh Next.js Middleware
          if (typeof document !== "undefined") {
            document.cookie =
              "simpenas_session=true; path=/; max-age=86400; SameSite=Lax";
          }
          return true;
        }
        return false;
      },
      logout: () => {
        const currentUser = useAuthStore.getState().user;
        if (currentUser)
          useActivityStore.getState().add({
            action: "Logout",
            module: "Autentikasi",
            description: "Pengguna keluar dari SIMPENAS",
            user: currentUser.name,
          });
        set({ user: null, isAuthenticated: false });
        // Hapus kuki sesi
        if (typeof document !== "undefined") {
          document.cookie =
            "simpenas_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; path=/";
        }
      },
      updateProfile: (name, email) =>
        set((state) => ({
          user: state.user ? { ...state.user, name, email } : null,
        })),
      refreshUserFromMaster: () => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) return;

        const resolvedUser = AuthService.resolvePersistedSession(currentUser);
        if (!resolvedUser) {
          set({ user: null, isAuthenticated: false });
          if (typeof document !== "undefined") {
            document.cookie =
              "simpenas_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
          }
          return;
        }

        const isUnchanged =
          resolvedUser.username === currentUser.username &&
          resolvedUser.name === currentUser.name &&
          resolvedUser.email === currentUser.email &&
          resolvedUser.role === currentUser.role &&
          resolvedUser.pegawaiId === currentUser.pegawaiId;

        if (!isUnchanged) set({ user: resolvedUser, isAuthenticated: true });
      },
    }),
    {
      name: "simpenas-auth-storage",
    },
  ),
);
