"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { HotelContext, type HotelContextValue } from "../context/HotelContext";
import { UserRole } from "@/types/database";
import type { WorkingHours } from "@/types/database";
import { SYSTEM_AUTOMATIONS, type ClinicAutomation } from "@/constants/automations";
import { DEFAULT_WORKING_HOURS } from "@/constants/days";

type Props = {
  children: React.ReactNode;
};

type LoadingStep = "auth" | "user" | "clinic" | "finishing" | "ready";

const STEP_LABELS: Record<LoadingStep, string> = {
  auth: "Oturum doğrulanıyor...",
  user: "Kullanıcı bilgileri yükleniyor...",
  clinic: "Otel verileri hazırlanıyor...",
  finishing: "Son kontroller yapılıyor...",
  ready: "Panel hazırlanıyor...",
};

function LoadingScreen({ step }: { step: LoadingStep }) {
  const steps: LoadingStep[] = ["auth", "user", "clinic", "finishing", "ready"];
  const currentIndex = steps.indexOf(step);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50/30">
      <div className="flex flex-col items-center gap-6 px-6">
        {/* Logo / Spinner */}
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          {/* Dönen halka */}
          <div className="absolute -inset-2">
            <div className="h-20 w-20 rounded-2xl border-2 border-teal-200/50 border-t-teal-500 animate-spin" style={{ animationDuration: "1.5s" }} />
          </div>
        </div>

        {/* Başlık */}
        <div className="text-center">
          <h2 className="text-sm font-semibold text-slate-900">Otel Yönetim Paneli</h2>
          <p className="mt-0.5 text-xs text-slate-500">Panele erişim kontrol ediliyor</p>
        </div>

        {/* Aşamalar */}
        <div className="w-64 space-y-2">
          {steps.map((s, i) => {
            const isDone = i < currentIndex;
            const isCurrent = i === currentIndex;
            return (
              <div key={s} className="flex items-center gap-3">
                {/* İkon */}
                <div className={[
                  "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300",
                  isDone ? "bg-emerald-100" : isCurrent ? "bg-teal-100" : "bg-slate-100",
                ].join(" ")}>
                  {isDone ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isCurrent ? (
                    <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-slate-300" />
                  )}
                </div>
                {/* Label */}
                <span className={[
                  "text-xs transition-all duration-300",
                  isDone ? "text-emerald-600 font-medium" : isCurrent ? "text-teal-700 font-medium" : "text-slate-400",
                ].join(" ")}>
                  {STEP_LABELS[s]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function AuthGuard({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>("auth");
  const automationsRef = useRef<ClinicAutomation[]>([]);
  const [clinicCtx, setClinicCtx] = useState<HotelContextValue>({
    hotelId: null,
    hotelName: null,
    hotelSlug: null,
    userRole: null,
    isSuperAdmin: false,
    isAdmin: false,
    userId: null,
    userName: null,
    userEmail: null,
    department: null,
    isActive: true,
    financialLimit: null,
    workingHours: DEFAULT_WORKING_HOURS,
    workingHoursOverrides: [],
    planId: null,
    credits: 0,
    trialEndsAt: null,
    automationsEnabled: false,
    n8nWorkflowId: null,
    n8nWorkflows: [],
    defaultCurrency: "TRY",
  });

  // Sayfa değiştiğinde yükleme ekranını otomatik kapat
  useEffect(() => {
    if (allowed && clinicCtx.userId) {
      setChecking(false);
    }
  }, [pathname, allowed, clinicCtx.userId]);

  // 1. Aşama: Veri Getirme ve Güvenlik Kontrolü (Sadece Başlangıçta veya Oturum Değiştiğinde)
  useEffect(() => {
    const initAuth = async () => {
      setLoadingStep("auth");
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        if (pathname !== "/") router.replace("/");
        setChecking(false);
        return;
      }

      // Veriler zaten varsa (refresh değilse) ve kullanıcı aynıysa tekrar çekme
      if (clinicCtx.userId === user.id) {
        setChecking(false);
        setAllowed(true);
        return;
      }

      try {
        setLoadingStep("user");
        // 1. users tablosundan yetkiyi al
        const { data: dbUser, error: userError } = await supabase
          .from("users")
          .select("role, hotel_id, full_name, department, is_active, financial_limit")
          .eq("id", user.id)
          .limit(1)
          .single();

        if (userError || !dbUser) {
          await supabase.auth.signOut();
          router.replace("/?error=unauthorized");
          return;
        }

        const role = dbUser.role as UserRole;
        const hotelId = dbUser.hotel_id;
        const isSuperAdmin = role === UserRole.SUPER_ADMIN;
        const isAdminRole = isSuperAdmin || role === UserRole.ADMIN;

        // 2. İşletme Bilgilerini Çekme (hotel_id varsa)
        if (hotelId) {
          setLoadingStep("clinic");
          const [hotelRes, autoRes] = await Promise.all([
            supabase
              .from("hotels")
              .select("id, name, slug, is_active, working_hours, working_hours_overrides, plan_id, credits, trial_ends_at, automations_enabled, n8n_workflow_id, default_currency")
              .eq("id", hotelId)
              .maybeSingle(),
            supabase
              .from("hotel_automations")
              .select("*")
              .eq("hotel_id", hotelId)
          ]);

          if (hotelRes.error || !hotelRes.data || !hotelRes.data.is_active) {
            await supabase.auth.signOut();
            router.replace(hotelRes.data?.is_active === false ? "/?error=inactive" : "/?error=unauthorized");
            return;
          }
          const hotelData = hotelRes.data;

          if (!autoRes.error && autoRes.data) {
            automationsRef.current = autoRes.data.map(a => ({
              id: a.automation_id,
              name: SYSTEM_AUTOMATIONS.find(s => s.id === a.automation_id)?.name || a.automation_id,
              visible: a.is_visible,
              enabled: a.is_enabled,
              time: a.schedule_time ? a.schedule_time.substring(0, 5) : "09:00",
              day: a.schedule_day
            }));
          }

          setClinicCtx(prev => ({
            ...prev,
            hotelId: hotelData.id,
            hotelName: hotelData.name,
            hotelSlug: hotelData.slug,
            userRole: role,
            isSuperAdmin,
            isAdmin: isAdminRole,
            userId: user.id,
            userName: dbUser.full_name || null,
            userEmail: user.email || "",
            department: dbUser.department || null,
            isActive: dbUser.is_active ?? true,
            financialLimit: dbUser.financial_limit || null,
            workingHours: (hotelData.working_hours as WorkingHours) || DEFAULT_WORKING_HOURS,
            workingHoursOverrides: hotelData.working_hours_overrides || [],
            planId: hotelData.plan_id || null,
            credits: hotelData.credits || 0,
            trialEndsAt: hotelData.trial_ends_at || null,
            automationsEnabled: hotelData.automations_enabled || false,
            n8nWorkflowId: hotelData.n8n_workflow_id || null,
            n8nWorkflows: automationsRef.current,
            defaultCurrency: hotelData.default_currency || 'TRY',
          }));
        } else if (isSuperAdmin) {
          // SUPER_ADMIN için otel verisi çekmeye gerek yok
          setClinicCtx(prev => ({
            ...prev,
            userRole: role,
            isSuperAdmin: true,
            isAdmin: true,
            userId: user.id,
            userName: dbUser.full_name || null,
            userEmail: user.email || "",
            department: "Sistem Yönetimi",
            isActive: true,
            financialLimit: null,
          }));
        } else {
          // hotel_id yok ve super admin değilse yetkisizdir
          await supabase.auth.signOut();
          router.replace("/?error=unauthorized");
          return;
        }

        // 3. Oturum Kaydı (Herkes için) - DEMO İÇİN DEVRE DIŞI
        /*
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { error: upsertError } = await supabase.from("active_sessions").upsert({
            user_id: user.id,
            session_id: session.access_token,
            created_at: new Date().toISOString(),
          }, { onConflict: 'user_id, session_id' });

          if (!upsertError) {
            const { data: sessions } = await supabase
              .from("active_sessions")
              .select("id")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false });

            if (sessions && sessions.length > 2) {
              const sessionsToDelete = sessions.slice(2).map(s => s.id);
              await supabase.from("active_sessions").delete().in("id", sessionsToDelete);
            }
          }
        }
        */

        setLoadingStep("ready");
        setAllowed(true);
      } catch (err) {
        console.error("AuthGuard initialization error:", err);
      } finally {
        setChecking(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Sadece mount anında çalışır

  // 2. Aşama: URL ve Slug Kontrolü (Sayfa geçişlerinde çalışır, veritabanına gitmez)
  useEffect(() => {
    if (!allowed) return;

    if (pathname !== "/") {
      if (!clinicCtx.isSuperAdmin && clinicCtx.hotelSlug) {
        const urlSlug = pathname.split("/")[1];
        if (urlSlug !== clinicCtx.hotelSlug) {
          router.replace(`/${clinicCtx.hotelSlug}`);
        }
      } else if (clinicCtx.isSuperAdmin) {
        if (!pathname.startsWith("/platform")) {
          router.replace("/platform/hotels");
        }
      }
    }
  }, [pathname, allowed, clinicCtx.hotelSlug, clinicCtx.isSuperAdmin, router]);

  // 3. Aşama: Oturum Geçerlilik Kontrolü (Arka Planda) - DEMO İÇİN DEVRE DIŞI
  /*
  useEffect(() => {
    if (!allowed) return;

    const intervalId = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: exists, error } = await supabase
        .from("active_sessions")
        .select("id")
        .eq("session_id", session.access_token)
        .maybeSingle();

      // Sadece veri geldiyse ve oturum yoksa at (Ağ hatasında veya tablo yoksa atma)
      if (!error && !exists && allowed) {
        await supabase.auth.signOut();
        window.location.href = "/?error=session_expired";
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [allowed]);
  */

  if (checking) {
    return <LoadingScreen step={loadingStep} />;
  }

  if (!allowed) {
    return null;
  }

  return (
    <HotelContext.Provider value={clinicCtx}>
      {children}
    </HotelContext.Provider>
  );
}
