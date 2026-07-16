"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSbm } from "@/modules/sbm/useSbm";
import { SBMTable } from "@/modules/sbm/components/SBMTable";
import { SBMForm } from "@/modules/sbm/components/SBMForm";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Alert } from "@/components/ui/alert";
import { Plus } from "lucide-react";
import type { SBM } from "@/modules/sbm/sbm.schema";

export default function SbmPage() {
  const { hasPermission } = useAuth();
  const { items, add, update, remove } = useSbm();
  const { addToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SBM | null>(null);

  // RBAC checks
  const canRead = hasPermission("Master Standar Biaya Masukan", "R");
  const canCreate = hasPermission("Master Standar Biaya Masukan", "C");
  const canUpdate = hasPermission("Master Standar Biaya Masukan", "U");
  const canDelete = hasPermission("Master Standar Biaya Masukan", "D");

  if (!canRead) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Akses Ditolak">
          Anda tidak memiliki izin untuk mengakses halaman Master Standar Biaya
          Masukan.
        </Alert>
      </div>
    );
  }

  const handleEdit = (item: SBM) => {
    if (!canUpdate) {
      addToast("Anda tidak memiliki izin untuk memperbarui data", "error");
      return;
    }
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!canDelete) {
      addToast("Anda tidak memiliki izin untuk menghapus data", "error");
      return;
    }
    if (confirm("Apakah Anda yakin ingin menghapus data SBM ini?")) {
      remove(id);
      addToast("Data SBM berhasil dihapus", "success");
    }
  };

  const handleFormSubmit = (data: Omit<SBM, "id">) => {
    if (editingItem) {
      update(editingItem.id!, data);
      addToast("Data SBM berhasil diperbarui", "success");
    } else {
      add(data);
      addToast("Data SBM berhasil ditambahkan", "success");
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
            Master Standar Biaya Masukan (SBM)
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola data tarif akomodasi, transportasi, dan uang harian
            perjalanan dinas.
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah SBM
          </Button>
        )}
      </div>

      <SBMTable
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={canUpdate || canDelete}
      />

      <Dialog
        isOpen={modalOpen}
        onClose={handleCancel}
        title={editingItem ? "Ubah Data SBM" : "Tambah SBM Baru"}
      >
        <SBMForm
          initialValues={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      </Dialog>
    </div>
  );
}
