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
          const res = await apiClient.post<Record<string, unknown>>("/api/v1/auth/login", {
            username,
            password,
          });
          const userObj = (res.user || res.data || res) as Record<string, unknown>;
          return {
            id: String(userObj.id || `user-${Date.now()}`),
            username: String(userObj.username || username),
            name: String(userObj.name || username),
            role: (userObj.role as UserRole) || "Pegawai",
            email: String(userObj.email || ""),
            pegawaiId: userObj.pegawaiId ? String(userObj.pegawaiId) : undefined,
          };
        } catch {
          // Fallback ke endpoint /api/v1/akun-pengguna
          const accounts = await apiClient.get<UserAccount[] | { data?: UserAccount[] }>(
            "/api/v1/akun-pengguna",
            { username },
          );
          const list = Array.isArray(accounts) ? accounts : accounts.data || [];
          const passwordHash = await hashMockPassword(password);
          const matched = list.find(
            (acc) =>
              acc.username.toLowerCase() === username.toLowerCase() &&
              acc.passwordHash === passwordHash,
          );
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
      },
    );
  }

  static async getMe(): Promise<UserSession | null> {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<Record<string, unknown>>("/api/v1/auth/me");
        const userObj = (res.data || res.user || res) as Record<string, unknown>;
        return {
          id: String(userObj.id),
          username: String(userObj.username),
          name: String(userObj.name),
          role: (userObj.role as UserRole) || "Pegawai",
          email: String(userObj.email || ""),
          pegawaiId: userObj.pegawaiId ? String(userObj.pegawaiId) : undefined,
        };
      },
      () => null,
    );
  }

  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    return withApiFallback(
      async () => {
        await apiClient.put("/api/v1/auth/change-password", {
          userId,
          oldPassword,
          newPassword,
        });
        return true;
      },
      async () => {
        const account = userAccountService.findById(userId);
        if (!account) return false;
        const oldHash = await hashMockPassword(oldPassword);
        if (account.passwordHash !== oldHash) return false;
        await userAccountService.update(userId, {
          username: account.username,
          email: account.email,
          isActive: account.isActive,
          newPassword,
        });
        return true;
      },
    );
  }

  static async logout(): Promise<boolean> {
    return true;
  }
}
