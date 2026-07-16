"use client";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useNotificationStore } from "@/stores/notification.store";
export default function NotifikasiPage() {
  const store = useNotificationStore();
  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold">Notifikasi</h1>
          <p className="text-xs text-muted-foreground">
            Informasi approval, revisi, validasi, dan dokumen.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={store.markAllAsRead}>
            <CheckCheck className="w-4 h-4" /> Tandai Dibaca
          </Button>
          <Button variant="ghost" onClick={store.clearAll}>
            <Trash2 className="w-4 h-4" /> Bersihkan
          </Button>
        </div>
      </div>
      {!store.notifications.length ? (
        <EmptyState
          title="Tidak Ada Notifikasi"
          description="Semua notifikasi akan muncul di sini."
          icon={<Bell />}
        />
      ) : (
        <div className="space-y-3">
          {store.notifications.map((x) => (
            <Card
              key={x.id}
              className={!x.read ? "border-primary/40" : ""}
              onClick={() => store.markAsRead(x.id)}
            >
              <div className="flex justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm">{x.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {x.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {new Date(x.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
                <Badge variant={x.read ? "outline" : "info"}>
                  {x.read ? "Dibaca" : "Baru"}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
