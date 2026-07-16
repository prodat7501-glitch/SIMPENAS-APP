"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Upload } from "@/components/ui/upload";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { Dialog } from "@/components/ui/dialog";
import { Drawer } from "@/components/ui/drawer";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Timeline, type TimelineEvent } from "@/components/ui/timeline";
import { Stepper } from "@/components/ui/stepper";
import { PrintPreview } from "@/components/ui/print-preview";
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  CheckCircle,
  AlertTriangle,
  Eye,
  FileText,
  Plus,
  HelpCircle,
  Sparkles,
  Inbox,
} from "lucide-react";

export default function DemoComponentsPage() {
  const { addToast } = useToast();

  // Component states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loadingOpen, setLoadingOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);

  // Input states for testing inline validation
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setInputError(e.target.value.length < 3);
  };

  // Trigger loading overlay simulation
  const triggerLoading = () => {
    setLoadingOpen(true);
    setTimeout(() => {
      setLoadingOpen(false);
      addToast("Proses data mock selesai!", "success");
    }, 2000);
  };

  // Mock Timeline Data
  const mockTimeline: TimelineEvent[] = [
    {
      id: "e1",
      title: "Nota Dinas Dibuat",
      description: "Oleh Andi Saputra (Supervisor)",
      time: "10:30",
      status: "success",
    },
    {
      id: "e2",
      title: "SPT Diajukan",
      description: "Oleh Rian Hidayat (Staf)",
      time: "11:00",
      status: "pending",
    },
    {
      id: "e3",
      title: "SPPD Menunggu Validasi",
      description: "Diproses oleh Sub Bagian Keuangan",
      time: "11:15",
      status: "warning",
    },
  ];

  // Mock Stepper Data
  const mockSteps = [
    { label: "Draf Dokumen", description: "Nota Dinas & SPT" },
    { label: "Verifikasi Atasan", description: "Approval Kasubag" },
    { label: "Validasi SPJ", description: "Pengecekan Keuangan" },
    { label: "Selesai", description: "Pembayaran & Arsip" },
  ];

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="p-6 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent border border-border rounded-3xl">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3 h-3" /> Galeri Komponen
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          Shared UI Components
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kumpulan pustaka komponen yang dapat digunakan kembali (*reusable*) di
          seluruh modul SIMPENAS sesuai UI Guideline.
        </p>
      </div>

      <Tabs defaultValue="form">
        <TabsList className="mb-6">
          <TabsTrigger value="form">Form & Inputs</TabsTrigger>
          <TabsTrigger value="feedback">Feedback & Popups</TabsTrigger>
          <TabsTrigger value="workflow">Workflow & Tables</TabsTrigger>
          <TabsTrigger value="structures">Structures & Shimmers</TabsTrigger>
        </TabsList>

        {/* TAB 1: FORM & INPUTS */}
        <TabsContent value="form" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Input & Date Picker */}
            <Card>
              <CardHeader>
                <CardTitle>Masukan & Penanggalan (Inputs)</CardTitle>
                <CardDescription>
                  Komponen Input, Select, dan DatePicker terstandarisasi.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
                    Input Normal
                  </label>
                  <Input
                    type="text"
                    placeholder="Ketik minimal 3 karakter..."
                    value={inputValue}
                    onChange={handleInputChange}
                    error={inputError}
                  />
                  {inputError && (
                    <p className="text-[10px] text-danger font-bold mt-1">
                      Input minimal harus 3 karakter.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
                    Select Dropdown
                  </label>
                  <Select>
                    <option value="1">Pilihan Pertama</option>
                    <option value="2">Pilihan Kedua</option>
                    <option value="3">Pilihan Ketiga</option>
                  </Select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
                    Date Picker
                  </label>
                  <DatePicker />
                </div>
              </CardContent>
            </Card>

            {/* Upload Component */}
            <Card>
              <CardHeader>
                <CardTitle>Pengunggah Berkas (Upload)</CardTitle>
                <CardDescription>
                  Mendukung drag & drop, status progress, dan visual preview.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Upload accept="image/*,application/pdf" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: FEEDBACK & POPUPS */}
        <TabsContent value="feedback" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Toast & Alert */}
            <Card>
              <CardHeader>
                <CardTitle>Umpan Balik & Peringatan (Alert & Toast)</CardTitle>
                <CardDescription>
                  Metode interaktif menyampaikan informasi sistem.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="success" title="Dokumen Disimpan">
                  Surat Perjalanan Dinas (SPPD) berhasil diterbitkan otomatis
                  oleh sistem.
                </Alert>
                <Alert variant="warning" title="Perlu Revisi">
                  Nota Dinas butuh peninjauan ulang anggaran di baris ke-4.
                </Alert>

                <div className="pt-4 border-t border-border flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      addToast("Berhasil menyimpan data!", "success")
                    }
                    className="cursor-pointer"
                  >
                    Toast Success
                  </Button>
                  <Button
                    onClick={() => addToast("Gagal memproses berkas", "error")}
                    className="cursor-pointer"
                  >
                    Toast Error
                  </Button>
                  <Button
                    onClick={() =>
                      addToast("Pemberitahuan DIPA diperbarui", "info")
                    }
                    className="cursor-pointer"
                  >
                    Toast Info
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pop-up Modals */}
            <Card>
              <CardHeader>
                <CardTitle>Pop-up & Modal (Dialog & Drawer)</CardTitle>
                <CardDescription>
                  Trigger overlay terpusat atau samping kanan.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Gunakan Dialog untuk konfirmasi tindakan penting, dan gunakan
                  Drawer untuk form pengisian panjang atau detail rekapitulasi
                  data.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setDialogOpen(true)}
                    className="cursor-pointer"
                  >
                    Buka Dialog Modal
                  </Button>
                  <Button
                    onClick={() => setDrawerOpen(true)}
                    className="cursor-pointer"
                  >
                    Buka Drawer Sheet
                  </Button>
                  <Button onClick={triggerLoading} className="cursor-pointer">
                    Trigger Loading Overlay
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dialog Instance */}
          <Dialog
            isOpen={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Konfirmasi Pengajuan Dokumen"
          >
            <p className="mb-4">
              Apakah Anda yakin ingin mengajukan berkas Surat Perintah Tugas
              (SPT) ini ke verifikator atasan?
            </p>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setDialogOpen(false)}
                variant="ghost"
                className="cursor-pointer"
              >
                Batal
              </Button>
              <Button
                onClick={() => {
                  setDialogOpen(false);
                  addToast("SPT Diajukan!", "success");
                }}
                className="cursor-pointer"
              >
                Ya, Kirim
              </Button>
            </div>
          </Dialog>

          {/* Drawer Instance */}
          <Drawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title="Detail Kelengkapan Berkas SPJ"
          >
            <div className="space-y-4">
              <p>
                Berikut adalah detail lampiran kuitansi pertanggungjawaban
                dinas:
              </p>
              <div className="p-4 bg-muted rounded-xl text-xs space-y-2">
                <p>
                  <strong>Uang Harian:</strong> Rp 1.110.000 (3 Hari)
                </p>
                <p>
                  <strong>Uang Tiket Pesawat:</strong> Rp 3.200.000
                </p>
                <p>
                  <strong>Akomodasi Hotel:</strong> Rp 1.500.000
                </p>
              </div>
              <Button
                onClick={() => setDrawerOpen(false)}
                className="w-full cursor-pointer"
              >
                Tutup Detail
              </Button>
            </div>
          </Drawer>

          {/* Loading Overlay Instance */}
          <LoadingOverlay
            isOpen={loadingOpen}
            message="Sedang menyimulasikan loading... mohon tunggu."
          />
        </TabsContent>

        {/* TAB 3: WORKFLOW & TABLES */}
        <TabsContent value="workflow" className="space-y-6">
          {/* Stepper */}
          <Card>
            <CardHeader>
              <CardTitle>Langkah Workflow (Stepper)</CardTitle>
              <CardDescription>
                Langkah-langkah pemrosesan dokumen administrasi dinas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Stepper steps={mockSteps} currentStep={2} />
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Timeline */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Riwayat Aktivitas (Timeline)</CardTitle>
                <CardDescription>Catatan audit persetujuan.</CardDescription>
              </CardHeader>
              <CardContent>
                <Timeline events={mockTimeline} />
              </CardContent>
            </Card>

            {/* Print Preview Button Section */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  Pratinjau Cetak & Tabel (Print Preview & Table)
                </CardTitle>
                <CardDescription>
                  Simulasi cetak laporan dinas dan layout tabel.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Menyediakan pratinjau cetak kertas ukuran F4/A4 resmi instansi
                  KPU lengkap dengan penandatangan kop surat secara instan
                  sebelum dicetak lewat window.print().
                </p>
                <Button
                  onClick={() => setPrintOpen(true)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4" /> Buka Pratinjau Cetak SPT
                </Button>

                {/* Table Component */}
                <div className="pt-4 border-t border-border">
                  <TableContainer>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>No</TableHead>
                          <TableHead>Nama Pegawai</TableHead>
                          <TableHead>NIP</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>1</TableCell>
                          <TableCell className="font-bold">Eriyanto</TableCell>
                          <TableCell>19920815 201801 1 002</TableCell>
                          <TableCell>
                            <Badge variant="success">Aktif</Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>2</TableCell>
                          <TableCell className="font-bold">
                            Andi Saputra
                          </TableCell>
                          <TableCell>19850212 201201 1 001</TableCell>
                          <TableCell>
                            <Badge variant="success">Aktif</Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Print Preview Modal */}
          <PrintPreview
            isOpen={printOpen}
            onClose={() => setPrintOpen(false)}
            title="Pratinjau Dokumen SPT - Nomor SPT/04/2026"
          >
            <div className="text-center font-bold space-y-1">
              <p className="text-lg">KOMISI PEMILIHAN UMUM</p>
              <p className="text-sm">KABUPATEN GORONTALO</p>
              <div className="border-b-4 border-double border-slate-900 my-4" />
            </div>
            <div className="text-center font-bold text-xs space-y-1 my-6">
              <p className="underline">SURAT PERINTAH TUGAS</p>
              <p className="text-muted-foreground">Nomor: SPT/04/2026</p>
            </div>
            <div className="text-xs space-y-4 leading-relaxed flex-1">
              <p>
                <strong>Menimbang:</strong> Bahwa dalam rangka pelaksanaan rapat
                evaluasi Pemilu 2026 KPU Kabupaten Gorontalo, perlu menugaskan
                personil pelaksana.
              </p>
              <p>
                <strong>Dasar:</strong> Keputusan Komisi Pemilihan Umum Republik
                Indonesia mengenai petunjuk koordinasi logistik.
              </p>
              <p>
                <strong>MEMBERI PERINTAH:</strong>
              </p>
              <div className="pl-6 space-y-2">
                <p>
                  <strong>Kepada:</strong> Eriyanto (Administrator)
                </p>
                <p>
                  <strong>Untuk:</strong> Menghadiri rapat evaluasi KPU Provinsi
                  Gorontalo pada tanggal 12 Juli 2026 s.d. 14 Juli 2026.
                </p>
              </div>
            </div>
            <div className="mt-12 flex justify-end text-xs">
              <div className="text-center space-y-12">
                <p>Kuasa Pengguna Anggaran</p>
                <p className="font-bold underline">Andi Saputra</p>
              </div>
            </div>
          </PrintPreview>
        </TabsContent>

        {/* TAB 4: STRUCTURES & SHIMMERS */}
        <TabsContent value="structures" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Skeletons & Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Indikator Muat & Label (Skeleton & Badge)</CardTitle>
                <CardDescription>
                  Visualisasi saat memuat data dan label status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Skeletons mockup */}
                <div className="space-y-2.5">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-20 w-full" />
                </div>

                {/* Badges mockup */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Empty State */}
            <Card>
              <CardHeader>
                <CardTitle>Status Data Kosong (Empty State)</CardTitle>
                <CardDescription>
                  Representasi visual data belum tersedia.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmptyState
                  title="Belum Ada Surat Tugas"
                  description="Ajukan Surat Perintah Tugas (SPT) pertama Anda untuk memulai perekaman log perjalanan."
                  icon={<Inbox className="w-6 h-6" />}
                  action={
                    <Button
                      onClick={() => addToast("Buka modal tambah SPT", "info")}
                      className="cursor-pointer"
                    >
                      Buat Dokumen Baru
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
