"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePangkat } from "@/modules/pangkat/usePangkat";
import { PangkatTable } from "@/modules/pangkat/components/PangkatTable";
import { PangkatForm } from "@/modules/pangkat/components/PangkatForm";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Alert } from "@/components/ui/alert";
import { Plus } from "lucide-react";
import type { Pangkat } from "@/modules/pangkat/pangkat.schema";

export default function PangkatPage() {
  const { hasPermission } = useAuth();
  const { items, add, update, remove } = usePangkat();
  const { addToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pangkat | null>(null);

  // RBAC checks
  const canRead = hasPermission("Master Pangkat/Golongan", "R");
  const canCreate = hasPermission("Master Pangkat/Golongan", "C");
  const canUpdate = hasPermission("Master Pangkat/Golongan", "U");
  const canDelete = hasPermission("Master Pangkat/Golongan", "D");

  if (!canRead) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Akses Ditolak">
          Anda tidak memiliki izin untuk mengakses halaman Master Data Pangkat &
          Golongan.
        </Alert>
      </div>
    );
  }

  const handleEdit = (item: Pangkat) => {
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
    if (
      confirm("Apakah Anda yakin ingin menghapus data pangkat/golongan ini?")
    ) {
      remove(id);
      addToast("Data pangkat/golongan berhasil dihapus", "success");
    }
  };

  const handleFormSubmit = (data: Omit<Pangkat, "id">) => {
    if (editingItem) {
      update(editingItem.id!, data);
      addToast("Data pangkat/golongan berhasil diperbarui", "success");
    } else {
      add(data);
      addToast("Data pangkat/golongan berhasil ditambahkan", "success");
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
            Master Pangkat & Golongan
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola data jenjang pangkat dan eselon PNS.
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Pangkat
          </Button>
        )}
      </div>

      <PangkatTable
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={canUpdate || canDelete}
      />

      <Dialog
        isOpen={modalOpen}
        onClose={handleCancel}
        title={
          editingItem
            ? "Ubah Data Pangkat/Golongan"
            : "Tambah Pangkat/Golongan Baru"
        }
      >
        <PangkatForm
          initialValues={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      </Dialog>
    </div>
  );
}
