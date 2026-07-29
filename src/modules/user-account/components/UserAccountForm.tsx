"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  userAccountFormSchema,
  type UserAccountFormInput,
} from "../user-account.schema";
import type { UserAccount } from "../user-account.types";

interface UserAccountFormProps {
  account: UserAccount;
  onSubmit: (input: UserAccountFormInput) => Promise<void>;
  onCancel: () => void;
}

export function UserAccountForm({
  account,
  onSubmit,
  onCancel,
}: UserAccountFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserAccountFormInput>({
    resolver: zodResolver(userAccountFormSchema),
    defaultValues: {
      username: account.username,
      email: account.email,
      isActive: account.isActive,
      newPassword: "",
    },
  });

  useEffect(() => {
    reset({
      username: account.username,
      email: account.email,
      isActive: account.isActive,
      newPassword: "",
    });
  }, [account, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-foreground">
            Pegawai
          </label>
          <Input value={account.name} disabled />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-foreground">
            Role Aplikasi
          </label>
          <Input value={account.role} disabled />
          <p className="mt-1 text-[10px] text-muted-foreground">
            Role mengikuti Master Pegawai dan tidak diubah dari halaman ini.
          </p>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold text-foreground">
          Username
        </label>
        <Input {...register("username")} error={!!errors.username} />
        {errors.username && (
          <p className="mt-1 text-[10px] font-semibold text-danger">
            {errors.username.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold text-foreground">
          Email
        </label>
        <Input type="email" {...register("email")} error={!!errors.email} />
        {errors.email && (
          <p className="mt-1 text-[10px] font-semibold text-danger">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-bold text-foreground">
          Kata Sandi Baru
        </label>
        <Input
          type="password"
          placeholder="Kosongkan jika kata sandi tidak diubah"
          {...register("newPassword")}
          error={!!errors.newPassword}
        />
        {errors.newPassword && (
          <p className="mt-1 text-[10px] font-semibold text-danger">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <label className="flex items-center gap-2 rounded-xl border border-border p-3 text-xs font-semibold text-foreground">
        <input
          type="checkbox"
          {...register("isActive")}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        Akun dapat digunakan untuk login
      </label>

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan Akun"}
        </Button>
      </div>
    </form>
  );
}

