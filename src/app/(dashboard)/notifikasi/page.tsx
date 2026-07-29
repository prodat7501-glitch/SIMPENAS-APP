"use client";
import Link from "next/link";
import { ArrowRight, Bell, CheckCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useAuth } from "@/hooks/useAuth";
import { formatTableDateTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  isNotificationVisibleFor,
  useNotificationStore,
} from "@/stores/notification.store";
export default function NotifikasiPage() {
  const { user } = useAuth();
  const store = useNotificationStore();
  const notifications = store.notifications.filter((notification) =>
    isNotificationVisibleFor(notification, user?.pegawaiId),
  );
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
          <Button
            variant="outline"
            onClick={() => store.markAllAsRead(user?.pegawaiId)}
          >
            <CheckCheck className="w-4 h-4" /> Tandai Dibaca
          </Button>
          <Button
            variant="ghost"
            onClick={() => store.clearAll(user?.pegawaiId)}
          >
            <Trash2 className="w-4 h-4" /> Bersihkan
          </Button>
        </div>
      </div>
      {!notifications.length ? (
        <EmptyState
          title="Tidak Ada Notifikasi"
          description="Semua notifikasi akan muncul di sini."
          icon={<Bell />}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((x) => (
            <Card
              key={x.id}
              className={cn(
                !x.read && "border-primary/40",
                x.type === "error" && "border-danger/50 bg-danger/10",
              )}
              onClick={() => store.markAsRead(x.id)}
            >
              <div className="flex justify-between gap-4">
                <div className="min-w-0">
                  <h3
                    className={cn(
                      "font-bold text-sm",
                      x.type === "error" && "text-danger",
                    )}
                  >
                    {x.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {x.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {formatTableDateTime(x.createdAt)}
                  </p>
                  {x.actionUrl && (
                    <Link
                      href={x.actionUrl}
                      onClick={() => store.markAsRead(x.id)}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        "mt-3",
                      )}
                    >
                      Buka Dokumen <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
                <Badge
                  variant={
                    x.type === "error" ? "danger" : x.read ? "outline" : "info"
                  }
                >
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
