"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "./AuthGuard";
import { useHotel } from "../context/HotelContext";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  children: React.ReactNode;
};

type HeaderState = {
  title: string;
  subtitle?: string | null;
};

type HeaderContextValue = {
  setHeader: (value: HeaderState) => void;
};

const HeaderContext = createContext<HeaderContextValue | null>(null);

export function usePageHeader(title: string, subtitle?: string | null) {
  const ctx = useContext(HeaderContext);

  const headerValue = useMemo(
    () => ({ title, subtitle: subtitle ?? null }),
    [title, subtitle]
  );

  useEffect(() => {
    if (!ctx) return;
    ctx.setHeader(headerValue);
  }, [ctx, headerValue]);
}

/* ─── Klinik menüsü – SUPER_ADMIN navigasyonu ─── */
function SuperAdminNav({
  linkClass,
  onNav,
}: {
  linkClass: (href: string) => string;
  onNav?: () => void;
}) {
  const handleClick = () => {
    if (onNav) onNav();
  };

  return (
    <>
      <div className="px-2 pt-3 pb-1">
        <span className="text-[10px] uppercase tracking-widest font-semibold text-teal-300/80">
          Platform
        </span>
      </div>
      <Link href="/platform/hotels" onClick={handleClick} className={linkClass("/platform/hotels")}>
        <span>Otel Yönetimi</span>
      </Link>
    </>
  );
}

/* ─── Normal klinik menüsü ─── */
function ClinicNav({
  linkClass,
  onNav,
  slug,
  isAdmin,
}: {
  linkClass: (href: string) => string;
  onNav?: () => void;
  slug: string;
  isAdmin: boolean;
}) {
  const base = `/${slug}`;

  const handleClick = () => {
    if (onNav) onNav();
  };

  const Divider = () => (
    <div className="h-px mx-2 rounded-full bg-gradient-to-r from-teal-800/70 via-teal-700/70 to-emerald-500/70" />
  );

  return (
    <>
      {/* 1. Dashboard */}
      <Link id="tour-dashboard" href={base} className={linkClass(base)} onClick={handleClick}>
        <span>Dashboard</span>
      </Link>
      <Divider />
      {/* 2. Rezervasyonlar */}
      <Link href={`${base}/reservations`} className={linkClass(`${base}/reservations`)} onClick={handleClick}>
        <span>Rezervasyonlar</span>
      </Link>
      <Divider />
      {/* 3. Booking Board */}
      <Link href={`${base}/booking`} className={linkClass(`${base}/booking`)} onClick={handleClick}>
        <span>Booking Board</span>
      </Link>
      <Divider />
      {/* 4. Misafirler */}
      <Link id="tour-guests" href={`${base}/guests`} className={linkClass(`${base}/guests`)} onClick={handleClick}>
        <span>Misafirler</span>
      </Link>
      <Divider />
      {/* 5. Kat Hizmetleri */}
      <Link href={`${base}/housekeeping`} className={linkClass(`${base}/housekeeping`)} onClick={handleClick}>
        <span>Kat Hizmetleri</span>
      </Link>
      <Divider />
      {/* 6. Folyo & Ödemeler */}
      <Link id="tour-payment-management" href={`${base}/payment-management`} className={linkClass(`${base}/payment-management`)} onClick={handleClick}>
        <span>Folyo & Ödemeler</span>
      </Link>
      <Divider />
      {/* 7. Raporlar */}
      <Link id="tour-reports" href={`${base}/reports`} className={linkClass(`${base}/reports`)} onClick={handleClick}>
        <span>Raporlar</span>
      </Link>
      <Divider />
      {/* 8. Ekip & Yetkiler */}
      <Link href={`${base}/admin/users`} className={linkClass(`${base}/admin/users`)} onClick={handleClick}>
        <span>Ekip & Yetkiler</span>
      </Link>
      {/* 9. Abonelik (sadece admin) */}
      {isAdmin && (
        <>
          <Divider />
          <Link id="tour-subscription" href={`${base}/admin/subscription`} className={linkClass(`${base}/admin/subscription`)} onClick={handleClick}>
            <span>Abonelik</span>
          </Link>
        </>
      )}
    </>
  );
}

function ShellInner({ children }: Props) {
  const hotel = useHotel();
  const pathname = usePathname();
  const router = useRouter();
  const [headerTitle, setHeaderTitle] = useState<string>("Otel Paneli");
  const [headerSubtitle, setHeaderSubtitle] = useState<string | null>(
    "Rezervasyon, misafir ve oda yönetimi"
  );
  // Mobil menü animasyon state'i: "closed" | "opening" | "open" | "closing"
  const [mobileNavState, setMobileNavState] = useState<"closed" | "opening" | "open" | "closing">("closed");
  const mobileNavOpen = mobileNavState === "open" || mobileNavState === "opening";
  const mobileMenuTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMobileNav = useCallback(() => {
    if (mobileMenuTimerRef.current) clearTimeout(mobileMenuTimerRef.current);
    setMobileNavState("opening");
    // requestAnimationFrame ile CSS transition tetikle
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setMobileNavState("open"));
    });
  }, []);

  const closeMobileNav = useCallback(() => {
    if (mobileMenuTimerRef.current) clearTimeout(mobileMenuTimerRef.current);
    setMobileNavState("closing");
    mobileMenuTimerRef.current = setTimeout(() => setMobileNavState("closed"), 300);
  }, []);

  const toggleMobileNav = useCallback(() => {
    if (mobileNavState === "closed" || mobileNavState === "closing") {
      openMobileNav();
    } else {
      closeMobileNav();
    }
  }, [mobileNavState, openMobileNav, closeMobileNav]);

  // Cleanup
  useEffect(() => {
    return () => { if (mobileMenuTimerRef.current) clearTimeout(mobileMenuTimerRef.current); };
  }, []);

  const displayName = hotel.userName || hotel.userEmail || "Kullanıcı";
  const displayRole = hotel.userRole || null;
  const brandName = hotel.isSuperAdmin
    ? "NextGency"
    : hotel.hotelName || "Otel Paneli";
  const brandSubtitle = hotel.isSuperAdmin
    ? "Otel & Tesis Platform Yönetim Paneli"
    : "Yönetim Paneli";
  const brandInitials = hotel.isSuperAdmin
    ? "NG"
    : (hotel.hotelName || "KP")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
  const userInitials = (displayName || "K")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  const ROLE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    SUPER_ADMIN: { bg: "bg-gradient-to-r from-violet-500 to-purple-500", text: "text-white", label: "Super Admin" },
    ADMIN: { bg: "bg-gradient-to-r from-indigo-500 to-blue-500", text: "text-white", label: "Otel Müdürü" },
    DOCTOR: { bg: "bg-gradient-to-r from-sky-500 to-cyan-500", text: "text-white", label: "Personel" },
    RECEPTION: { bg: "bg-gradient-to-r from-amber-400 to-orange-400", text: "text-white", label: "Resepsiyon" },
    FINANCE: { bg: "bg-gradient-to-r from-emerald-400 to-green-400", text: "text-white", label: "Finans" },
  };
  const roleStyle = displayRole ? ROLE_STYLES[displayRole] || { bg: "bg-slate-100", text: "text-slate-600", label: displayRole } : null;

  const homeHref = hotel.isSuperAdmin ? "/platform/hotels" : `/${hotel.hotelSlug || ""}`;
  const isOnHome = pathname === homeHref || pathname === homeHref + "/";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  // Sayfaya göre üst bar başlığı
  // Slug bazlı yolları da destekle: /{slug}/appointments gibi
  useEffect(() => {
    // Slug'ı pathname'den çıkar: /slug/subpath → subpath
    const slug = hotel.hotelSlug;
    const subPath = slug && pathname.startsWith(`/${slug}`)
      ? pathname.slice(`/${slug}`.length) || "/"
      : pathname;

    switch (true) {
      case subPath === "/":
        setHeaderTitle("Dashboard");
        setHeaderSubtitle(
          "Bugünkü giriş/çıkışlar, doluluk oranı, oda durumu ve finansal özet."
        );
        break;
      case subPath === "/reservation-management":
        setHeaderTitle("Rezervasyon Yönetimi");
        setHeaderSubtitle(
          "İstediğiniz tarih aralığında rezervasyonları listeleyin, ekleyin ve düzenleyin."
        );
        break;
      case subPath === "/payment-management":
        setHeaderTitle("Folyo & Ödemeler");
        setHeaderSubtitle(
          "Odalara ait harcama folyolarını ve ödeme geçmişini yönetin."
        );
        break;
      case subPath === "/guests":
        setHeaderTitle("Misafirler");
        setHeaderSubtitle(
          "Tesiste konaklamış veya konaklayan tüm misafirlerin profil veritabanı."
        );
        break;
      case subPath === "/booking":
        setHeaderTitle("Booking Board");
        setHeaderSubtitle(
          "Rezervasyonları yatay eksende oda durumları ile birlikte görün."
        );
        break;
      case subPath === "/reservations":
        setHeaderTitle("Rezervasyonlar");
        setHeaderSubtitle(
          "Tüm rezervasyonları görüntüleyin, filtreleyin ve yönetin."
        );
        break;
      case subPath === "/housekeeping":
        setHeaderTitle("Kat Hizmetleri");
        setHeaderSubtitle(
          "Oda temizlik durumlarını ve acil görevleri anlık takip edin."
        );
        break;
      case subPath === "/reports":
        setHeaderTitle("Raporlar");
        setHeaderSubtitle(
          "ADR, RevPAR, doluluk ve finansal otel metrikleri."
        );
        break;
      case subPath === "/admin/users":
        setHeaderTitle("Ekip & Yetkiler");
        setHeaderSubtitle(
          "Resepsiyon, temizlik ve finans ekibini yönetin."
        );
        break;
      case subPath === "/admin/subscription":
        setHeaderTitle("Abonelik");
        setHeaderSubtitle(
          "Plan, fatura ve kullanım detaylarınızı yönetin."
        );
        break;
      case pathname === "/platform/hotels":
        setHeaderTitle("Tesis/Otel Yönetimi");
        setHeaderSubtitle(
          "Sisteme kayıtlı otelleri yönetin, yeni tesis ekleyin."
        );
        break;
      default:
        setHeaderTitle("Otel Paneli");
        setHeaderSubtitle("Rezervasyon, misafir ve oda yönetimi");
        break;
    }
  }, [pathname, hotel.hotelSlug]);

  const isActive = (href: string) => {
    return pathname === href || pathname === href + "/";
  };

  const linkClass = (href: string) =>
    [
      "flex items-center gap-2 px-3.5 py-2.5 text-[13px] font-medium rounded-xl transition-all",
      isActive(href)
        ? "bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-500 text-white shadow-sm"
        : "text-slate-700 bg-white/60 hover:bg-white hover:text-teal-900 hover:shadow-sm hover:ring-1 hover:ring-teal-100",
    ].join(" ");

  return (
    <div className="min-h-screen flex w-full">
      <aside className="hidden md:flex w-64 flex-col border-r bg-white h-screen sticky top-0">
        <Link
          href={homeHref}
          className={`h-20 flex items-center px-5 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-500 border-b border-teal-800 shadow-md rounded-br-2xl transition-opacity hover:opacity-95 active:opacity-90 ${isOnHome ? "cursor-default" : "cursor-pointer"}`}
        >
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/25 flex items-center justify-center text-[11px] font-semibold uppercase text-white">
              {brandInitials}
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight text-white">
                {brandName}
              </span>
              <span className="text-[11px] text-teal-50/90 leading-tight">
                {brandSubtitle}
              </span>
            </div>
          </div>
        </Link>
        <nav className="flex-1 px-4 py-4 text-sm flex flex-col min-h-0">
          <div className="space-y-1.5 flex-1 overflow-y-auto">
            {hotel.isSuperAdmin ? (
              <SuperAdminNav linkClass={linkClass} />
            ) : (
              <ClinicNav linkClass={linkClass} slug={hotel.hotelSlug || ""} isAdmin={hotel.isAdmin} />
            )}
          </div>
          <div className="mt-auto pt-4 pb-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white px-3.5 py-2.5 text-[13px] font-semibold shadow-md hover:shadow-lg hover:from-red-700 hover:via-red-600 hover:to-rose-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg
                className="h-4 w-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Çıkış Yap</span>
            </button>
          </div>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="border-b bg-white relative z-20">
          {/* Marka satırı – sadece mobilde */}
          <div className="relative bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-500 px-4 md:px-6 py-3 flex items-center justify-between md:hidden z-[1002]">
            <Link
              href={homeHref}
              className={`flex items-center gap-3 min-w-0 flex-1 mr-2 transition-opacity hover:opacity-90 active:opacity-80 ${isOnHome ? "cursor-default" : "cursor-pointer"}`}
            >
              <div className="h-9 w-9 shrink-0 rounded-xl bg-white/10 border border-white/25 flex items-center justify-center text-[11px] font-semibold uppercase text-white">
                {brandInitials}
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-sm font-semibold tracking-tight text-white truncate">
                  {brandName}
                </span>
                <span className="text-[11px] text-teal-50/90 leading-tight">{brandSubtitle}</span>
              </div>
            </Link>
            <button
              type="button"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 active:scale-90"
              onClick={toggleMobileNav}
            >
              <span className="sr-only">{mobileNavOpen ? "Menüyü kapat" : "Menüyü aç"}</span>
              <span className="relative flex h-4 w-5 flex-col items-center justify-center">
                <span className={["absolute block h-[2px] w-5 rounded-full bg-white transition-all duration-300 ease-out", mobileNavState === "open" || mobileNavState === "closing" ? "rotate-45 translate-y-0" : "-translate-y-[5px]"].join(" ")} />
                <span className={["absolute block h-[2px] w-5 rounded-full bg-white transition-all duration-200", mobileNavState === "open" || mobileNavState === "closing" ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"].join(" ")} />
                <span className={["absolute block h-[2px] w-5 rounded-full bg-white transition-all duration-300 ease-out", mobileNavState === "open" || mobileNavState === "closing" ? "-rotate-45 translate-y-0" : "translate-y-[5px]"].join(" ")} />
              </span>
            </button>
          </div>

          {/* Sayfa başlığı satırı */}
          <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3 md:gap-4 border-t border-slate-100 bg-gradient-to-r from-white via-white to-slate-50/80">
            <div className="flex items-center gap-3 md:gap-3.5 min-w-0 flex-1">
              <div className="hidden md:flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200/80 shadow-sm">
                <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight truncate">
                  {headerTitle}
                </h1>
                {headerSubtitle && (
                  <p className="hidden md:block text-[11px] text-slate-400 mt-0.5 truncate leading-relaxed">
                    {headerSubtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Desktop sağ blok: kullanıcı kartı */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white pl-1.5 pr-4 py-1.5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-[11px] font-bold text-white tracking-wider shadow-sm">
                  {userInitials}
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-xs font-semibold text-slate-800">
                    {displayName ?? "Kullanıcı"}
                  </span>
                  {roleStyle && (
                    <span className={`inline-flex items-center mt-0.5 rounded-full px-2 py-[1px] text-[9px] font-semibold tracking-wide ${roleStyle.bg} ${roleStyle.text} shadow-sm`}>
                      {roleStyle.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 bg-slate-50 px-4 py-4 md:px-6 md:py-6 min-w-0 overflow-x-hidden">
          <HeaderContext.Provider
            value={{
              setHeader: ({ title, subtitle }) => {
                setHeaderTitle(title);
                setHeaderSubtitle(subtitle ?? null);
              },
            }}
          >
            {children}
          </HeaderContext.Provider>
        </div>
      </main>

      {/* Mobile Menu - Moved outside main to escape stacking context */}
      {mobileNavState !== "closed" && (
        <>
          <div
            className={["fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden", mobileNavState === "open" ? "opacity-100" : "opacity-0"].join(" ")}
            onClick={closeMobileNav}
          />
          <div
            className={[
              "fixed inset-x-0 top-0 z-[10001] md:hidden transition-all duration-300 ease-out",
              mobileNavState === "open" ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
            ].join(" ")}
          >
            <div className="bg-white rounded-b-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Menu Header */}
              <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-500 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/25 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {brandInitials}
                  </div>
                  <div className="flex flex-col leading-tight min-w-0">
                    <span className="text-sm font-bold text-white truncate">{brandName}</span>
                    <span className="text-[11px] text-teal-50/80 leading-tight">{brandSubtitle}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeMobileNav}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-all duration-200 active:scale-90"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="px-4 py-4 space-y-1.5">
                {hotel.isSuperAdmin ? (
                  <SuperAdminNav linkClass={linkClass} onNav={closeMobileNav} />
                ) : (
                  <ClinicNav
                    linkClass={linkClass}
                    onNav={closeMobileNav}
                    slug={hotel.hotelSlug || ""}
                    isAdmin={hotel.isAdmin}
                  />
                )}
              </nav>

              {/* Footer Section */}
              <div className="px-6 pb-6 mt-2">
                <div className="h-px w-full bg-slate-100 mb-4" />
                <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 mb-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-sm">
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
                    {roleStyle && (
                      <span className={`inline-flex items-center mt-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${roleStyle.bg} ${roleStyle.text}`}>
                        {roleStyle.label}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => { await handleLogout(); closeMobileNav(); }}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl bg-rose-600 text-white px-4 py-3 text-sm font-bold shadow-lg shadow-rose-100 transition-all active:scale-[0.98]"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function AppShell({ children }: Props) {
  const pathname = usePathname();

  // Login ve root yönlendirme sayfaları çerçevesiz
  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <AuthGuard>
      <ShellInner>{children}</ShellInner>
    </AuthGuard>
  );
}
