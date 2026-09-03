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

    // Jika akun belum tersimpan di local storage (misal di perangkat baru), pertahankan sesi aktif
    if (!account) return user;

    if (!userAccountService.canLogin(account)) return null;
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
          const rawData = (res.data || res) as Record<string, unknown>;
          const userObj = ((rawData.user || res.user || rawData) as Record<string, unknown>) || {};
          const accountId = String(userObj.id || userObj.userId || "");
          const session: UserSession = {
            id: accountId || (username.toLowerCase() === "admin" ? "user-admin" : `user-${username}`),
            username: String(userObj.username || username),
            name: String(userObj.name || username),
            role: (userObj.role as UserRole) || (username.toLowerCase() === "admin" ? "Administrator" : "Pegawai"),
            email: String(userObj.email || ""),
            pegawaiId: userObj.pegawaiId || userObj.pegawai_id ? String(userObj.pegawaiId || userObj.pegawai_id) : undefined,
          };

          if (typeof window !== "undefined") {
            try {
              const currentAccounts = userAccountService.getAll();
              if (!currentAccounts.some((a) => a.id === session.id || a.username.toLowerCase() === session.username.toLowerCase())) {
                userAccountService.saveAccounts([
                  ...currentAccounts,
                  {
                    id: session.id,
                    username: session.username,
                    name: session.name,
                    email: session.email,
                    role: session.role,
                    pegawaiId: session.pegawaiId,
                    passwordHash: "",
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                ]);
              }
            } catch {
              // ignore
            }
          }

          return session;
        } catch {
          // Fallback ke endpoint /api/v1/akun-pengguna
          const accounts = await apiClient.get<UserAccount[] | { data?: UserAccount[] }>(
            "/api/v1/akun-pengguna",
            { username, limit: 100 },
          );
          const list = Array.isArray(accounts) ? accounts : accounts.data || [];
          const passwordHash = await hashMockPassword(password);
          const matched = list.find(
            (acc) =>
              acc.username.toLowerCase() === username.toLowerCase() &&
              (acc.passwordHash === passwordHash || (acc as unknown as Record<string, unknown>).password_hash === passwordHash),
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
        const rawData = (res.data || res) as Record<string, unknown>;
        const userObj = ((rawData.user || res.user || rawData) as Record<string, unknown>) || {};
        return {
          id: String(userObj.id || ""),
          username: String(userObj.username || ""),
          name: String(userObj.name || ""),
          role: (userObj.role as UserRole) || "Pegawai",
          email: String(userObj.email || ""),
          pegawaiId: userObj.pegawaiId || userObj.pegawai_id ? String(userObj.pegawaiId || userObj.pegawai_id) : undefined,
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
    const targetUserId = userId && userId !== "undefined" ? userId : "user-admin";

    return withApiFallback(
      async () => {
        await apiClient.put("/api/v1/auth/change-password", {
          userId: targetUserId,
          oldPassword,
          newPassword,
        });

        const newHash = await hashMockPassword(newPassword);
        try {
          await apiClient.put(`/api/v1/akun-pengguna/${targetUserId}`, {
            password_hash: newHash,
          });
        } catch {
          // ignore
        }

        const account = userAccountService.findById(targetUserId);
        if (account) {
          userAccountService.update(targetUserId, {
            username: account.username,
            email: account.email,
            isActive: account.isActive,
            newPassword,
          });
        }

        return true;
      },
      async () => {
        const account = userAccountService.findById(targetUserId);
        if (!account) return false;
        const oldHash = await hashMockPassword(oldPassword);
        if (account.passwordHash !== oldHash) return false;
        await userAccountService.update(targetUserId, {
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
