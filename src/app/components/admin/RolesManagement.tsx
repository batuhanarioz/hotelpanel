import React from "react";
import { UserRole } from "@/types/database";
import { ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_BADGE_COLORS } from "@/constants/roles";

interface RolesManagementProps {
    onEditPermissions: () => void;
}

export function RolesManagement({ onEditPermissions }: RolesManagementProps) {
    const hotelRoles = [
        UserRole.ADMIN,
        UserRole.RECEPTION,
        UserRole.HOUSEKEEPING,
        UserRole.FINANCE,
        UserRole.NIGHT_AUDIT
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotelRoles.map(role => (
                <div key={role} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                    {/* Decorative Background */}
                    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-[0.03] group-hover:opacity-[0.05] transition-opacity ${ROLE_BADGE_COLORS[role as UserRole]}`} />

                    <div className="flex items-start justify-between mb-4">
                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${ROLE_BADGE_COLORS[role as UserRole]}`}>
                            {ROLE_LABELS[role as UserRole]}
                        </div>
                        <button className="text-slate-400 hover:text-teal-600 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                        </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-800 mb-1 leading-tight">{ROLE_LABELS[role as UserRole]}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed min-h-[40px]">
                        {ROLE_DESCRIPTIONS[role as UserRole] || "Bu rol için henüz bir açıklama tanımlanmamış."}
                    </p>

                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                    ?
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={onEditPermissions}
                            className="text-[10px] font-bold text-teal-700 hover:text-teal-800 uppercase tracking-wider"
                        >
                            Düzenle & Yetkiler
                        </button>
                    </div>
                </div>
            ))}

            {/* Add New Role Card */}
            <button className="rounded-2xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center gap-3 hover:border-teal-500 hover:bg-teal-50/30 transition-all group">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-teal-100 group-hover:text-teal-700 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
                <div>
                    <span className="text-sm font-bold text-slate-600 group-hover:text-teal-800 block">Yeni Rol Ekle</span>
                    <span className="text-[10px] text-slate-400">Sisteme özel yetkili yeni rol tanımlayın</span>
                </div>
            </button>
        </div>
    );
}
