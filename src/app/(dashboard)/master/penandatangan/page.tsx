"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePenandatangan } from "@/modules/penandatangan/usePenandatangan";
import { PenandatanganTable } from "@/modules/penandatangan/components/PenandatanganTable";
import { PenandatanganForm } from "@/modules/penandatangan/components/PenandatanganForm";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Alert } from "@/components/ui/alert";
import { Plus } from "lucide-react";
import type { Penandatangan } from "@/modules/penandatangan/penandatangan.schema";

export default function PenandatanganPage() {
  const { hasPermission } = useAuth();
  const { items, add, update, remove, toggleStatus } = usePenandatangan();
  const { addToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Penandatangan | null>(null);

  // RBAC checks
  const canRead = hasPermission("Master Pejabat Penandatangan", "R");
  const canCreate = hasPermission("Master Pejabat Penandatangan", "C");
  const canUpdate = hasPermission("Master Pejabat Penandatangan", "U");
  const canDelete = hasPermission("Master Pejabat Penandatangan", "D");

  if (!canRead) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Akses Ditolak">
          Anda tidak memiliki izin untuk mengakses halaman Master Pejabat
          Penandatangan.
        </Alert>
      </div>
    );
  }

  const handleEdit = (item: Penandatangan) => {
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
      confirm(
        "Apakah Anda yakin ingin menghapus data pejabat penandatangan ini?",
      )
    ) {
      remove(id);
      addToast("Data pejabat berhasil dihapus", "success");
    }
  };

  const handleToggleStatus = (id: string) => {
    if (!canUpdate) {
      addToast("Anda tidak memiliki izin untuk memperbarui status", "error");
      return;
    }
    toggleStatus(id);
    addToast("Status pejabat berhasil diperbarui", "success");
  };

  const handleFormSubmit = (data: Omit<Penandatangan, "id">) => {
    if (editingItem) {
      update(editingItem.id!, data);
      addToast("Data pejabat berhasil diperbarui", "success");
    } else {
      add(data);
      addToast("Data pejabat berhasil ditambahkan", "success");
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
            Master Pejabat Penandatangan
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola data pejabat resmi penandatangan dokumen dinas & keuangan.
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Pejabat
          </Button>
        )}
      </div>

      <PenandatanganTable
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        canEdit={canUpdate || canDelete}
      />

      <Dialog
        isOpen={modalOpen}
        onClose={handleCancel}
        title={
          editingItem
            ? "Ubah Data Pejabat Penandatangan"
            : "Tambah Pejabat Penandatangan Baru"
        }
        className="max-w-2xl"
        bodyClassName="max-h-[75vh] overflow-y-auto pr-1"
      >
        <PenandatanganForm
          initialValues={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      </Dialog>
    </div>
  );
}
