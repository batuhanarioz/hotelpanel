import React from "react";
import { UserRole } from "@/types/database";
import { UserRow } from "@/hooks/useAdminUsers";

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    saving: boolean;
    error: string | null;
    user: UserRow | null;
    fullName: string;
    setFullName: (v: string) => void;
    role: string;
    setRole: (v: string) => void;
    department: string;
    setDepartment: (v: string) => void;
    isActive: boolean;
    setIsActive: (v: boolean) => void;
    financialLimit: number;
    setFinancialLimit: (v: number) => void;
    maxRefundLimit: number;
    setMaxRefundLimit: (v: number) => void;
    maxDiscountLimit: number;
    setMaxDiscountLimit: (v: number) => void;
    twoFactorEnabled: boolean;
    setTwoFactorEnabled: (v: boolean) => void;
    ipRestriction: string;
    setIpRestriction: (v: string) => void;
    isSuperAdmin: boolean;
    currentUserId: string | null;
    onResetPassword: () => void;
    onDeleteUser: () => void;
    onChangePassword: () => void;
}

export function EditUserModal({
    isOpen, onClose, onSubmit, saving, error,
    user, fullName, setFullName, role, setRole,
    department, setDepartment, isActive, setIsActive,
    maxRefundLimit, setMaxRefundLimit, maxDiscountLimit, setMaxDiscountLimit,
    twoFactorEnabled, setTwoFactorEnabled, ipRestriction, setIpRestriction,
    isSuperAdmin, currentUserId, onResetPassword, onDeleteUser, onChangePassword
}: EditUserModalProps) {
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl border w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-500 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-sm">Kullanıcıyı Düzenle</h3>
                            <p className="text-slate-200 text-xs mt-0.5">{user.email}</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
                    <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700">İsim</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-500" placeholder="Ad Soyad" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">Rol</label>
                            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white">
                                <option value={UserRole.RECEPTION}>RESEPSİYON</option>
                                <option value={UserRole.HOUSEKEEPING}>HOUSEKEEPING</option>
                                <option value={UserRole.FINANCE}>FİNANS</option>
                                <option value={UserRole.NIGHT_AUDIT}>NIGHT AUDIT</option>
                                {(isSuperAdmin || user.role === UserRole.ADMIN) && <option value={UserRole.ADMIN}>YÖNETİCİ</option>}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">Departman</label>
                            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" placeholder="Departman" />
                        </div>
                    </div>

                    {/* Finansal Limitler */}
                    <div className="pt-2 border-t border-slate-50">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Finansal Limitler</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-slate-700">Max İade (TL)</label>
                                <input type="number" value={maxRefundLimit} onChange={(e) => setMaxRefundLimit(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                            </div>
                            <div className="space-y-1">
                                <label className="block text-xs font-medium text-slate-700">Max İskonto (%)</label>
                                <input type="number" value={maxDiscountLimit} onChange={(e) => setMaxDiscountLimit(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" />
                            </div>
                        </div>
                    </div>

                    {/* Güvenlik & Kısıtlamalar */}
                    <div className="pt-2 border-t border-slate-50 space-y-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Güvenlik & Kısıtlamalar</h4>

                        <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-700">IP Kısıtlaması (Opsiyonel)</label>
                            <input type="text" value={ipRestriction} onChange={(e) => setIpRestriction(e.target.value)} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500" placeholder="örn: 192.168.1.1" />
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50/50 border border-orange-100">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-bold text-orange-800">İki Faktörlü Doğrulama (2FA)</span>
                                <span className="text-[9px] text-orange-600">Girişlerde ek güvenlik doğrulaması ister</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${twoFactorEnabled ? 'bg-orange-500' : 'bg-slate-200'}`}
                            >
                                <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${twoFactorEnabled ? 'translate-x-3' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-slate-700">Hesap Durumu</span>
                            <span className="text-[10px] text-slate-400">Pasif hesaplar girişi engellenir</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsActive(!isActive)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {error && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">{error}</p>}

                    <div className="flex flex-col gap-3 pt-2">
                        <div className="flex gap-2 justify-between">
                            <div className="flex gap-2">
                                {user.id === currentUserId ? (
                                    <button type="button" onClick={onChangePassword} className="rounded-lg border border-teal-200 px-3 py-2 text-xs font-medium text-teal-700 hover:bg-teal-50">Şifre Değiştir</button>
                                ) : (
                                    <button type="button" onClick={onResetPassword} className="rounded-lg border border-amber-200 px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50">Şifre Sıfırla</button>
                                )}
                                <button type="button" onClick={onDeleteUser} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50">Sil</button>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t">
                            <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Kapat</button>
                            <button type="submit" disabled={saving} className="rounded-lg bg-slate-700 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60">{saving ? "Kaydediliyor..." : "Kaydet"}</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
