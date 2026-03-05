import React from "react";
import { LedgerItemType } from "@/hooks/useFolio";

interface PaymentActionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    type: LedgerItemType;
    amount: string;
    setAmount: (v: string) => void;
    method: string;
    setMethod: (v: string) => void;
    note: string;
    setNote: (v: string) => void;
    referenceNo?: string;
    setReferenceNo?: (v: string) => void;
    saving: boolean;
    currency: string;
    setCurrency: (v: string) => void;
    totalCharges?: number;
    totalPayments?: number;
    balance?: number;
    userRole?: string;
}

export function PaymentActionModal({
    isOpen, onClose, onSubmit, type, amount, setAmount, method, setMethod, note, setNote,
    saving, currency, setCurrency,
    referenceNo, setReferenceNo,
    totalCharges, totalPayments, balance
}: PaymentActionModalProps) {
    if (!isOpen) return null;

    const typeConfig: Record<LedgerItemType, { title: string; color: string; titleColor: string }> = {
        payment: { title: "Tahsilat Ekle", color: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200", titleColor: "text-emerald-700" },
        refund: { title: "İade Yap", color: "bg-rose-600 hover:bg-rose-700 shadow-rose-200", titleColor: "text-rose-700" },
        room_charge: { title: "Oda Ücreti Ekle", color: "bg-amber-600 hover:bg-amber-700 shadow-amber-200", titleColor: "text-amber-700" },
        service_charge: { title: "Hizmet Ücreti Ekle", color: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200", titleColor: "text-indigo-700" },
        tax: { title: "Vergi / KDV Ekle", color: "bg-purple-600 hover:bg-purple-700 shadow-purple-200", titleColor: "text-purple-700" },
        adjustment: { title: "Düzeltme Kaydı", color: "bg-sky-600 hover:bg-sky-700 shadow-sky-200", titleColor: "text-sky-700" },
        discount: { title: "İndirim Uygula", color: "bg-pink-600 hover:bg-pink-700 shadow-pink-200", titleColor: "text-pink-700" },
        accommodation: { title: "Konaklama Ücreti", color: "bg-amber-600 hover:bg-amber-700 shadow-amber-200", titleColor: "text-amber-700" },
        charge: { title: "Harcama Ekle", color: "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200", titleColor: "text-indigo-700" },
        extra: { title: "Ekstra Hizmet", color: "bg-cyan-600 hover:bg-cyan-700 shadow-cyan-200", titleColor: "text-cyan-700" },
    };

    const cfg = typeConfig[type] || typeConfig.service_charge;

    const paymentMethods = ["CASH", "CREDIT_CARD", "BANK_TRANSFER", "ONLINE_PAYMENT"];
    const paymentMethodLabels: Record<string, string> = {
        CASH: "Nakit",
        CREDIT_CARD: "Kredi Kartı",
        BANK_TRANSFER: "Banka Transferi",
        ONLINE_PAYMENT: "Online Ödeme",
    };
    const serviceCategories = ["Minibar", "Restoran", "SPA", "Oda Servisi", "Çamaşırhane", "Tur / Transfer", "Diğer"];

    const isCharge = ["room_charge", "service_charge", "tax"].includes(type);
    const isPaymentOrRefund = type === "payment" || type === "refund";
    const isAdjustment = type === "adjustment";

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 italic-none">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 transform transition-all">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className={`text-lg font-black tracking-tight ${cfg.titleColor}`}>
                            {cfg.title}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-widest">
                            Folio Ledger · Immutable Entry
                        </p>
                    </div>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Balance Summary */}
                    {(totalCharges !== undefined || totalPayments !== undefined || balance !== undefined) && (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 shadow-inner">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                                <span className="text-slate-500">Toplam Borç</span>
                                <span className="text-slate-900">{(totalCharges || 0).toLocaleString("tr-TR")} ₺</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-tight">
                                <span className="text-slate-500">Toplam Tahsilat</span>
                                <span className="text-emerald-600">{(totalPayments || 0).toLocaleString("tr-TR")} ₺</span>
                            </div>
                            <div className="pt-1 border-t flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-600">Net Bakiye</span>
                                <span className={balance && balance > 0 ? "text-amber-600" : "text-emerald-600"}>
                                    {Math.abs(balance || 0).toLocaleString("tr-TR")} ₺ {balance && balance < 0 ? "(İade)" : ""}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Amount */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                            {isAdjustment ? "Tutar (Negatif girilebilir)" : "Tutar"}
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    required
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 pl-4 pr-12 text-lg font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                    placeholder={isAdjustment ? "Negatif değer girilebilir" : "0.00"}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency !== "TRY" ? currency : "₺"}</span>
                            </div>
                            <select
                                value={currency}
                                onChange={e => setCurrency(e.target.value)}
                                className="w-24 h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-2 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            >
                                <option value="TRY">TRY</option>
                                <option value="EUR">EUR</option>
                                <option value="USD">USD</option>
                                <option value="GBP">GBP</option>
                            </select>
                        </div>
                    </div>

                    {/* Payment Method (for payment/refund only) */}
                    {isPaymentOrRefund && (
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Ödeme Yöntemi</label>
                            <select
                                value={method}
                                onChange={e => setMethod(e.target.value)}
                                className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            >
                                {paymentMethods.map(m => (
                                    <option key={m} value={m}>{paymentMethodLabels[m]}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Service category (for service_charge) */}
                    {type === "service_charge" && (
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Hizmet Kategorisi</label>
                            <select
                                value={method}
                                onChange={e => setMethod(e.target.value)}
                                className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            >
                                {serviceCategories.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Reference no */}
                    {(isPaymentOrRefund || isCharge) && (
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Referans No (İsteğe Bağlı)</label>
                            <input
                                type="text"
                                value={referenceNo}
                                onChange={e => setReferenceNo?.(e.target.value)}
                                className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                placeholder="Örn: POS-123456"
                            />
                        </div>
                    )}

                    {/* Note */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                            {isAdjustment ? "Düzeltme Nedeni (Zorunlu)" : "Açıklama / Not"}
                        </label>
                        <input
                            type="text"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                            placeholder={
                                type === "refund" ? "İade nedeni..." :
                                    isAdjustment ? "Düzeltme açıklaması..." :
                                        type === "service_charge" ? "Örn: 2x Su, 1x Cips" : "Açıklama..."
                            }
                        />
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-12 flex-1 rounded-xl bg-slate-100 text-sm font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-all tracking-wide disabled:opacity-50"
                        disabled={saving}
                    >
                        İptal
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={saving || !amount || (isAdjustment && !note)}
                        className={`h-12 flex-1 rounded-xl text-sm font-black text-white shadow-lg transition-all tracking-wide disabled:opacity-50 disabled:cursor-not-allowed ${cfg.color}`}
                    >
                        {saving ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                Kaydediliyor...
                            </span>
                        ) : "Kaydet"}
                    </button>
                </div>
            </div>
        </div>
    );
}
