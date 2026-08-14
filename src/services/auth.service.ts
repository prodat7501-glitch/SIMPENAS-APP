import type { UserRole, UserSession } from "@/stores/auth.store";
import {
  hashMockPassword,
  userAccountService,
} from "@/modules/user-account/user-account.service";
import type { UserAccount } from "@/modules/user-account/user-account.types";
import { apiClient, withApiFallback } from "@/services/api";

const accountToSession = (account: UserAccount): UserSession => ({
  id: account.id,
  username: account.username,
  name: account.name,
  role: account.role as UserRole,
  email: account.email,
  pegawaiId: account.pegawaiId,
});

export class AuthService {
  static resolvePersistedSession(user: UserSession): UserSession | null {
    const account =
      userAccountService.findById(user.id) ??
      userAccountService.findByUsername(user.username);

    if (!account || !userAccountService.canLogin(account)) return null;
    return accountToSession(account);
  }

  static async login(
    username: string,
    password: string,
  ): Promise<UserSession | null> {
    return withApiFallback(
      async () => {
        try {
          const res = await apiClient.post<Record<string, unknown>>("/api/login", { username, password });
          const userObj = (res.user || res) as Record<string, unknown>;
          return {
            id: String(userObj.id || `user-${Date.now()}`),
            username: String(userObj.username || username),
            name: String(userObj.name || username),
            role: (userObj.role as UserRole) || "Pegawai",
            email: String(userObj.email || ""),
            pegawaiId: userObj.pegawaiId ? String(userObj.pegawaiId) : undefined,
          };
        } catch {
          // Jika /api/login 404, coba verifikasi dengan /api/akun_pengguna
          const accounts = await apiClient.get<UserAccount[] | { data?: UserAccount[] }>("/api/akun_pengguna", { username });
          const list = Array.isArray(accounts) ? accounts : accounts.data || [];
          const passwordHash = await hashMockPassword(password);
          const matched = list.find((acc) => acc.username === username && acc.passwordHash === passwordHash);
          if (matched && userAccountService.canLogin(matched)) {
            return accountToSession(matched);
          }
          throw new Error("Kredensial tidak valid");
        }
      },
      async () => {
        const account = userAccountService.findByUsername(username);
        const passwordHash = await hashMockPassword(password);

        if (!account || account.passwordHash !== passwordHash) return null;
        if (!userAccountService.canLogin(account)) return null;

        return accountToSession(account);
      }
    );
  }

  static async logout(): Promise<boolean> {
    return withApiFallback(
      async () => {
        await apiClient.post("/api/logout");
        return true;
      },
      async () => true
    );
  }
}

