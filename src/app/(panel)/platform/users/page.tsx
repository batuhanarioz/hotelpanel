"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Eski "Kullanıcılar" sayfası kaldırıldı.
 * SUPER_ADMIN kullanıcı yönetimi artık Otel Yönetimi sayfasında.
 */
export default function PlatformUsersRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/platform/hotels");
  }, [router]);

  return (
    <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-500">
      Yönlendiriliyor...
    </div>
  );
}
