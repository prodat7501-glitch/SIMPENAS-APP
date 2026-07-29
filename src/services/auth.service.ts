import type { UserRole, UserSession } from "@/stores/auth.store";
import {
  hashMockPassword,
  userAccountService,
} from "@/modules/user-account/user-account.service";
import type { UserAccount } from "@/modules/user-account/user-account.types";

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
    // Simulasi delay jaringan mock API
    await new Promise((resolve) => setTimeout(resolve, 600));

    const account = userAccountService.findByUsername(username);
    const passwordHash = await hashMockPassword(password);

    if (!account || account.passwordHash !== passwordHash) return null;
    if (!userAccountService.canLogin(account)) return null;

    return accountToSession(account);
  }

  static async logout(): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return true;
  }
}
