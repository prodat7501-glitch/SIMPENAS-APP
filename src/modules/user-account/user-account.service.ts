import { pegawaiService } from "@/modules/pegawai/pegawai.service";
import type { Pegawai } from "@/modules/pegawai/pegawai.schema";
import type { UserAccountFormInput } from "./user-account.schema";
import type { UserAccount } from "./user-account.types";

const STORAGE_KEY = "simpenas_user_accounts";

export const DEFAULT_MOCK_PASSWORD = "password123";
export const DEFAULT_MOCK_PASSWORD_HASH =
  "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f";

const nowIso = () => new Date().toISOString();

const createAdministratorAccount = (): UserAccount => {
  const timestamp = nowIso();

  return {
    id: "user-admin",
    username: "admin",
    name: "Administrator SIMPENAS",
    email: "admin@kpu.go.id",
    role: "Administrator",
    passwordHash: DEFAULT_MOCK_PASSWORD_HASH,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const normalizeUsernameBase = (name: string) => {
  const primaryName = name.split(",")[0] ?? name;
  const words = primaryName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return words.join(".") || "pegawai";
};

const createUniqueUsername = (name: string, usedUsernames: Set<string>) => {
  const base = normalizeUsernameBase(name);
  let candidate = base;
  let sequence = 2;

  while (usedUsernames.has(candidate)) {
    candidate = `${base}.${sequence}`;
    sequence += 1;
  }

  usedUsernames.add(candidate);
  return candidate;
};

const createEmployeeAccount = (
  pegawai: Pegawai,
  usedUsernames: Set<string>,
): UserAccount => {
  const timestamp = nowIso();
  const username = createUniqueUsername(pegawai.nama, usedUsernames);

  return {
    id: `user-${pegawai.id}`,
    pegawaiId: pegawai.id,
    username,
    name: pegawai.nama,
    email: `${username}@kpu.go.id`,
    role: pegawai.roleAplikasi,
    passwordHash: DEFAULT_MOCK_PASSWORD_HASH,
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const readStoredAccounts = (): UserAccount[] => {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as UserAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveAccounts = (accounts: UserAccount[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }
};

const synchronizeAccounts = (): UserAccount[] => {
  const employees = pegawaiService.getAll();
  const storedAccounts = readStoredAccounts();
  const accounts = [...storedAccounts];

  if (!accounts.some((account) => account.id === "user-admin")) {
    accounts.unshift(createAdministratorAccount());
  }

  const usedUsernames = new Set(
    accounts.map((account) => account.username.toLowerCase().trim()),
  );

  employees.forEach((pegawai) => {
    if (!pegawai.id) return;

    const accountIndex = accounts.findIndex(
      (account) => account.pegawaiId === pegawai.id,
    );

    if (accountIndex === -1) {
      accounts.push(createEmployeeAccount(pegawai, usedUsernames));
      return;
    }

    const current = accounts[accountIndex];
    accounts[accountIndex] = {
      ...current,
      name: pegawai.nama,
      role: pegawai.roleAplikasi,
    };
  });

  const synchronized = accounts.sort((left, right) => {
    if (left.id === "user-admin") return -1;
    if (right.id === "user-admin") return 1;
    return left.name.localeCompare(right.name, "id");
  });

  saveAccounts(synchronized);
  return synchronized;
};

export const hashMockPassword = async (password: string): Promise<string> => {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
};

export const userAccountService = {
  getAll: (): UserAccount[] => synchronizeAccounts(),

  findById: (id: string): UserAccount | undefined =>
    synchronizeAccounts().find((account) => account.id === id),

  findByUsername: (username: string): UserAccount | undefined => {
    const normalizedUsername = username.toLowerCase().trim();
    return synchronizeAccounts().find(
      (account) => account.username.toLowerCase() === normalizedUsername,
    );
  },

  canLogin: (account: UserAccount): boolean => {
    if (!account.isActive) return false;
    if (!account.pegawaiId) return account.role === "Administrator";

    const pegawai = pegawaiService
      .getAll()
      .find((item) => item.id === account.pegawaiId);
    return pegawai?.status === "Aktif";
  },

  update: async (
    id: string,
    input: UserAccountFormInput,
  ): Promise<UserAccount> => {
    const accounts = synchronizeAccounts();
    const accountIndex = accounts.findIndex((account) => account.id === id);
    if (accountIndex === -1) throw new Error("Akun pengguna tidak ditemukan.");

    const username = input.username.toLowerCase().trim();
    const duplicate = accounts.some(
      (account) =>
        account.id !== id && account.username.toLowerCase() === username,
    );
    if (duplicate) throw new Error("Username sudah digunakan akun lain.");

    const current = accounts[accountIndex];
    if (current.id === "user-admin" && !input.isActive) {
      throw new Error("Akun Administrator utama tidak dapat dinonaktifkan.");
    }

    const passwordHash = input.newPassword
      ? await hashMockPassword(input.newPassword)
      : current.passwordHash;

    const updated: UserAccount = {
      ...current,
      username,
      email: input.email.toLowerCase().trim(),
      isActive: input.isActive,
      passwordHash,
      updatedAt: nowIso(),
    };

    accounts[accountIndex] = updated;
    saveAccounts(accounts);
    return updated;
  },
};

