import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { UserRole } from "@/types/database";
import { createUserSchema, updateUserSchema, deleteUserSchema } from "@/lib/validations/user";
import { withAuth } from "@/lib/auth-middleware";
import { logActivity } from "@/lib/logger";

export const POST = withAuth(
  async (req, auth) => {
    const validation = createUserSchema.safeParse(
      await req.json().catch(() => ({}))
    );
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, fullName, role, hotelId: bodyClinicId, department, financialLimit, maxRefundAmount, maxDiscountPercentage } = validation.data;

    // SUPER_ADMIN klinik belirtebilir; ADMIN kendi klinik ID'sini kullanır
    const hotelId = auth.isSuperAdmin
      ? bodyClinicId ?? auth.hotelId
      : auth.hotelId;

    // Sadece SUPER_ADMIN, SUPER_ADMIN oluşturabilir
    if (role === UserRole.SUPER_ADMIN && !auth.isSuperAdmin) {
      return NextResponse.json(
        { error: "SUPER_ADMIN rolünü yalnızca SUPER_ADMIN oluşturabilir" },
        { status: 403 }
      );
    }

    // SUPER_ADMIN olmayan roller için hotel_id zorunlu
    if (role !== UserRole.SUPER_ADMIN && !hotelId) {
      return NextResponse.json(
        { error: "Klinik seçilmeden kullanıcı oluşturulamaz" },
        { status: 400 }
      );
    }

    const { data: created, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (createError || !created.user) {
      return NextResponse.json(
        { error: createError?.message ?? "Kullanıcı oluşturulamadı" },
        { status: 400 }
      );
    }

    const { error: insertError, data: appUser } = await supabaseAdmin
      .from("users")
      .insert({
        id: created.user.id,
        hotel_id: role === UserRole.SUPER_ADMIN ? null : hotelId,
        full_name: fullName,
        email,
        role,
        department,
        financial_limit: financialLimit,
        max_refund_amount: maxRefundAmount,
        max_discount_percentage: maxDiscountPercentage,
        is_active: true, // New users are active by default
      })
      .select("id, full_name, email, role, hotel_id, department, is_active, financial_limit, max_refund_amount, max_discount_percentage, created_at")
      .maybeSingle();

    if (insertError || !appUser) {
      return NextResponse.json(
        { error: insertError?.message ?? "Profil kaydı oluşturulamadı" },
        { status: 400 }
      );
    }

    // Log the action
    await logActivity(
      hotelId,
      auth.user.id,
      "USER_CREATE",
      "SYSTEM",
      appUser.id,
      { email: appUser.email, role: appUser.role },
      req.headers.get("x-forwarded-for")?.split(",")[0]
    );

    return NextResponse.json({ user: appUser }, { status: 201 });
  },
  { requiredRole: "ADMIN_OR_SUPER" }
);

export const PATCH = withAuth(
  async (req, auth) => {
    const validation = updateUserSchema.safeParse(
      await req.json().catch(() => ({}))
    );
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { id, fullName, role, department, isActive, financialLimit, maxRefundAmount, maxDiscountPercentage } = validation.data;

    // ADMIN yalnızca kendi klinik kullanıcılarını güncelleyebilir
    if (!auth.isSuperAdmin) {
      const { data: target } = await supabaseAdmin
        .from("users")
        .select("hotel_id")
        .eq("id", id)
        .maybeSingle();

      if (!target || target.hotel_id !== auth.hotelId) {
        return NextResponse.json(
          { error: "Bu kullanıcıyı güncelleme yetkiniz yok" },
          { status: 403 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (typeof fullName === "string") {
      updateData.full_name = fullName;
    }
    if (role) {
      if (role === UserRole.SUPER_ADMIN && !auth.isSuperAdmin) {
        return NextResponse.json(
          { error: "SUPER_ADMIN rolünü yalnızca SUPER_ADMIN atayabilir" },
          { status: 403 }
        );
      }
      updateData.role = role;
    }
    if (typeof department === "string") {
      updateData.department = department;
    }
    if (typeof isActive === "boolean") {
      updateData.is_active = isActive;
    }
    if (typeof financialLimit === "number") {
      updateData.financial_limit = financialLimit;
    }
    if (typeof maxRefundAmount === "number") {
      updateData.max_refund_amount = maxRefundAmount;
    }
    if (typeof maxDiscountPercentage === "number") {
      updateData.max_discount_percentage = maxDiscountPercentage;
    }


    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Güncellenecek alan yok" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .update(updateData)
      .eq("id", id)
      .select("id, full_name, email, role, hotel_id, department, is_active, financial_limit, max_refund_amount, max_discount_percentage, created_at")
      .maybeSingle();


    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Kullanıcı güncellenemedi" },
        { status: 400 }
      );
    }

    // Log the action
    await logActivity(
      auth.hotelId,
      auth.user.id,
      "USER_UPDATE",
      "SYSTEM",
      data.id,
      { modified_fields: Object.keys(updateData) },
      req.headers.get("x-forwarded-for")?.split(",")[0]
    );

    return NextResponse.json({ user: data });
  },
  { requiredRole: "ADMIN_OR_SUPER" }
);

export const DELETE = withAuth(
  async (req, auth) => {
    const validation = deleteUserSchema.safeParse(
      await req.json().catch(() => ({}))
    );
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { id } = validation.data;

    // ADMIN yalnızca kendi klinik kullanıcılarını silebilir
    const { data: target, error: targetError } = await supabaseAdmin
      .from("users")
      .select("role, hotel_id")
      .eq("id", id)
      .maybeSingle();

    if (targetError || !target) {
      return NextResponse.json(
        { error: targetError?.message ?? "Kullanıcı bulunamadı" },
        { status: 400 }
      );
    }

    if (!auth.isSuperAdmin && target.hotel_id !== auth.hotelId) {
      return NextResponse.json(
        { error: "Bu kullanıcıyı silme yetkiniz yok" },
        { status: 403 }
      );
    }


    // Check if it's a critical role protection (prevent deleting default role instances if it's the last one)
    if (target.role === UserRole.ADMIN) {
      const { count } = await supabaseAdmin
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("hotel_id", target.hotel_id)
        .eq("role", UserRole.ADMIN);

      if (count && count <= 1) {
        return NextResponse.json(
          { error: "Sistemde en az bir Otel Müdürü bulunmalıdır." },
          { status: 400 }
        );
      }
    }

    // ADMIN and SUPER_ADMIN hesaplar silinemez (SUPER_ADMIN hariç)
    // Extra guard: If user is trying to delete an ADMIN but they are just an ADMIN themselves
    if (target.role === UserRole.ADMIN && !auth.isSuperAdmin) {
      return NextResponse.json(
        { error: "ADMIN rolüne sahip kullanıcıları yalnızca SUPER_ADMIN silebilir" },
        { status: 400 }
      );
    }

    if (target.role === UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "SUPER_ADMIN rolüne sahip kullanıcılar silinemez" },
        { status: 400 }
      );
    }

    // Önce auth tarafında kullanıcıyı sil
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) {
      return NextResponse.json(
        { error: authError.message ?? "Auth kullanıcısı silinemedi" },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message ?? "Profil kaydı silinemedi" },
        { status: 400 }
      );
    }

    // Log the action
    await logActivity(
      target.hotel_id,
      auth.user.id,
      "USER_DELETE",
      "SYSTEM",
      id,
      { deleted_user_role: target.role },
      req.headers.get("x-forwarded-for")?.split(",")[0]
    );

    return NextResponse.json({ success: true });
  },
  { requiredRole: "ADMIN_OR_SUPER" }
);
