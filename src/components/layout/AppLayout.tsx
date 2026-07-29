"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  User,
  ChevronDown,
  LayoutDashboard,
  Users,
  Building,
  FileText,
  FileCheck,
  Wallet,
  Settings,
  FolderOpen,
  LogOut,
  Map,
  ShieldCheck,
  ClipboardList,
  Sparkles,
  Archive,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  isNotificationVisibleFor,
  useNotificationStore,
} from "@/stores/notification.store";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [masterMenuOpen, setMasterMenuOpen] = useState(false);
  const [transaksiMenuOpen, setTransaksiMenuOpen] = useState(false);
  const [keuanganMenuOpen, setKeuanganMenuOpen] = useState(false);

  const { user, logout, hasPermission } = useAuth();
  const { notifications, markAllAsRead } = useNotificationStore();
  const visibleNotifications = notifications.filter((notification) =>
    isNotificationVisibleFor(notification, user?.pegawaiId),
  );
  const visibleUnreadCount = visibleNotifications.filter(
    (notification) => !notification.read,
  ).length;

  // Avoid hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Open sidebar parent menus automatically if active child exists
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (pathname.startsWith("/master")) setMasterMenuOpen(true);
    if (
      ["/nota-dinas", "/spt", "/sppd", "/laporan"].some((p) =>
        pathname.startsWith(p),
      )
    )
      setTransaksiMenuOpen(true);
    if (
      [
        "/spj",
        "/spby",
        "/daftar-nominatif",
        "/tanda-terima",
        "/kuitansi",
        "/arsip-spj",
      ].some((p) => pathname.startsWith(p))
    )
      setKeuanganMenuOpen(true);
  }, [pathname]);

  // Navigation logic and active matching
  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  // Dynamic Breadcrumb generation
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ name: "SIMPENAS", href: "/dashboard" }];

    let currentHref = "";
    segments.forEach((segment) => {
      currentHref += `/${segment}`;

      let name = segment;
      if (segment === "dashboard") name = "Dashboard";
      else if (segment === "master") name = "Master Data";
      else if (segment === "pegawai") name = "Pegawai";
      else if (segment === "akun-pengguna") name = "Akun Pengguna";
      else if (segment === "jabatan") name = "Jabatan";
      else if (segment === "unit-kerja") name = "Unit Kerja";
      else if (segment === "pangkat") name = "Pangkat & Golongan";
      else if (segment === "dipa") name = "Anggaran DIPA";
      else if (segment === "penandatangan") name = "Pejabat Penandatangan";
      else if (segment === "sbm") name = "Standar Biaya (SBM)";
      else if (segment === "nota-dinas") name = "Nota Dinas";
      else if (segment === "spt") name = "Surat Perintah Tugas (SPT)";
      else if (segment === "sppd") name = "SPPD";
      else if (segment === "laporan") name = "Laporan Perjalanan";
      else if (segment === "spj") name = "Validasi SPJ dan Pembayaran";
      else if (segment === "spby") name = "Surat Perintah Bayar (SPBY)";
      else if (segment === "daftar-nominatif") name = "Daftar Nominatif";
      else if (segment === "tanda-terima") name = "Tanda Terima";
      else if (segment === "kuitansi") name = "Kuitansi";
      else if (segment === "arsip-spj") name = "Arsip SPJ";
      else if (segment === "rekapitulasi") name = "Rekapitulasi";
      else if (segment === "pengaturan") name = "Pengaturan";
      else if (segment === "demo-components") name = "Demo Komponen";

      // Capitalize first letter
      name = name.charAt(0).toUpperCase() + name.slice(1);
      breadcrumbs.push({ name, href: currentHref });
    });

    // Remove redundant root if only dashboard is present
    if (segments.length === 1 && segments[0] === "dashboard") {
      return [
        { name: "SIMPENAS", href: "/dashboard" },
        { name: "Dashboard", href: "/dashboard" },
      ];
    }

    return breadcrumbs;
  };

  // Master Data submenus filter by permission
  const masterSubmenu = [
    {
      name: "Pegawai",
      href: "/master/pegawai",
      icon: Users,
      show: hasPermission("Master Pegawai", "R"),
    },
    {
      name: "Akun Pengguna",
      href: "/master/akun-pengguna",
      icon: UserCog,
      show: hasPermission("Master Akun Pengguna", "R"),
    },
    {
      name: "Jabatan",
      href: "/master/jabatan",
      icon: Users,
      show: hasPermission("Master Jabatan", "R"),
    },
    {
      name: "Unit Kerja",
      href: "/master/unit-kerja",
      icon: Building,
      show: hasPermission("Master Unit Kerja", "R"),
    },
    {
      name: "Pangkat/Golongan",
      href: "/master/pangkat",
      icon: FileCheck,
      show: hasPermission("Master Pangkat/Golongan", "R"),
    },
    {
      name: "Anggaran DIPA",
      href: "/master/dipa",
      icon: Wallet,
      show: hasPermission("Master Anggaran DIPA", "R"),
    },
    {
      name: "Pejabat Penandatangan",
      href: "/master/penandatangan",
      icon: FileText,
      show: hasPermission("Master Pejabat Penandatangan", "R"),
    },
    {
      name: "Standar Biaya (SBM)",
      href: "/master/sbm",
      icon: ClipboardList,
      show: hasPermission("Master Standar Biaya Masukan", "R"),
    },
  ].filter((item) => item.show);

  // Transaksi submenus filter by permission
  const transaksiSubmenu = [
    {
      name: "Nota Dinas",
      href: "/nota-dinas",
      icon: FileText,
      show: hasPermission("Nota Dinas", "R"),
    },
    {
      name: "Surat Perintah Tugas (SPT)",
      href: "/spt",
      icon: FileCheck,
      show: hasPermission("SPT", "R"),
    },
    {
      name: "SPPD",
      href: "/sppd",
      icon: Map,
      show: hasPermission("SPPD", "R"),
    },
    {
      name: "Laporan Perjalanan",
      href: "/laporan",
      icon: FolderOpen,
      show: hasPermission("Laporan Perjalanan Dinas", "R"),
    },
    {
      name: "Approval SPT dan Nota Dinas",
      href: "/approval",
      icon: ShieldCheck,
      show: hasPermission("Approval", "R"),
    },
  ].filter((item) => item.show);

  // Keuangan submenus filter by permission
  const keuanganSubmenu = [
    {
      name: "Validasi SPJ dan Pembayaran",
      href: "/spj",
      icon: ShieldCheck,
      show: hasPermission("Validasi SPJ dan Pembayaran", "R"),
    },
    {
      name: "Surat Perintah Bayar (SPBY)",
      href: "/spby",
      icon: Wallet,
      show: hasPermission("SPBY", "R"),
    },
    {
      name: "Daftar Nominatif",
      href: "/daftar-nominatif",
      icon: FileText,
      show: hasPermission("Daftar Nominatif", "R"),
    },
    {
      name: "Tanda Terima",
      href: "/tanda-terima",
      icon: FileText,
      show: hasPermission("Tanda Terima", "R"),
    },
    {
      name: "Kuitansi",
      href: "/kuitansi",
      icon: FileText,
      show: hasPermission("Kuitansi", "R"),
    },
    {
      name: "Arsip SPJ",
      href: "/arsip-spj",
      icon: Archive,
      show: hasPermission("Arsip SPJ", "R"),
    },
  ].filter((item) => item.show);

  // General modules permission mapping
  const showMaster = masterSubmenu.length > 0;
  const showTransaksi = transaksiSubmenu.length > 0;
  const showKeuangan = keuanganSubmenu.length > 0;
  const showRekap = hasPermission("Rekapitulasi", "R");
  const showPengaturan = hasPermission("Pengaturan Penomoran", "R");

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground transition-colors duration-200">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Lewati ke konten utama
      </a>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Sidebar Brand Header */}
        <div className="flex min-h-24 items-center justify-between gap-2 border-b border-sidebar-border px-4 py-3">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5">
            <Image
              src="/images/logo-kpu.png"
              alt="Logo Komisi Pemilihan Umum"
              width={40}
              height={40}
              priority
              className="h-10 w-10 shrink-0 object-contain"
            />
            <span className="min-w-0 leading-none">
              <span className="block text-lg font-black tracking-tight text-primary">
                SIMPENAS
              </span>
              <span className="mt-1 block whitespace-nowrap text-[8px] font-bold leading-tight tracking-tight text-sidebar-foreground/80">
                Sistem Informasi Manajemen Perjalanan Dinas
              </span>
              <span className="mt-1 block text-[9px] font-bold leading-tight text-sidebar-foreground/70">
                KPU Kabupaten Gorontalo
              </span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Content Links */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
          {/* Dashboard URL */}
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all",
              isActive("/dashboard")
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          {/* Master Submenu Group */}
          {showMaster && (
            <div>
              <button
                onClick={() => setMasterMenuOpen(!masterMenuOpen)}
                aria-expanded={masterMenuOpen}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-semibold text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5" />
                  <span>Master Data</span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    masterMenuOpen && "rotate-180",
                  )}
                />
              </button>
              {masterMenuOpen && (
                <div className="mt-1 ml-4 pl-4 border-l border-sidebar-border space-y-1">
                  {masterSubmenu.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium transition-all",
                        isActive(sub.href)
                          ? "bg-sidebar-accent text-primary font-semibold"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                      )}
                    >
                      <sub.icon className="w-4 h-4" />
                      <span>{sub.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Transaksi Submenu Group */}
          {showTransaksi && (
            <div>
              <button
                onClick={() => setTransaksiMenuOpen(!transaksiMenuOpen)}
                aria-expanded={transaksiMenuOpen}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-semibold text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <span>Perjalanan Dinas</span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    transaksiMenuOpen && "rotate-180",
                  )}
                />
              </button>
              {transaksiMenuOpen && (
                <div className="mt-1 ml-4 pl-4 border-l border-sidebar-border space-y-1">
                  {transaksiSubmenu.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium transition-all",
                        isActive(sub.href)
                          ? "bg-sidebar-accent text-primary font-semibold"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                      )}
                    >
                      <sub.icon className="w-4 h-4" />
                      <span>{sub.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Keuangan Submenu Group */}
          {showKeuangan && (
            <div>
              <button
                onClick={() => setKeuanganMenuOpen(!keuanganMenuOpen)}
                aria-expanded={keuanganMenuOpen}
                className="flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-semibold text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5" />
                  <span>Administrasi Keuangan</span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    keuanganMenuOpen && "rotate-180",
                  )}
                />
              </button>
              {keuanganMenuOpen && (
                <div className="mt-1 ml-4 pl-4 border-l border-sidebar-border space-y-1">
                  {keuanganSubmenu.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium transition-all",
                        isActive(sub.href)
                          ? "bg-sidebar-accent text-primary font-semibold"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                      )}
                    >
                      <sub.icon className="w-4 h-4" />
                      <span>{sub.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* General Links */}
          {showRekap && (
            <Link
              href="/rekapitulasi"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all",
                isActive("/rekapitulasi")
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <BarChart3Icon className="w-5 h-5" />
              <span>Rekapitulasi</span>
            </Link>
          )}

          {showPengaturan && (
            <Link
              href="/pengaturan"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all",
                isActive("/pengaturan")
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Settings className="w-5 h-5" />
              <span>Pengaturan</span>
            </Link>
          )}

          {hasPermission("Manajemen Dokumen", "R") && (
            <Link
              href="/dokumen"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all",
                isActive("/dokumen")
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent",
              )}
            >
              <FolderOpen className="w-5 h-5" />
              <span>Manajemen Dokumen</span>
            </Link>
          )}
          {hasPermission("Notifikasi", "R") && (
            <Link
              href="/notifikasi"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all",
                isActive("/notifikasi")
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent",
              )}
            >
              <Bell className="w-5 h-5" />
              <span>Notifikasi</span>
            </Link>
          )}
          {hasPermission("Log Aktivitas", "R") && (
            <Link
              href="/log-aktivitas"
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all",
                isActive("/log-aktivitas")
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent",
              )}
            >
              <ClipboardList className="w-5 h-5" />
              <span>Log Aktivitas</span>
            </Link>
          )}

          {/* Demo Components Gallery Link */}
          <Link
            href="/demo-components"
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all",
              isActive("/demo-components")
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Sparkles className="w-5 h-5" />
            <span>Demo Komponen</span>
          </Link>
        </nav>

        {/* Sidebar User Footer */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-extrabold text-sm">
              {user?.name.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">
                {user?.name || "Nama Pengguna"}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user?.role || "Role Hak Akses"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Topbar */}
        <header className="flex items-center justify-between h-16 px-6 bg-card border-b border-border shadow-sm">
          <div className="flex items-center gap-4">
            {/* Sidebar toggle button */}
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka navigasi"
              className="p-1 rounded-md hover:bg-muted text-foreground lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Dynamic Breadcrumbs */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              {getBreadcrumbs().map((b, idx, arr) => (
                <React.Fragment key={b.href + idx}>
                  <Link
                    href={b.href}
                    className={cn(
                      "hover:text-foreground transition-colors",
                      idx === arr.length - 1 && "text-foreground font-bold",
                    )}
                  >
                    {b.name}
                  </Link>
                  {idx < arr.length - 1 && (
                    <span className="text-[10px] text-border">/</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Dark mode toggler */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-muted text-foreground transition-colors"
                title="Toggle Theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            )}

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setUserDropdownOpen(false);
                  if (!notifDropdownOpen) {
                    markAllAsRead(user?.pegawaiId);
                  }
                }}
                aria-label={
                  visibleUnreadCount > 0
                    ? `Notifikasi, ${visibleUnreadCount} belum dibaca`
                    : "Notifikasi"
                }
                aria-expanded={notifDropdownOpen}
                title={
                  visibleUnreadCount > 0
                    ? `${visibleUnreadCount} notifikasi belum dibaca`
                    : "Tidak ada notifikasi baru"
                }
                className={cn(
                  "relative rounded-xl p-2 transition-all duration-200",
                  visibleUnreadCount > 0
                    ? "bg-danger/10 text-danger ring-2 ring-danger/50 shadow-lg shadow-danger/20 hover:bg-danger/20"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {visibleUnreadCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-xl border border-danger/60 animate-ping"
                  />
                )}
                <Bell
                  className={cn(
                    "relative h-5 w-5",
                    visibleUnreadCount > 0 && "fill-danger/20",
                  )}
                />
                {visibleUnreadCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-card bg-danger px-1 text-[9px] font-black leading-none text-white">
                    {visibleUnreadCount > 99 ? "99+" : visibleUnreadCount}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 py-2">
                  <div className="px-4 py-2 border-b border-border font-bold text-sm">
                    Notifikasi Terbaru
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {visibleNotifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                        Tidak ada notifikasi baru
                      </div>
                    ) : (
                      visibleNotifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.actionUrl ?? "/notifikasi"}
                          onClick={() => setNotifDropdownOpen(false)}
                          className={cn(
                            "block border-b border-border/50 px-4 py-3 text-xs hover:bg-muted",
                            n.type === "error" &&
                              "border-l-4 border-l-danger bg-danger/10 hover:bg-danger/15",
                          )}
                        >
                          <p
                            className={cn(
                              "font-semibold text-primary",
                              n.type === "error" && "text-danger",
                            )}
                          >
                            {n.title}
                          </p>
                          <p className="text-muted-foreground mt-1">
                            {n.message}
                          </p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotifDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name.charAt(0) || "U"}
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 py-2">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-bold">
                      {user?.name || "Nama User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email || "email@kpu.go.id"}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      <User className="w-4 h-4" /> Profil Saya
                    </Link>
                  </div>
                  <div className="border-t border-border py-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger hover:bg-muted text-left"
                    >
                      <LogOut className="w-4 h-4" /> Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-3 sm:p-4 lg:p-6"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

// Helper SVG Icon for chart mapping
function BarChart3Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}
