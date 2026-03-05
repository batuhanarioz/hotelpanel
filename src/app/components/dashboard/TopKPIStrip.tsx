"use client";

import React from "react";
import {
    Users,
    LogOut,
    Home,
    CreditCard,
    AlertTriangle
} from "lucide-react";

interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: "green" | "orange" | "red" | "purple" | "blue";
    onClick?: () => void;
}

const KPICard = ({ title, value, icon, color, onClick }: KPICardProps) => {
    const colorClasses = {
        green: "bg-emerald-50 text-emerald-600 border-emerald-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
        red: "bg-red-50 text-red-600 border-red-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
    };

    return (
        <div
            onClick={onClick}
            className={`flex items-center p-4 bg-white border rounded-xl hover:shadow-sm transition-all cursor-pointer ${onClick ? 'active:scale-95' : ''}`}
        >
            <div className={`p-2 rounded-lg mr-4 ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
};

interface TopKPIStripProps {
    arrivalsCount: number;
    departuresCount: number;
    occupancyRate: number;
    openBalance: number;
    oooCount: number;
    currencySymbol?: string;
}

export function TopKPIStrip({
    arrivalsCount,
    departuresCount,
    occupancyRate,
    openBalance,
    oooCount,
    currencySymbol = "₺"
}: TopKPIStripProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <KPICard
                title="Bugün Giriş"
                value={arrivalsCount}
                icon={<Users size={20} />}
                color="blue"
            />
            <KPICard
                title="Bugün Çıkış"
                value={departuresCount}
                icon={<LogOut size={20} />}
                color="orange"
            />
            <KPICard
                title="Doluluk"
                value={`%${occupancyRate}`}
                icon={<Home size={20} />}
                color="green"
            />
            <KPICard
                title="Açık Bakiye"
                value={`${new Intl.NumberFormat('tr-TR').format(openBalance)} ${currencySymbol}`}
                icon={<CreditCard size={20} />}
                color="purple"
            />
            <KPICard
                title="OOO / Servis Dışı"
                value={oooCount}
                icon={<AlertTriangle size={20} />}
                color="red"
            />
        </div>
    );
}
