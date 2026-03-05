import React from "react";
import { UserRow } from "@/hooks/useAdminUsers";
import { UserRole } from "@/types/database";

import { ROLE_LABELS } from "@/constants/roles";

interface UserListTableProps {
    users: UserRow[];
    loading: boolean;
    isAdmin: boolean;
    currentUserId: string | null;
    onEditUser: (user: UserRow) => void;
}

export function UserListTable({ users, loading, isAdmin, currentUserId, onEditUser }: UserListTableProps) {
    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
                <thead>
                    <tr className="border-b bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="px-6 py-4">Kullanıcı</th>
                        <th className="px-6 py-4">Rol & Departman</th>
                        <th className="px-6 py-4">Durum</th>
                        <th className="px-6 py-4">Son Giriş / Kayıt</th>
                        <th className="px-6 py-4 text-right">İşlem</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 italic-none">
                    {users.map((u) => (
                        <tr key={u.id} className="group transition-colors hover:bg-slate-50/80">
                            <td className="whitespace-nowrap px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600 font-bold uppercase transition-transform group-hover:scale-110 shadow-sm border border-teal-100">
                                        {u.full_name?.[0] || u.email?.[0] || "?"}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                                            {u.full_name || "İsimsiz"}
                                        </div>
                                        <div className="text-[11px] text-slate-400 font-medium">
                                            {u.email}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                                <div className="flex flex-col gap-1">
                                    <span className={`inline-flex items-center w-fit rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${u.role === UserRole.ADMIN ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                        u.role === UserRole.RECEPTION ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                            u.role === UserRole.HOUSEKEEPING ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                u.role === UserRole.FINANCE ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                    'bg-slate-50 text-slate-600 border-slate-100'
                                        }`}>
                                        {ROLE_LABELS[u.role] || u.role}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-medium px-1">
                                        {u.department || "Departman Yok"}
                                    </span>
                                </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${u.is_active ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-50'}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                    {u.is_active ? 'AKTİF' : 'PASİF'}
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                                <div className="flex flex-col">
                                    <span className="text-slate-700 text-[11px] font-bold">
                                        {(isAdmin || u.id === currentUserId) ? (
                                            u.last_login ? new Date(u.last_login).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' }) : "Hiç girmedi"
                                        ) : (
                                            <span className="text-slate-300 italic">Gizli</span>
                                        )}
                                    </span>
                                    <span className="text-slate-400 text-[9px] font-medium uppercase tracking-tighter">
                                        Kayıt: {u.created_at ? new Date(u.created_at).toLocaleDateString('tr-TR') : "-"}
                                    </span>
                                </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                <button
                                    onClick={() => onEditUser(u)}
                                    disabled={!isAdmin}
                                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Düzenle
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
