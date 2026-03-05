import React, { useState } from "react";
import { UserRole } from "@/types/database";
import { Permission, DEFAULT_ROLE_PERMISSIONS } from "@/types/permissions";
import { ROLE_LABELS } from "@/constants/roles";

export function PermissionMatrix() {
    const [permissions, setPermissions] = useState<Record<string, Permission[]>>(DEFAULT_ROLE_PERMISSIONS);
    const [saving, setSaving] = useState(false);

    const roles = [
        UserRole.ADMIN,
        UserRole.RECEPTION,
        UserRole.HOUSEKEEPING,
        UserRole.FINANCE,
        UserRole.NIGHT_AUDIT
    ];

    const permissionGroups: Record<string, Permission[]> = {
        "Rezervasyonlar": [
            Permission.RESERVATION_VIEW,
            Permission.RESERVATION_CREATE,
            Permission.RESERVATION_EDIT,
            Permission.RESERVATION_CANCEL,
            Permission.RESERVATION_CHECKIN,
            Permission.RESERVATION_CHECKOUT,
            Permission.RESERVATION_NOSHOW,
            Permission.RESERVATION_PRICE_MODIFY,
            Permission.RESERVATION_STATUS_UPDATE,
            Permission.RESERVATION_STATUS_CHECKIN,
            Permission.RESERVATION_STATUS_CHECKOUT,
            Permission.RESERVATION_STATUS_CANCEL,
            Permission.RESERVATION_STATUS_NO_SHOW,
            Permission.RESERVATION_STATUS_UNDO_CHECKOUT,
            Permission.RESERVATION_STATUS_REINSTATE
        ],
        "Folyo & Finans": [
            Permission.FOLIO_VIEW,
            Permission.FINANCE_PAYMENT_ADD,
            Permission.FINANCE_CHARGE_ADD,
            Permission.FINANCE_DISCOUNT_APPLY,
            Permission.FINANCE_REFUND_ISSUE,
            Permission.FINANCE_ENTRY_DELETE,
            Permission.FINANCE_REVERSE,
            Permission.FINANCE_REPORT_EXPORT
        ],
        "Raporlar": [
            Permission.REPORT_VIEW,
            Permission.REPORT_EXPORT
        ],
        "Sistem & Ayarlar": [
            Permission.SYSTEM_USERS_MANAGE,
            Permission.SYSTEM_SETTINGS_HOTEL,
            Permission.SYSTEM_SETTINGS_CURRENCY,
            Permission.SYSTEM_DAY_CLOSE,
            Permission.SYSTEM_SETTINGS_MODIFY
        ],
        "Otel Yapılandırması (Gelişmiş)": [
            Permission.HOTEL_PRICING_VIEW,
            Permission.HOTEL_PRICING_MANAGE,
            Permission.HOTEL_INVENTORY_VIEW,
            Permission.HOTEL_INVENTORY_MANAGE,
            Permission.HOTEL_CATALOG_VIEW,
            Permission.HOTEL_CATALOG_MANAGE,
            Permission.HOTEL_SOURCES_VIEW,
            Permission.HOTEL_SOURCES_MANAGE
        ]
    };

    const togglePermission = (role: string, perm: Permission) => {
        const current = permissions[role] || [];
        const next = current.includes(perm)
            ? current.filter(p => p !== perm)
            : [...current, perm];

        setPermissions({
            ...permissions,
            [role]: next
        });
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));
        setSaving(false);
        alert("Yetki matrisi başarıyla güncellendi (Simülasyon)");
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tighter">Yetki Matrisi</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Rol bazlı modül erişimlerini yönetin</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-teal-800 transition-colors disabled:opacity-50"
                >
                    {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider min-w-[200px]">Modül / Yetki</th>
                            {roles.map(role => (
                                <th key={role} className="px-4 py-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider text-center">
                                    {ROLE_LABELS[role]}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {Object.entries(permissionGroups).map(([groupName, perms]) => (
                            <React.Fragment key={groupName}>
                                <tr className="bg-slate-50/30">
                                    <td colSpan={roles.length + 1} className="px-6 py-2 text-[10px] font-bold text-teal-700 bg-teal-50 uppercase tracking-widest">
                                        {groupName}
                                    </td>
                                </tr>
                                {perms.map(perm => (
                                    <tr key={perm} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold text-slate-700 group-hover:text-teal-700 transition-colors">
                                                    {perm.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                                <span className="text-[10px] text-slate-400">Bu eylem için yetki ver</span>
                                            </div>
                                        </td>
                                        {roles.map(role => (
                                            <td key={role} className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => togglePermission(role, perm)}
                                                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${permissions[role]?.includes(perm)
                                                        ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                                                        : 'bg-white border-slate-200 text-transparent hover:border-teal-300'
                                                        }`}
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
