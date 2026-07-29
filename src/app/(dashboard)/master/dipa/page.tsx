"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useDipa } from "@/modules/dipa/useDipa";
import { DIPATable } from "@/modules/dipa/components/DIPATable";
import { DIPAForm } from "@/modules/dipa/components/DIPAForm";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Alert } from "@/components/ui/alert";
import { Plus } from "lucide-react";
import type { DIPA, DipaFormData } from "@/modules/dipa/dipa.schema";

export default function DipaPage() {
  const { hasPermission } = useAuth();
  const { items, add, update, remove } = useDipa();
  const { addToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DIPA | null>(null);

  // RBAC checks
  const canRead = hasPermission("Master Anggaran DIPA", "R");
  const canCreate = hasPermission("Master Anggaran DIPA", "C");
  const canUpdate = hasPermission("Master Anggaran DIPA", "U");
  const canDelete = hasPermission("Master Anggaran DIPA", "D");

  if (!canRead) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Akses Ditolak">
          Anda tidak memiliki izin untuk mengakses halaman Master Data Anggaran
          DIPA.
        </Alert>
      </div>
    );
  }

  const handleEdit = (item: DIPA) => {
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
    if (confirm("Apakah Anda yakin ingin menghapus data anggaran DIPA ini?")) {
      remove(id);
      addToast("Data anggaran DIPA berhasil dihapus", "success");
    }
  };

  const handleFormSubmit = (data: DipaFormData) => {
    if (editingItem) {
      update(editingItem.id!, data);
      addToast("Data anggaran DIPA berhasil diperbarui", "success");
    } else {
      add(data);
      addToast("Data anggaran DIPA berhasil ditambahkan", "success");
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
            Master Anggaran DIPA
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola data pagu anggaran dan realisasi program kerja.
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Anggaran
          </Button>
        )}
      </div>

      <DIPATable
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={canUpdate || canDelete}
      />

      <Dialog
        isOpen={modalOpen}
        onClose={handleCancel}
        className="max-w-3xl"
        bodyClassName="max-h-[75vh] overflow-y-auto pr-1"
        title={
          editingItem ? "Ubah Data Anggaran DIPA" : "Tambah Anggaran DIPA Baru"
        }
      >
        <DIPAForm
          initialValues={editingItem}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      </Dialog>
    </div>
  );
}
