"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Edit3, Hash, RefreshCw, Save, X } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import type {
  DocumentType,
  NumberHistory,
  NumberStatus,
  NumberingConfig,
} from "@/modules/pengaturan/penomoran.schema";
import { applyExistingNumberingService } from "@/modules/pengaturan/apply-existing-numbering.service";
import { penomoranService } from "@/modules/pengaturan/penomoran.service";
import { usePenomoran } from "@/modules/pengaturan/usePenomoran";
import { SPPD_QUERY_KEY } from "@/modules/sppd/sppd.constants";

type BookingForm = {
  documentType: DocumentType;
  date: string;
  sequence: string;
  bookedFor: string;
  note: string;
};

const managedNumberTypes: DocumentType[] = ["Nota Dinas", "SPT", "SPPD"];
const today = () => new Date().toISOString().slice(0, 10);

const getStatusVariant = (status?: NumberStatus) => {
  if (status === "Booking") return "warning";
  if (status === "Dibatalkan") return "info";
  return "success";
};

export default function PengaturanPage() {
  const { hasPermission } = useAuth();
  const { configs, history, loading, error, save, refresh } = usePenomoran();
  const [editing, setEditing] = useState<NumberingConfig | null>(null);
  const [booking, setBooking] = useState<BookingForm>({
    documentType: "SPT",
    date: today(),
    sequence: "",
    bookedFor: "",
    note: "",
  });
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const canUpdate = hasPermission("Pengaturan Penomoran", "U");
  const preview = useMemo(
    () => (editing ? penomoranService.preview(editing) : ""),
    [editing],
  );
  const managedHistory = history.filter((item) =>
    managedNumberTypes.includes(item.documentType),
  );

  const handleApplyExistingNumbers = () => {
    if (!canUpdate) return;
    const ok = confirm(
      "Terapkan format nomor terbaru ke SPT dan SPPD existing? Nomor lama akan diganti sesuai format saat ini.",
    );
    if (!ok) return;
    try {
      const changes = applyExistingNumberingService.applySptAndSppd();
      addToast(
        `${changes.length} dokumen existing diperbarui dengan format nomor terbaru.`,
        "success",
      );
      refresh();
      void queryClient.invalidateQueries({ queryKey: SPPD_QUERY_KEY });
    } catch (e) {
      addToast(
        e instanceof Error
          ? e.message
          : "Gagal menerapkan format nomor ke dokumen existing.",
        "error",
      );
    }
  };

  const handleBookNumber = () => {
    if (!canUpdate) return;
    try {
      const entry = penomoranService.bookNumber({
        documentType: booking.documentType,
        date: booking.date,
        sequence: booking.sequence ? Number(booking.sequence) : undefined,
        bookedFor: booking.bookedFor,
        note: booking.note,
      });
      addToast(`Nomor ${entry.number} berhasil dibooking`, "success");
      setBooking((current) => ({
        ...current,
        sequence: "",
        bookedFor: "",
        note: "",
      }));
      refresh();
    } catch (e) {
      addToast(
        e instanceof Error ? e.message : "Booking nomor gagal",
        "error",
      );
    }
  };

  const handleCancelBooking = (item: NumberHistory) => {
    if (!canUpdate) return;
    const ok = confirm(
      `Batalkan booking nomor ${item.number}? Nomor ini akan tersedia kembali.`,
    );
    if (!ok) return;
    try {
      penomoranService.cancelBooking(
        item.id,
        "Booking dibatalkan oleh Administrator.",
      );
      addToast(`Booking nomor ${item.number} dibatalkan`, "success");
      refresh();
    } catch (e) {
      addToast(
        e instanceof Error ? e.message : "Gagal membatalkan booking",
        "error",
      );
    }
  };

  if (!hasPermission("Pengaturan Penomoran", "R"))
    return (
      <Alert variant="error" title="Akses Ditolak">
        Anda tidak memiliki izin Pengaturan Penomoran.
      </Alert>
    );
  if (loading)
    return (
      <LoadingOverlay isOpen message="Memuat pengaturan penomoran..." />
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-xl font-extrabold">Pengaturan Penomoran</h1>
          <p className="text-xs text-muted-foreground">
            Master format, running number, booking, dan pengembalian nomor
            dokumen resmi.
          </p>
        </div>
        {canUpdate && (
          <Button variant="outline" onClick={handleApplyExistingNumbers}>
            <RefreshCw className="h-4 w-4" /> Terapkan ke Dokumen Existing
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="error" title="Gagal Memuat">
          {error}
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {configs.map((item) => (
          <Card key={item.documentType}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4" />
                {item.documentType}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p>
                <span className="text-muted-foreground">Format</span>
                <br />
                <code className="break-all">{item.format}</code>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <p>
                  <span className="text-muted-foreground">Running</span>
                  <br />
                  <b>{item.runningNumber}</b>
                </p>
                <p>
                  <span className="text-muted-foreground">Tahun</span>
                  <br />
                  <b>{item.year}</b>
                </p>
              </div>
              <p className="rounded bg-muted p-2">
                <span className="text-muted-foreground">Preview berikutnya</span>
                <br />
                <b>{penomoranService.preview(item)}</b>
              </p>
              {canUpdate && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setEditing({ ...item })}
                >
                  <Edit3 className="h-4 w-4" /> Ubah
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!configs.length && !error && (
        <EmptyState
          title="Pengaturan belum tersedia"
          description="Belum ada jenis dokumen yang dikonfigurasi."
        />
      )}

      {canUpdate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Kelola Nomor Admin - Nota Dinas, SPT, SPPD
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-5">
              <Field label="Jenis Dokumen">
                <Select
                  value={booking.documentType}
                  onChange={(e) =>
                    setBooking({
                      ...booking,
                      documentType: e.target.value as DocumentType,
                    })
                  }
                >
                  {managedNumberTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Tanggal Nomor">
                <Input
                  type="date"
                  value={booking.date}
                  onChange={(e) =>
                    setBooking({ ...booking, date: e.target.value })
                  }
                />
              </Field>
              <Field label="Nomor Urut">
                <Input
                  type="number"
                  min={1}
                  placeholder="Kosong = otomatis"
                  value={booking.sequence}
                  onChange={(e) =>
                    setBooking({ ...booking, sequence: e.target.value })
                  }
                />
              </Field>
              <Field label="Dibooking Untuk">
                <Input
                  placeholder="Contoh: Si A"
                  value={booking.bookedFor}
                  onChange={(e) =>
                    setBooking({ ...booking, bookedFor: e.target.value })
                  }
                />
              </Field>
              <Field label="Catatan">
                <Input
                  placeholder="Keperluan booking"
                  value={booking.note}
                  onChange={(e) =>
                    setBooking({ ...booking, note: e.target.value })
                  }
                />
              </Field>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted p-3 text-xs">
              <p>
                Booking akan membuat nomor dilewati oleh tombol{" "}
                <b>Ambil Nomor</b>. Jika booking dibatalkan, nomor kembali
                tersedia.
              </p>
              <Button onClick={handleBookNumber}>
                <Save className="h-4 w-4" /> Booking Nomor
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {editing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Ubah Format {editing.documentType}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Format">
              <Input
                value={editing.format}
                onChange={(e) =>
                  setEditing({ ...editing, format: e.target.value })
                }
              />
            </Field>
            <Field label="Prefix">
              <Input
                value={editing.prefix}
                onChange={(e) =>
                  setEditing({ ...editing, prefix: e.target.value })
                }
              />
            </Field>
            <Field label="Suffix">
              <Input
                value={editing.suffix}
                onChange={(e) =>
                  setEditing({ ...editing, suffix: e.target.value })
                }
              />
            </Field>
            <Field label="Tahun">
              <Input
                type="number"
                value={editing.year}
                onChange={(e) =>
                  setEditing({ ...editing, year: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Running Number">
              <Input
                type="number"
                min={0}
                value={editing.runningNumber}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    runningNumber: Number(e.target.value),
                  })
                }
              />
            </Field>
            <Field label="Jumlah Digit">
              <Input
                type="number"
                min={1}
                max={8}
                value={editing.padding}
                onChange={(e) =>
                  setEditing({ ...editing, padding: Number(e.target.value) })
                }
              />
            </Field>
            <div className="rounded bg-muted p-3 text-sm md:col-span-2">
              <span className="text-muted-foreground">Preview format:</span>{" "}
              <b>{preview}</b>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button
                onClick={() => {
                  try {
                    save(editing);
                    setEditing(null);
                    addToast("Pengaturan penomoran disimpan", "success");
                  } catch (e) {
                    addToast(
                      e instanceof Error ? e.message : "Data tidak valid",
                      "error",
                    );
                  }
                }}
              >
                <Save className="h-4 w-4" /> Simpan
              </Button>
              <Button variant="outline" onClick={() => setEditing(null)}>
                <X className="h-4 w-4" /> Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Riwayat dan Status Nomor</CardTitle>
        </CardHeader>
        <CardContent>
          {!history.length ? (
            <EmptyState
              title="Belum ada riwayat"
              description="Riwayat akan muncul setelah tombol Ambil Nomor atau Booking Nomor digunakan."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="p-3">Dokumen</th>
                    <th className="p-3">Nomor</th>
                    <th className="p-3">Urut</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Booking Untuk</th>
                    <th className="p-3">Catatan</th>
                    <th className="p-3">Waktu</th>
                    {canUpdate && <th className="p-3 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {managedHistory.map((row) => (
                    <tr className="border-b" key={row.id}>
                      <td className="p-3">{row.documentType}</td>
                      <td className="p-3 font-medium">{row.number}</td>
                      <td className="p-3">{row.sequence}</td>
                      <td className="p-3">
                        <Badge variant={getStatusVariant(row.status)}>
                          {row.status ?? "Terpakai"}
                        </Badge>
                      </td>
                      <td className="p-3">{row.bookedFor ?? "-"}</td>
                      <td className="p-3">{row.note ?? "-"}</td>
                      <td className="p-3">
                        {new Date(row.updatedAt ?? row.createdAt).toLocaleString(
                          "id-ID",
                        )}
                      </td>
                      {canUpdate && (
                        <td className="p-3 text-right">
                          {row.status === "Booking" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelBooking(row)}
                            >
                              Batalkan
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="space-y-1 text-xs">
      <span className="font-bold">{label}</span>
      {children}
    </label>
  );
}
