import type { UserRole } from "@/stores/auth.store";

export interface UserAccount {
  id: string;
  pegawaiId?: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

