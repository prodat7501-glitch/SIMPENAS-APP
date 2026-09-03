import { pegawaiService } from "@/modules/pegawai/pegawai.service";
import type { Pegawai } from "@/modules/pegawai/pegawai.schema";
import type { UserAccountFormInput } from "./user-account.schema";
import type { UserAccount } from "./user-account.types";
import { apiClient, withApiFallback } from "@/services/api";

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

interface RawUserAccountApi {
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  role?: string;
  pegawai_id?: string | null;
  pegawaiId?: string | null;
  is_active?: number | boolean;
  isActive?: boolean;
  password_hash?: string;
  passwordHash?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

const normalizeUserAccountFromApi = (raw: RawUserAccountApi): UserAccount => ({
  id: raw.id || `user-${Date.now()}`,
  username: raw.username || "",
  name: raw.name || "",
  email: raw.email || "",
  role: (raw.role as UserAccount["role"]) || "Pegawai",
  pegawaiId: raw.pegawai_id ?? raw.pegawaiId ?? undefined,
  isActive:
    raw.is_active === 1 || raw.is_active === true || raw.isActive === true,
  passwordHash:
    raw.password_hash ?? raw.passwordHash ?? DEFAULT_MOCK_PASSWORD_HASH,
  createdAt: raw.created_at ?? raw.createdAt ?? nowIso(),
  updatedAt: raw.updated_at ?? raw.updatedAt ?? nowIso(),
});

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

    if (accountIndex === -1) {
      throw new Error("Akun pengguna tidak ditemukan.");
    }

    const current = accounts[accountIndex];
    const username = input.username?.toLowerCase().trim() || current.username;

    const duplicateUsername = accounts.some(
      (account) =>
        account.id !== id && account.username.toLowerCase() === username,
    );

    if (duplicateUsername) {
      throw new Error("Username sudah digunakan.");
    }

    const passwordHash =
      input.newPassword && input.newPassword.trim().length >= 6
        ? await hashMockPassword(input.newPassword.trim())
        : current.passwordHash;

    const updated: UserAccount = {
      ...current,
      username,
      email: input.email?.toLowerCase().trim() || current.email,
      isActive:
        input.isActive !== undefined ? input.isActive : current.isActive,
      passwordHash,
      updatedAt: nowIso(),
    };

    accounts[accountIndex] = updated;
    saveAccounts(accounts);
    return updated;
  },

  // REST API Integration (/api/v1/akun-pengguna)
  apiGetAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<UserAccount[]> => {
    return withApiFallback(
      async () => {
        const queryParams = { limit: 500, ...params };
        const [res, pegawais] = await Promise.all([
          apiClient.get<
            UserAccount[] | { data?: UserAccount[]; items?: UserAccount[] }
          >("/api/v1/akun-pengguna", queryParams),
          pegawaiService.apiGetAll(),
        ]);
        const list = Array.isArray(res) ? res : res.data || res.items || [];
        const accounts = list.map((item) =>
          normalizeUserAccountFromApi(item as RawUserAccountApi),
        );

        // 1. Pastikan akun admin utama ada
        if (
          !accounts.some(
            (account) =>
              account.id === "user-admin" ||
              account.username.toLowerCase() === "admin",
          )
        ) {
          const adminAccount = createAdministratorAccount();
          try {
            await apiClient.post("/api/v1/akun-pengguna", {
              id: adminAccount.id,
              username: adminAccount.username,
              password_hash: adminAccount.passwordHash,
              name: adminAccount.name,
              email: adminAccount.email,
              role: adminAccount.role,
              is_active: 1,
            });
            accounts.unshift(adminAccount);
          } catch {
            accounts.unshift(adminAccount);
          }
        }

        const usedUsernames = new Set(
          accounts.map((account) => account.username.toLowerCase().trim()),
        );

        // 2. Buat akun otomatis untuk setiap pegawai yang belum memiliki akun di cloud
        for (const pegawai of pegawais) {
          if (!pegawai.id) continue;

          const accountIndex = accounts.findIndex(
            (account) => account.pegawaiId === pegawai.id,
          );

          if (accountIndex === -1) {
            const newAccount = createEmployeeAccount(pegawai, usedUsernames);
            try {
              await apiClient.post("/api/v1/akun-pengguna", {
                id: newAccount.id,
                username: newAccount.username,
                password_hash: newAccount.passwordHash,
                name: newAccount.name,
                email: newAccount.email,
                role: newAccount.role,
                pegawai_id: newAccount.pegawaiId,
                is_active: 1,
              });
              accounts.push(newAccount);
            } catch {
              accounts.push(newAccount);
            }
          }
        }

        // Sinkronkan juga ke penyimpanan lokal
        saveAccounts(accounts);

        return accounts.sort((left, right) => {
          if (left.id === "user-admin" || left.username === "admin") return -1;
          if (right.id === "user-admin" || right.username === "admin") return 1;
          return (left.name || "").localeCompare(right.name || "", "id");
        });
      },
      () => userAccountService.getAll(),
    );
  },

  apiGetById: async (id: string): Promise<UserAccount | null> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.get<UserAccount | { data?: UserAccount }>(
          `/api/v1/akun-pengguna/${id}`,
        );
        const unwrapped =
          (res as { data?: UserAccount }).data || (res as UserAccount);
        return unwrapped
          ? normalizeUserAccountFromApi(unwrapped as RawUserAccountApi)
          : null;
      },
      () => userAccountService.findById(id) || null,
    );
  },

  apiCreate: async (data: Partial<UserAccount>): Promise<UserAccount> => {
    return withApiFallback(
      async () => {
        const payload = {
          id: data.id || `user-${Date.now()}`,
          username: data.username?.toLowerCase().trim(),
          password_hash: data.passwordHash || DEFAULT_MOCK_PASSWORD_HASH,
          name: data.name,
          email: data.email?.toLowerCase().trim(),
          role: data.role,
          pegawai_id: data.pegawaiId || null,
          is_active: data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
        };
        const res = await apiClient.post<UserAccount | { data?: UserAccount }>(
          "/api/v1/akun-pengguna",
          payload,
        );
        const unwrapped =
          (res as { data?: UserAccount }).data || (res as UserAccount);
        const normalized = normalizeUserAccountFromApi(
          unwrapped as RawUserAccountApi,
        );

        const items = userAccountService.getAll();
        saveAccounts([...items, normalized]);
        return normalized;
      },
      async () => {
        const items = userAccountService.getAll();
        const newItem = {
          ...data,
          id: data.id || `user-${Date.now()}`,
        } as UserAccount;
        saveAccounts([...items, newItem]);
        return newItem;
      },
    );
  },

  apiUpdate: async (
    id: string,
    data: Partial<UserAccount & UserAccountFormInput>,
  ): Promise<UserAccount> => {
    let passwordHash: string | undefined;
    if (data.newPassword && data.newPassword.trim().length >= 6) {
      passwordHash = await hashMockPassword(data.newPassword.trim());
    } else if (data.passwordHash) {
      passwordHash = data.passwordHash;
    }

    const payload: Record<string, unknown> = {};
    if (data.username) payload.username = data.username.toLowerCase().trim();
    if (data.name) payload.name = data.name;
    if (data.email) payload.email = data.email.toLowerCase().trim();
    if (data.role) payload.role = data.role;
    if (data.pegawaiId !== undefined) payload.pegawai_id = data.pegawaiId;
    if (data.isActive !== undefined) payload.is_active = data.isActive ? 1 : 0;
    if (passwordHash) payload.password_hash = passwordHash;

    return withApiFallback(
      async () => {
        const res = await apiClient.put<UserAccount | { data?: UserAccount }>(
          `/api/v1/akun-pengguna/${id}`,
          payload,
        );
        const unwrapped =
          (res as { data?: UserAccount }).data || (res as UserAccount);
        const normalized = normalizeUserAccountFromApi(
          unwrapped as RawUserAccountApi,
        );

        const items = userAccountService.getAll();
        const updated = items.map((item) =>
          item.id === id
            ? {
                ...item,
                ...normalized,
                ...(passwordHash ? { passwordHash } : {}),
              }
            : item,
        );
        saveAccounts(updated);
        return normalized;
      },
      async () => {
        const items = userAccountService.getAll();
        const updated = items.map((item) =>
          item.id === id
            ? { ...item, ...data, ...(passwordHash ? { passwordHash } : {}) }
            : item,
        );
        saveAccounts(updated as UserAccount[]);
        return updated.find((i) => i.id === id)! as UserAccount;
      },
    );
  },

  delete: (id: string): boolean => {
    const items = userAccountService.getAll();
    saveAccounts(items.filter((item) => item.id !== id));
    return true;
  },

  saveAccounts: (accounts: UserAccount[]) => {
    saveAccounts(accounts);
  },

  apiDelete: async (id: string): Promise<boolean> => {
    return withApiFallback(
      async () => {
        await apiClient.delete(`/api/v1/akun-pengguna/${id}`);
        return true;
      },
      async () => {
        const items = userAccountService.getAll();
        saveAccounts(items.filter((item) => item.id !== id));
        return true;
      },
    );
  },

  apiBulkCreate: async (
    data: Partial<UserAccount>[],
  ): Promise<UserAccount[]> => {
    return withApiFallback(
      async () => {
        const res = await apiClient.bulkPost<
          UserAccount[] | { data?: UserAccount[] }
        >("/api/v1/akun-pengguna", data);
        return Array.isArray(res) ? res : res.data || [];
      },
      async () => {
        const items = userAccountService.getAll();
        saveAccounts([...items, ...(data as UserAccount[])]);
        return data as UserAccount[];
      },
    );
  },
};
