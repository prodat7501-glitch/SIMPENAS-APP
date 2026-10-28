"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useJabatan } from "@/modules/jabatan/useJabatan";
import { JabatanTable } from "@/modules/jabatan/components/JabatanTable";
import { JabatanForm } from "@/modules/jabatan/components/JabatanForm";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Alert } from "@/components/ui/alert";
import { Plus } from "lucide-react";
import type { Jabatan } from "@/modules/jabatan/jabatan.schema";

export default function JabatanPage() {
  const { hasPermission } = useAuth();
  const { items, add, update, remove } = useJabatan();
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Jabatan | null>(null);

  // RBAC checks
  const canRead = hasPermission("Master Jabatan", "R");
  const canCreate = hasPermission("Master Jabatan", "C");
  const canUpdate = hasPermission("Master Jabatan", "U");
  const canDelete = hasPermission("Master Jabatan", "D");

  if (!canRead) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Akses Ditolak">
          Anda tidak memiliki izin untuk mengakses halaman Master Data Jabatan.
        </Alert>
      </div>
    );
  }

  const handleEdit = (item: Jabatan) => {
    if (!canUpdate) {
      addToast("Anda tidak memiliki izin untuk memperbarui data", "error");
      return;
    }
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      addToast("Anda tidak memiliki izin untuk menghapus data", "error");
      return;
    }
    const isConfirmed = await confirm({
      title: "Hapus Jabatan",
      message: "Apakah Anda yakin ingin menghapus data jabatan ini? Tindakan ini bersifat permanen.",
      variant: "danger",
      confirmText: "Ya, Hapus Data",
    });
    if (isConfirmed) {
      await remove(id);
      addToast("Data jabatan berhasil dihapus.", "success");
    }
  };

  const handleFormSubmit = async (data: Omit<Jabatan, "id">) => {
    if (editingItem) {
      await update(editingItem.id!, data);
      addToast("Data jabatan berhasil diperbarui", "success");
    } else {
      await add(data);
      addToast("Data jabatan berhasil ditambahkan", "success");
    }
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleCancel = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">
            Master Jabatan
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola data standar jabatan internal instansi.
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Jabatan
          </Button>
        )}
      </div>

      <JabatanTable
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={canUpdate || canDelete}
      />

      <Dialog
        isOpen={modalOpen}
        onClose={handleCancel}
        title={editingItem ? "Ubah Data Jabatan" : "Tambah Jabatan Baru"}
      >
        <JabatanForm
          initialValues={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      </Dialog>
    </div>
  );
}
