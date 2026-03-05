import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useHotel } from "@/app/context/HotelContext";
import { UserRole } from "@/types/database";

import { DOCTOR_LIMITS, PLAN_IDS } from "@/constants/plans";

export type UserRow = {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string;
    department: string | null;
    is_active: boolean;
    financial_limit: number | null;
    max_refund_amount?: number | null;
    max_discount_percentage?: number | null;
    two_factor_enabled?: boolean;
    ip_restriction?: string | null;
    created_at: string;
    last_login?: string | null;
};

export type HotelRow = {
    id: string;
    name: string;
};

export function useAdminUsers() {
    const hotelCtx = useHotel();
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [currentUserEmail, setCurrentUserEmail] = useState<string>("");
    const [hotels, setHotels] = useState<HotelRow[]>([]);

    // Modals state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);
    const [deleteProtected, setDeleteProtected] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetUserId, setResetUserId] = useState<string | null>(null);
    const [showChecklistModal, setShowChecklistModal] = useState(false);

    // Form states
    const [saving, setSaving] = useState(false);
    const [newEmail, setNewEmail] = useState("");
    const [newFullName, setNewFullName] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRole, setNewRole] = useState<string>(UserRole.RECEPTION);
    const [newHotelId, setNewHotelId] = useState("");
    const [newDepartment, setNewDepartment] = useState("");
    const [newIsActive, setNewIsActive] = useState(true);
    const [newFinancialLimit, setNewFinancialLimit] = useState(0);
    const [newMaxRefundLimit, setNewMaxRefundLimit] = useState(1000);
    const [newMaxDiscountLimit, setNewMaxDiscountLimit] = useState(10);
    const [editFullName, setEditFullName] = useState("");
    const [editRole, setEditRole] = useState<string>(UserRole.RECEPTION);
    const [editDepartment, setEditDepartment] = useState("");
    const [editIsActive, setEditIsActive] = useState(true);
    const [editFinancialLimit, setEditFinancialLimit] = useState(0);
    const [editMaxRefundLimit, setEditMaxRefundLimit] = useState(1000);
    const [editMaxDiscountLimit, setEditMaxDiscountLimit] = useState(10);
    const [editTwoFactorEnabled, setEditTwoFactorEnabled] = useState(false);
    const [editIpRestriction, setEditIpRestriction] = useState("");
    const [editSaving, setEditSaving] = useState(false);

    const [resetPassword, setResetPassword] = useState("");
    const [resetSaving, setResetSaving] = useState(false);
    const [resetError, setResetError] = useState<string | null>(null);
    const [resetSuccess, setResetSuccess] = useState(false);

    const [selfNewEmail, setSelfNewEmail] = useState("");
    const [selfOldPassword, setSelfOldPassword] = useState("");
    const [selfNewPassword, setSelfNewPassword] = useState("");
    const [selfNewPasswordRepeat, setSelfNewPasswordRepeat] = useState("");
    const [selfSaving, setSelfSaving] = useState(false);
    const [selfMessage, setSelfMessage] = useState<string | null>(null);

    const refreshUsers = useCallback(async () => {
        if (!hotelCtx.hotelId) return;
        setLoading(true);
        const { data, error: err } = await supabase
            .from("users")
            .select("id, full_name, role, email, department, is_active, financial_limit, max_refund_amount, max_discount_percentage, two_factor_enabled, ip_restriction, created_at, last_login")
            .eq("hotel_id", hotelCtx.hotelId)
            .order("created_at", { ascending: true });

        if (err) throw err;
        setUsers((data as unknown as UserRow[]) || []);
        setLoading(false);
    }, [hotelCtx.hotelId]);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setError("Oturum bulunamadı."); setLoading(false); return; }
            const { data: current } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
            if (!current) { setError("Kullanıcı profili bulunamadı."); setLoading(false); return; }

            const isCurrentAdmin = current.role === UserRole.ADMIN || current.role === UserRole.SUPER_ADMIN;
            setIsAdmin(isCurrentAdmin);
            setCurrentUserId(user.id);
            setCurrentUserEmail(user.email ?? "");
            setSelfNewEmail(user.email ?? "");

            await refreshUsers();

            if (current.role === UserRole.SUPER_ADMIN) {
                const { data: hotelData } = await supabase.from("hotels").select("id, name").eq("is_active", true).order("name", { ascending: true });
                setHotels(hotelData || []);
            }
        };
        init();
    }, [refreshUsers]);

    const getAccessToken = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token ?? null;
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        const token = await getAccessToken();
        if (!token) { setError("Oturum bulunamadı."); setSaving(false); return; }

        if (newRole === UserRole.DOKTOR) {
            const currentDocs = users.filter(u => u.role === UserRole.DOKTOR).length;
            const limit = DOCTOR_LIMITS[hotelCtx.planId || PLAN_IDS.STARTER] || 1;
            if (currentDocs >= limit) {
                setError(`Limit aşıldı. En fazla ${limit} doktor ekleyebilirsiniz.`);
                setSaving(false);
                return;
            }
        }

        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    email: newEmail,
                    fullName: newFullName,
                    password: newPassword,
                    role: newRole,
                    department: newDepartment,
                    hotelId: newHotelId || hotelCtx.hotelId,
                    maxRefundAmount: newMaxRefundLimit,
                    maxDiscountPercentage: newMaxDiscountLimit
                })
            });
            const data = await res.json();
            if (data.error) setError(data.error);
            else {
                setShowCreateModal(false);
                setNewEmail(""); setNewFullName(""); setNewPassword(""); setNewDepartment("");
                await refreshUsers();
            }
        } catch (err: any) {
            setError(err.message || "İşlem sırasında bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setEditSaving(true);
        setError(null);
        const token = await getAccessToken();
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    userId: selectedUser.id,
                    fullName: editFullName,
                    role: editRole,
                    department: editDepartment,
                    is_active: editIsActive,
                    financial_limit: editFinancialLimit,
                    max_refund_amount: editMaxRefundLimit,
                    max_discount_percentage: editMaxDiscountLimit,
                    two_factor_enabled: editTwoFactorEnabled,
                    ip_restriction: editIpRestriction
                })
            });
            const data = await res.json();
            if (data.error) setError(data.error);
            else { setShowEditModal(false); setSelectedUser(null); await refreshUsers(); }
        } catch (err: any) {
            setError(err.message || "Güncelleme sırasında bir hata oluştu.");
        } finally {
            setEditSaving(false);
        }
    };

    const handleResetPassword = async () => {
        if (!resetUserId) return;
        setResetSaving(true);
        setResetError(null);
        const token = await getAccessToken();
        try {
            const res = await fetch("/api/admin/users", {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ userId: resetUserId, password: resetPassword })
            });
            const data = await res.json();
            if (data.error) setResetError(data.error);
            else setResetSuccess(true);
        } catch (err: any) {
            setResetError(err.message || "Şifre sıfırlama sırasında bir hata oluştu.");
        } finally {
            setResetSaving(false);
        }
    };

    const executeDeleteUser = async () => {
        if (!deleteTarget) return;
        const token = await getAccessToken();
        const res = await fetch(`/api/admin/users?userId=${deleteTarget.id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.error) alert(data.error);
        else { setDeleteTarget(null); await refreshUsers(); }
    };

    const handleUpdateSelf = async (e: React.FormEvent) => {
        e.preventDefault();
        setSelfSaving(true);
        setSelfMessage(null);
        setError(null);

        if (selfNewPassword && selfNewPassword !== selfNewPasswordRepeat) {
            setError("Şifreler eşleşmiyor.");
            setSelfSaving(false); return;
        }

        if (selfNewEmail !== currentUserEmail) {
            const { error: eError } = await supabase.auth.updateUser({ email: selfNewEmail });
            if (eError) { setError(eError.message); setSelfSaving(false); return; }
        }

        if (selfNewPassword) {
            const { error: pError } = await supabase.auth.updateUser({ password: selfNewPassword });
            if (pError) { setError(pError.message); setSelfSaving(false); return; }
        }

        setSelfMessage("Profil başarıyla güncellendi.");
        setSelfSaving(false);
        setSelfNewPassword(""); setSelfNewPasswordRepeat("");
    };

    const openEditModal = (user: UserRow) => {
        setSelectedUser(user);
        setEditFullName(user.full_name || "");
        setEditRole(user.role);
        setEditDepartment(user.department || "");
        setEditIsActive(user.is_active);
        setEditFinancialLimit(user.financial_limit || 0);
        setEditMaxRefundLimit(user.max_refund_amount || 1000);
        setEditMaxDiscountLimit(user.max_discount_percentage || 10);
        setEditTwoFactorEnabled(user.two_factor_enabled || false);
        setEditIpRestriction(user.ip_restriction || "");
        setShowEditModal(true);
    };

    const openDeleteModal = (user: UserRow) => {
        setDeleteTarget(user);
        setDeleteProtected(user.role === UserRole.ADMIN);
    };

    return {
        users, loading, error, isAdmin, currentUserId, currentUserEmail, hotels,
        showCreateModal, setShowCreateModal, showEditModal, setShowEditModal, selectedUser, setSelectedUser,
        showPasswordModal, setShowPasswordModal, deleteTarget, setDeleteTarget, deleteProtected,
        showResetModal, setShowResetModal, resetUserId, setResetUserId, showChecklistModal, setShowChecklistModal,
        saving, newEmail, setNewEmail, newFullName, setNewFullName, newPassword, setNewPassword, newRole, setNewRole, newHotelId, setNewHotelId,
        newDepartment, setNewDepartment, newIsActive, setNewIsActive, newFinancialLimit, setNewFinancialLimit,
        newMaxRefundLimit, setNewMaxRefundLimit, newMaxDiscountLimit, setNewMaxDiscountLimit,
        editFullName, setEditFullName, editRole, setEditRole, editSaving,
        editDepartment, setEditDepartment, editIsActive, setEditIsActive, editFinancialLimit, setEditFinancialLimit,
        editMaxRefundLimit, setEditMaxRefundLimit, editMaxDiscountLimit, setEditMaxDiscountLimit,
        editTwoFactorEnabled, setEditTwoFactorEnabled, editIpRestriction, setEditIpRestriction,
        resetPassword, setResetPassword, resetSaving, resetError, resetSuccess, setResetSuccess,
        selfNewEmail, setSelfNewEmail, selfOldPassword, setSelfOldPassword, selfNewPassword, setSelfNewPassword, selfNewPasswordRepeat, setSelfNewPasswordRepeat, selfSaving, selfMessage,
        handleCreateUser, handleUpdateUser, handleResetPassword, executeDeleteUser, handleUpdateSelf, openEditModal, openDeleteModal
    };
}
