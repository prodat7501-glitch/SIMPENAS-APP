"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Cloud,
  CloudOff,
  RefreshCw,
  Server,
  Database,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Zap,
  X,
} from "lucide-react";
import { syncService } from "@/services/sync.service";
import { cn } from "@/lib/utils";

export function ConnectionStatus() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState<boolean | null>(null);
  const [latency, setLatency] = useState<number>(0);
  const [dbConnected, setDbConnected] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const checkConnection = useCallback(async () => {
    setLoading(true);
    try {
      const res = await syncService.checkHealth();
      setOnline(res.online);
      setLatency(res.latency);
      setDbConnected(res.dbConnected);
      setLastChecked(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial check and periodic polling every 30s
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const result = await syncService.syncAllLocalToServer();
      if (result.success) {
        setSyncMessage(
          `✅ Berhasil menyinkronkan ${result.totalSynced} data lokal ke server.`,
        );
      } else {
        setSyncMessage(
          `⚠️ Sebagian data tersinkron (${result.totalSynced}), info: ${result.error}`,
        );
      }
    } catch (e) {
      setSyncMessage(
        `❌ Gagal: ${e instanceof Error ? e.message : "Error tidak diketahui"}`,
      );
    } finally {
      setSyncing(false);
    }
  };

  const isServerOnline = online === true;
  const isServerOffline = online === false;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Badge Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Status Koneksi Server Backend"
        title={
          isServerOnline
            ? `Server Online (${latency}ms) - Database Aiven Terhubung`
            : isServerOffline
              ? "Mode Lokal - Server Sedang Tidak Terjangkau"
              : "Memeriksa Status Server..."
        }
        className={cn(
          "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-xs cursor-pointer",
          isServerOnline
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
            : isServerOffline
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
              : "bg-muted text-muted-foreground border-border hover:bg-muted/80",
        )}
      >
        {/* Pulsing Dot */}
        <span className="relative flex h-2 w-2 shrink-0">
          {isServerOnline && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              isServerOnline
                ? "bg-emerald-500"
                : isServerOffline
                  ? "bg-amber-500"
                  : "bg-muted-foreground",
            )}
          />
        </span>

        {/* Icon & Text */}
        {isServerOnline ? (
          <>
            <Cloud className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs">Server Online</span>
          </>
        ) : isServerOffline ? (
          <>
            <CloudOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="text-xs">Mode Lokal</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span className="text-xs">Memeriksa...</span>
          </>
        )}
      </button>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 sm:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="fixed inset-x-3 top-16 sm:absolute sm:right-0 sm:left-auto sm:top-full sm:mt-2 sm:w-96 sm:inset-x-auto rounded-2xl bg-card border border-border shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-bold text-foreground">
                Status Koneksi Backend
              </h4>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  isServerOnline
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                    : isServerOffline
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {isServerOnline
                  ? "Connected"
                  : isServerOffline
                    ? "Offline"
                    : "Checking"}
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground sm:hidden"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Details */}
          <div className="py-3 space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-primary shrink-0" /> Server Backend
              </span>
              <span className="font-semibold text-foreground text-right">
                {isServerOnline ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3 h-3 shrink-0" /> Terhubung ({latency}ms)
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 justify-end">
                    <AlertTriangle className="w-3 h-3 shrink-0" /> Offline / Standby
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-primary shrink-0" /> Database MySQL
              </span>
              <span className="font-semibold text-foreground text-right">
                {dbConnected ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3 h-3 shrink-0" /> Terhubung
                  </span>
                ) : isServerOnline ? (
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3 h-3 shrink-0" /> Siap / Cloud
                  </span>
                ) : (
                  <span className="text-muted-foreground">Otomatis saat Online</span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
              <span>Pemeriksaan terakhir</span>
              <span>
                {lastChecked
                  ? lastChecked.toLocaleTimeString("id-ID")
                  : "-"}
              </span>
            </div>
          </div>

          {/* Sync Result Banner */}
          {syncMessage && (
            <div className="mb-3 p-2 rounded-lg bg-primary/10 border border-primary/20 text-[11px] text-foreground">
              {syncMessage}
            </div>
          )}

          {/* Offline Explanatory Notice */}
          {isServerOffline && (
            <div className="mb-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <Radio className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Data Anda aman tersimpan di browser perangkat ini. Saat server terhubung kembali, klik tombol sinkronisasi di bawah.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={checkConnection}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={cn("w-3.5 h-3.5", loading && "animate-spin")}
              />
              <span>Cek Koneksi</span>
            </button>

            <button
              onClick={handleSync}
              disabled={syncing || !isServerOnline}
              title={
                !isServerOnline
                  ? "Server harus online untuk menyinkronkan data"
                  : undefined
              }
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Zap className={cn("w-3.5 h-3.5", syncing && "animate-bounce")} />
              <span>{syncing ? "Menyinkronkan..." : "Sinkronkan Data"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
