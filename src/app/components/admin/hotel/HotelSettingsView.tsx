import React, { useState } from "react";
import { useHotel } from "@/app/context/HotelContext";
import { GeneralHotelSettings } from "./GeneralHotelSettings";
import { RoomTypeManagement } from "./RoomTypeManagement";
import { BoardTypeManagement } from "./BoardTypeManagement";
import { RoomManagement } from "./RoomManagement";
import { RatePlanManagement } from "./RatePlanManagement";
import { RoomBlockManagement } from "./RoomBlockManagement";
import { ProductCatalogManagement } from "./ProductCatalogManagement";
import { BookingSourceManagement } from "./BookingSourceManagement";
import { ReservationIdSettings } from "./ReservationIdSettings";

type SubTab = "general" | "id-settings" | "room-types" | "board-types" | "rooms" | "rates" | "blocks" | "products" | "sources";

export function HotelSettingsView() {
    const { isAdmin } = useHotel();
    const [subTab, setSubTab] = useState<SubTab>("rooms");

    // If admin, default to general
    React.useEffect(() => {
        if (isAdmin) setSubTab("general");
    }, [isAdmin]);

    const TabButton = ({ id, label, activeColor = "teal" }: { id: SubTab, label: string, activeColor?: "teal" | "indigo" | "rose" | "emerald" | "slate" }) => {
        const isActive = subTab === id;

        const colors = {
            teal: { active: "bg-teal-600 text-white shadow-teal-100", hover: "hover:bg-teal-50 hover:text-teal-700" },
            indigo: { active: "bg-indigo-600 text-white shadow-indigo-100", hover: "hover:bg-indigo-50 hover:text-indigo-700" },
            rose: { active: "bg-rose-600 text-white shadow-rose-100", hover: "hover:bg-rose-50 hover:text-rose-700" },
            emerald: { active: "bg-emerald-600 text-white shadow-emerald-100", hover: "hover:bg-emerald-50 hover:text-emerald-700" },
            slate: { active: "bg-slate-600 text-white shadow-slate-100", hover: "hover:bg-slate-50 hover:text-slate-700" }
        };

        const colorSet = colors[activeColor];

        return (
            <button
                onClick={() => setSubTab(id)}
                className={`
                    px-4 py-2 rounded-xl text-xs font-black transition-all duration-200 
                    ${isActive
                        ? `${colorSet.active} shadow-lg scale-105 z-10`
                        : `text-slate-500 ${colorSet.hover}`
                    }
                `}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white italic-none">
            {/* Header / Tabs Container */}
            <div className="px-4 sm:px-6 py-4 border-b bg-slate-50/30">
                <div className="flex flex-col gap-3 sm:gap-4">
                    {/* Top Row: Core Settings */}
                    <div className="flex items-center gap-2 p-1 bg-slate-100/50 rounded-2xl w-full lg:w-fit overflow-x-auto scrollbar-hide">
                        <div className="sticky left-0 bg-slate-100 px-3 py-1.5 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest border-r z-20 rounded-l-xl">Temel</div>
                        <div className="flex items-center gap-1.5 px-1 pr-4">
                            {isAdmin && <TabButton id="general" label="Genel Ayarlar" />}
                            <TabButton id="rooms" label="Odalar" />
                            <TabButton id="room-types" label="Oda Tipleri" />
                            <TabButton id="board-types" label="Pansiyon Tipleri" />
                        </div>
                    </div>

                    {/* Bottom Row: Advanced Settings */}
                    <div className="flex items-center gap-2 p-1 bg-slate-100/50 rounded-2xl w-full lg:w-fit border border-indigo-100/30 overflow-x-auto scrollbar-hide">
                        <div className="sticky left-0 bg-slate-100 px-3 py-1.5 text-[9px] sm:text-[10px] font-black text-indigo-400 uppercase tracking-widest border-r z-20 rounded-l-xl">İleri Seviye</div>
                        <div className="flex items-center gap-1.5 px-1 pr-4">
                            <TabButton id="rates" label="Fiyat Planları" activeColor="indigo" />
                            <TabButton id="blocks" label="Oda Blokajları" activeColor="rose" />
                            <TabButton id="products" label="Ürün Kataloğu" activeColor="emerald" />
                            <TabButton id="sources" label="Rez. Kaynakları" activeColor="slate" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 sm:p-8 overflow-auto CustomScroll">
                <div className="max-w-7xl mx-auto">
                    {subTab === "general" && isAdmin && <GeneralHotelSettings />}
                    {subTab === "id-settings" && isAdmin && <ReservationIdSettings />}
                    {subTab === "rooms" && <RoomManagement />}
                    {subTab === "room-types" && <RoomTypeManagement />}
                    {subTab === "board-types" && <BoardTypeManagement />}
                    {subTab === "rates" && <RatePlanManagement />}
                    {subTab === "blocks" && <RoomBlockManagement />}
                    {subTab === "products" && <ProductCatalogManagement />}
                    {subTab === "sources" && <BookingSourceManagement />}
                </div>
            </div>

            <style jsx>{`
                .CustomScroll::-webkit-scrollbar { width: 6px; }
                .CustomScroll::-webkit-scrollbar-track { background: transparent; }
                .CustomScroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .CustomScroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
}
