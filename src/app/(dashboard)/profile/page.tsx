"use client";
import { useState } from "react";
import { Save, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth.store";
export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const { addToast } = useToast();
  const [name, setName] = useState(() => user?.name ?? "");
  const [email, setEmail] = useState(() => user?.email ?? "");
  const save = () => {
    if (name.trim().length < 3 || !email.includes("@"))
      return addToast("Nama atau email tidak valid", "error");
    updateProfile(name.trim(), email.trim());
    addToast("Profil berhasil diperbarui", "success");
  };
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-extrabold">Profil Saya</h1>
        <p className="text-xs text-muted-foreground">
          Kelola informasi dasar akun pengguna.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" /> Informasi Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block text-xs space-y-1">
            <span className="font-bold">Username</span>
            <Input value={user?.username ?? ""} disabled />
          </label>
          <label className="block text-xs space-y-1">
            <span className="font-bold">Nama Lengkap</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block text-xs space-y-1">
            <span className="font-bold">Email</span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-xs space-y-1">
            <span className="font-bold">Peran</span>
            <Input value={user?.role ?? ""} disabled />
          </label>
          <Button onClick={save}>
            <Save className="w-4 h-4" /> Simpan Profil
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
