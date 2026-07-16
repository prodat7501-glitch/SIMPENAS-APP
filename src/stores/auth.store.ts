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
    role: UserRole,
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
      login: async (username: string, password: string, role: UserRole) => {
        const userSession = await AuthService.login(username, password, role);
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
      refreshUserFromMaster: () =>
        set((state) => {
          if (!state.user) return {};

          const resolvedUser = AuthService.resolvePersistedSession(state.user);
          if (
            resolvedUser.name === state.user.name &&
            resolvedUser.email === state.user.email &&
            resolvedUser.pegawaiId === state.user.pegawaiId
          ) {
            return {};
          }

          return { user: resolvedUser };
        }),
    }),
    {
      name: "simpenas-auth-storage",
    },
  ),
);
