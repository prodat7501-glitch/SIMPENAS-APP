"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUnitKerja } from "@/modules/unit-kerja/useUnitKerja";
import { UnitKerjaTable } from "@/modules/unit-kerja/components/UnitKerjaTable";
import { UnitKerjaForm } from "@/modules/unit-kerja/components/UnitKerjaForm";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Alert } from "@/components/ui/alert";
import { Plus } from "lucide-react";
import type { UnitKerja } from "@/modules/unit-kerja/unit-kerja.schema";

export default function UnitKerjaPage() {
  const { hasPermission } = useAuth();
  const { items, add, update, remove } = useUnitKerja();
  const { addToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UnitKerja | null>(null);

  // RBAC checks
  const canRead = hasPermission("Master Unit Kerja", "R");
  const canCreate = hasPermission("Master Unit Kerja", "C");
  const canUpdate = hasPermission("Master Unit Kerja", "U");
  const canDelete = hasPermission("Master Unit Kerja", "D");

  if (!canRead) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Akses Ditolak">
          Anda tidak memiliki izin untuk mengakses halaman Master Data Unit
          Kerja.
        </Alert>
      </div>
    );
  }

  const handleEdit = (item: UnitKerja) => {
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
    if (confirm("Apakah Anda yakin ingin menghapus data unit kerja ini?")) {
      remove(id);
      addToast("Data unit kerja berhasil dihapus", "success");
    }
  };

  const handleFormSubmit = (data: Omit<UnitKerja, "id">) => {
    if (editingItem) {
      update(editingItem.id!, data);
      addToast("Data unit kerja berhasil diperbarui", "success");
    } else {
      add(data);
      addToast("Data unit kerja berhasil ditambahkan", "success");
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
            Master Unit Kerja
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola data divisi dan bagian struktural kerja KPU.
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Unit Kerja
          </Button>
        )}
      </div>

      <UnitKerjaTable
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={canUpdate || canDelete}
      />

      <Dialog
        isOpen={modalOpen}
        onClose={handleCancel}
        title={editingItem ? "Ubah Data Unit Kerja" : "Tambah Unit Kerja Baru"}
      >
        <UnitKerjaForm
          initialValues={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      </Dialog>
    </div>
  );
}
