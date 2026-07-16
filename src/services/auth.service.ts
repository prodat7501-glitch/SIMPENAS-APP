import type { UserRole, UserSession } from "@/stores/auth.store";
import { pegawaiService } from "@/modules/pegawai/pegawai.service";

const MOCK_USERS: Record<UserRole, Omit<UserSession, "role">> = {
  Administrator: {
    id: "user-admin",
    username: "admin",
    name: "Eriyanto (Admin)",
    email: "admin@kpu.go.id",
  },
  Supervisor: {
    id: "user-super",
    username: "supervisor",
    name: "Andi Saputra (Kasubag)",
    email: "supervisor@kpu.go.id",
  },
  Pegawai: {
    id: "user-pegawai",
    username: "pegawai",
    name: "Rian Hidayat (Staf)",
    email: "rian.hidayat@kpu.go.id",
  },
  "Sub Bagian Keuangan": {
    id: "user-keuangan",
    username: "keuangan",
    name: "Siti Rahma (Bendahara)",
    email: "siti.rahma@kpu.go.id",
  },
};

const MOCK_PASSWORD_HASH =
  "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f";

const hashPassword = async (password: string): Promise<string> => {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
};

const MASTER_MAPPED_ROLES: UserRole[] = [
  "Supervisor",
  "Pegawai",
  "Sub Bagian Keuangan",
];

const resolveMasterPegawaiMockSession = (
  mockProfile: Omit<UserSession, "role">,
  role: UserRole,
) => {
  if (typeof window === "undefined") return mockProfile;
  if (!MASTER_MAPPED_ROLES.includes(role)) return mockProfile;

  const candidates = pegawaiService
    .getAll()
    .filter(
      (item) => item.status === "Aktif" && item.roleAplikasi === role,
    );
  const pegawai = candidates[candidates.length - 1];

  if (!pegawai?.id) return mockProfile;

  return {
    ...mockProfile,
    name: pegawai.nama,
    pegawaiId: pegawai.id,
  };
};

export class AuthService {
  static resolvePersistedSession(user: UserSession): UserSession {
    const profile = resolveMasterPegawaiMockSession(user, user.role);
    return {
      ...profile,
      role: user.role,
    };
  }

  static async login(
    username: string,
    password: string,
    role: UserRole,
  ): Promise<UserSession | null> {
    // Simulasi delay jaringan mock API
    await new Promise((resolve) => setTimeout(resolve, 600));

    const mockProfile = MOCK_USERS[role];
    const passwordHash = await hashPassword(password);
    if (
      mockProfile &&
      mockProfile.username === username.toLowerCase().trim() &&
      passwordHash === MOCK_PASSWORD_HASH
    ) {
      const resolvedProfile = resolveMasterPegawaiMockSession(
        mockProfile,
        role,
      );

      return {
        ...resolvedProfile,
        role,
      };
    }
    return null;
  }

  static async logout(): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return true;
  }
}
