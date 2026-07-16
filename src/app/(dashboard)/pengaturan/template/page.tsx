"use client";
import { useState } from "react";
import { Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PrintPreview } from "@/components/ui/print-preview";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { usePenandatangan } from "@/modules/penandatangan/usePenandatangan";
import { useTemplateStore } from "@/stores/template.store";
import { useAuth } from "@/hooks/useAuth";
import { Alert } from "@/components/ui/alert";
import { DocumentTemplate } from "@/components/document/DocumentTemplate";
export default function TemplatePage() {
  const { hasPermission } = useAuth();
  const store = useTemplateStore();
  const [form, setForm] = useState(store.config);
  const [preview, setPreview] = useState(false);
  const { items } = usePenandatangan();
  const { addToast } = useToast();
  const save = () => {
    store.update(form);
    addToast("Template dokumen berhasil disimpan", "success");
  };
  if (!hasPermission("Template Dokumen", "R")) {
    return (
      <Alert variant="error" title="Akses Ditolak">
        Anda tidak memiliki izin untuk mengakses Template Dokumen.
      </Alert>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold">Template Dokumen</h1>
        <p className="text-xs text-muted-foreground">
          Konfigurasi format resmi tanpa mengubah kode dokumen.
        </p>
      </div>
      <div className="grid xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Header dan Footer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Nama Instansi">
              <Input
                value={form.namaInstansi}
                onChange={(e) =>
                  setForm({ ...form, namaInstansi: e.target.value })
                }
              />
            </Field>
            <Field label="Alamat">
              <Input
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              />
            </Field>
            <Field label="Kop Surat">
              <Input value={form.kopSurat} onChange={(e) => setForm({ ...form, kopSurat: e.target.value })} />
            </Field>
            <Field label="Path Logo">
              <Input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} />
            </Field>
            <Field label="Footer">
              <Input
                value={form.footer}
                onChange={(e) => setForm({ ...form, footer: e.target.value })}
              />
            </Field>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Kertas dan Penandatangan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Ukuran Kertas">
              <Select
                value={form.ukuranKertas}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ukuranKertas: e.target.value as "A4" | "F4",
                  })
                }
              >
                <option>A4</option>
                <option>F4</option>
              </Select>
            </Field>
            <Field label="Margin (mm)">
              <Input
                type="number"
                min={10}
                max={40}
                value={form.margin}
                onChange={(e) =>
                  setForm({ ...form, margin: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Font Dokumen">
              <Select value={form.font} onChange={(e) => setForm({ ...form, font: e.target.value as typeof form.font })}>
                <option>Arial</option><option>Times New Roman</option><option>Inter</option>
              </Select>
            </Field>
            <Field label="Alignment Kop dan Footer">
              <Select value={form.alignment} onChange={(e) => setForm({ ...form, alignment: e.target.value as typeof form.alignment })}>
                <option value="left">Kiri</option><option value="center">Tengah</option><option value="right">Kanan</option>
              </Select>
            </Field>
            <Field label="Penandatangan Default">
              <Select
                value={form.penandatanganId}
                onChange={(e) =>
                  setForm({ ...form, penandatanganId: e.target.value })
                }
              >
                <option value="">Pilih penandatangan</option>
                {items
                  .filter((x) => x.status === "Aktif")
                  .map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.nama} — {x.peran}
                    </option>
                  ))}
              </Select>
            </Field>
            <div className="flex gap-2">
              <Button onClick={save}>
                <Save className="w-4 h-4" /> Simpan
              </Button>
              <Button variant="outline" onClick={() => setPreview(true)}>
                <Eye className="w-4 h-4" /> Preview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <PrintPreview
        isOpen={preview}
        onClose={() => setPreview(false)}
        title="Preview Template"
      >
        <DocumentTemplate>
          <div className="py-16 text-center">
            <h2 className="font-bold underline">CONTOH DOKUMEN RESMI</h2>
            <p className="mt-6 text-sm">
              Area isi dokumen dengan ukuran {form.ukuranKertas}.
            </p>
          </div>
        </DocumentTemplate>
      </PrintPreview>
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
    <label className="block text-xs space-y-1">
      <span className="font-bold">{label}</span>
      {children}
    </label>
  );
}
