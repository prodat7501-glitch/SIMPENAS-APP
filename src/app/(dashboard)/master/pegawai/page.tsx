"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePegawai } from "@/modules/pegawai/usePegawai";
import { useJabatan } from "@/modules/jabatan/useJabatan";
import { useUnitKerja } from "@/modules/unit-kerja/useUnitKerja";
import { usePangkat } from "@/modules/pangkat/usePangkat";
import { PegawaiTable } from "@/modules/pegawai/components/PegawaiTable";
import { PegawaiForm } from "@/modules/pegawai/components/PegawaiForm";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Alert } from "@/components/ui/alert";
import { Plus } from "lucide-react";
import type { Pegawai } from "@/modules/pegawai/pegawai.schema";

export default function PegawaiPage() {
  const { hasPermission } = useAuth();
  const { items, add, update, remove, toggleStatus } = usePegawai();
  const { items: jabatans } = useJabatan();
  const { items: unitKerjas } = useUnitKerja();
  const { items: pangkats } = usePangkat();
  const { addToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pegawai | null>(null);

  // RBAC checks
  const canRead = hasPermission("Master Pegawai", "R");
  const canCreate = hasPermission("Master Pegawai", "C");
  const canUpdate = hasPermission("Master Pegawai", "U");
  const canDelete = hasPermission("Master Pegawai", "D");

  if (!canRead) {
    return (
      <div className="p-6">
        <Alert variant="error" title="Akses Ditolak">
          Anda tidak memiliki izin untuk mengakses halaman Master Data Pegawai.
        </Alert>
      </div>
    );
  }

  const handleEdit = (item: Pegawai) => {
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
    if (confirm("Apakah Anda yakin ingin menghapus data pegawai ini?")) {
      remove(id);
      addToast("Data pegawai berhasil dihapus", "success");
    }
  };

  const handleToggleStatus = (id: string) => {
    if (!canUpdate) {
      addToast("Anda tidak memiliki izin untuk memperbarui status", "error");
      return;
    }
    toggleStatus(id);
    addToast("Status pegawai berhasil diperbarui", "success");
  };

  const handleFormSubmit = (data: Omit<Pegawai, "id">) => {
    if (editingItem) {
      update(editingItem.id!, data);
      addToast("Data pegawai berhasil diperbarui", "success");
    } else {
      add(data);
      addToast("Data pegawai berhasil ditambahkan", "success");
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
            Master Pegawai
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola data keanggotaan pegawai struktural KPU Kabupaten Gorontalo.
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Pegawai
          </Button>
        )}
      </div>

      <PegawaiTable
        items={items}
        jabatans={jabatans}
        unitKerjas={unitKerjas}
        pangkats={pangkats}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        canEdit={canUpdate || canDelete}
      />

      <Dialog
        isOpen={modalOpen}
        onClose={handleCancel}
        title={editingItem ? "Ubah Data Pegawai" : "Tambah Pegawai Baru"}
      >
        <PegawaiForm
          initialValues={editingItem}
          jabatans={jabatans}
          unitKerjas={unitKerjas}
          pangkats={pangkats}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      </Dialog>
    </div>
  );
}
