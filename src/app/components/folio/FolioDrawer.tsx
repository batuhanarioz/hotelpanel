import React from "react";
import { ReservationFolio, FolioItem, LedgerItemType } from "@/hooks/useFolio";

interface AuditLogEntry {
    id: string;
    action: string;
    actor_name?: string;
    user_id?: string;
    created_at: string;
    details?: {
        description?: string;
        amount?: number;
        currency?: string;
    };
}

interface FolioDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    folio: ReservationFolio | null;
    onOpenPaymentForm: (type: LedgerItemType) => void;
    onPrint: () => void;
    onExportPdf: () => void;
    onCancelFolioItem?: (folioId: string, item: FolioItem) => void;
    auditLogs: AuditLogEntry[];
    userRole?: string;
}

export function FolioDrawer({ isOpen, onClose, folio, onOpenPaymentForm, onPrint, onExportPdf, onCancelFolioItem, auditLogs, userRole }: FolioDrawerProps) {
    if (!folio) return null;

    const typeConfig: Record<string, { label: string; color: string }> = {
        room_charge: { label: "Oda Ücreti", color: "text-amber-700 bg-amber-50" },
        service_charge: { label: "Hizmet Ücreti", color: "text-orange-700 bg-orange-50" },
        tax: { label: "Vergi/KDV", color: "text-purple-700 bg-purple-50" },
        adjustment: { label: "Düzeltme", color: "text-sky-700 bg-sky-50" },
        payment: { label: "Tahsilat", color: "text-emerald-700 bg-emerald-50" },
        refund: { label: "İade", color: "text-rose-700 bg-rose-50" },
    };

    const getTypeConfig = (type: string) => typeConfig[type] || { label: type, color: "text-slate-700 bg-slate-50" };

    const sourceLabel = (source: string) => {
        switch (source) {
            case "system": return "Sistem";
            case "integration": return "Entegrasyon";
            default: return "Manuel";
        }
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <div className={`fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-slate-50 shadow-2xl transition-transform duration-300 transform flex flex-col italic-none ${isOpen ? "translate-x-0" : "translate-x-full"}`}>

                {/* Header */}
                <div className="flex h-16 items-center justify-between border-b bg-white px-6 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Folyo Ledger: {folio.guest_name}</h2>
                            <p className="text-[10px] text-slate-400 font-medium">Oda {folio.room_number || "—"} · İmmutable Ledger</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto w-full p-6 space-y-6 max-h-[calc(100vh-64px)]">

                    {/* Balance Summary */}
                    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Misafir</p>
                                <p className="text-sm font-bold text-slate-900">{folio.guest_name}</p>
                                <p className="text-xs font-medium text-indigo-600 mt-0.5">{folio.guest_count} Kişi</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Toplam Borç</p>
                                <p className="text-sm font-bold text-slate-900">{folio.total_charges.toLocaleString("tr-TR")} ₺</p>
                                <p className="text-xs text-slate-500 mt-0.5">Oda + Hizmet + Vergi</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Toplam Tahsilat</p>
                                <div className="text-sm font-bold text-emerald-600">
                                    {folio.total_payments.toLocaleString("tr-TR")} ₺
                                </div>
                            </div>
                            <div className="flex flex-col items-end justify-center rounded-xl bg-slate-50 p-3 border">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Net Bakiye</span>
                                <span className={`text-xl font-black mt-1 ${folio.balance > 0 ? "text-amber-600" : folio.balance < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                    {Math.abs(folio.balance).toLocaleString("tr-TR")} ₺
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 mt-0.5">
                                    {folio.balance > 0 ? "(Misafir Borçlu)" : folio.balance < 0 ? "(Otel Borçlu)" : "(Hesap Kapalı)"}
                                </span>
                            </div>
                        </div>
                        {/* Checkout Guard Warning */}
                        {folio.balance > 0 && (
                            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 flex items-center gap-2">
                                <svg className="h-4 w-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                </svg>
                                <p className="text-xs font-bold text-amber-700">
                                    Misafirin ödenmemiş bakiyesi var. Checkout için bakiyenin kapatılması önerilir.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => onOpenPaymentForm("payment")}
                            className="h-10 px-5 rounded-xl bg-emerald-600 text-[11px] font-black text-white shadow-md shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                            <span>Tahsilat</span>
                        </button>
                        <button
                            onClick={() => onOpenPaymentForm("service_charge")}
                            className="h-10 px-4 rounded-xl border bg-white text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                        >
                            <span>Hizmet Ücreti Ekle</span>
                        </button>

                        {userRole !== "RECEPTION" && (
                            <>
                                <button
                                    onClick={() => onOpenPaymentForm("adjustment")}
                                    className="h-10 px-4 rounded-xl border bg-white text-[11px] font-bold text-sky-600 hover:bg-sky-50 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                                >
                                    <span>Düzeltme</span>
                                </button>
                                <button
                                    onClick={() => onOpenPaymentForm("refund")}
                                    className="h-10 px-4 rounded-xl border bg-white text-[11px] font-bold text-rose-600 hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                                >
                                    <span>İade</span>
                                </button>
                            </>
                        )}
                        <div className="grow"></div>
                        <div className="flex gap-2">
                            <button onClick={onPrint} className="h-10 w-10 flex items-center justify-center rounded-xl border bg-white text-slate-600 hover:bg-slate-50 active:scale-95 transition-all" title="Yazdır">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" /></svg>
                            </button>
                            <button onClick={onExportPdf} className="h-10 w-10 flex items-center justify-center rounded-xl border bg-white text-slate-600 hover:bg-slate-50 active:scale-95 transition-all" title="PDF İndir">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Ledger Table */}
                    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col min-h-0">
                        <div className="flex items-center justify-between px-5 py-3 bg-slate-50/80 border-b">
                            <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">İşlem Ledger</h3>
                            <span className="text-[9px] font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">IMMUTABLE</span>
                        </div>
                        <div className="grid grid-cols-[1.2fr_2fr_1.4fr_1fr_1fr_1fr_auto] gap-3 items-center px-5 py-2.5 bg-slate-50/50 border-b text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                            <span>Tarih</span>
                            <span>Açıklama</span>
                            <span>Tür</span>
                            <span className="text-right">Borç</span>
                            <span className="text-right">Alacak</span>
                            <span className="text-right text-indigo-600">Bakiye</span>
                            <span className="w-8"></span>
                        </div>
                        <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
                            {folio.items.length === 0 ? (
                                <div className="p-8 text-center text-sm font-medium text-slate-400">Bu folyoda henüz bir işlem bulunmuyor.</div>
                            ) : (
                                folio.items.map((item) => {
                                    const cfg = getTypeConfig(item.type);
                                    return (
                                        <div key={item.id} className="grid grid-cols-[1.2fr_2fr_1.4fr_1fr_1fr_1fr_auto] gap-3 items-center px-5 py-3 hover:bg-slate-50/50 transition-colors">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-slate-500">
                                                    {new Date(item.created_at).toLocaleDateString("tr-TR")}
                                                </span>
                                                <span className="text-[9px] text-slate-300 font-medium">{sourceLabel(item.source)}</span>
                                            </div>
                                            <span className="text-[12px] font-semibold text-slate-900 truncate">
                                                {item.description || "—"}
                                            </span>
                                            <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider w-fit ${cfg.color}`}>
                                                {cfg.label}
                                            </span>
                                            <span className="text-[12px] font-bold text-slate-700 text-right">
                                                {item.debit && item.debit > 0
                                                    ? `${Number(item.amount).toLocaleString("tr-TR")} ₺`
                                                    : "—"}
                                            </span>
                                            <span className="text-[12px] font-bold text-emerald-600 text-right">
                                                {item.credit && item.credit > 0
                                                    ? `${Number(item.amount).toLocaleString("tr-TR")} ₺`
                                                    : "—"}
                                            </span>
                                            <span className="text-[12px] font-black text-indigo-700 text-right">
                                                {(item.runningBalance ?? 0).toLocaleString("tr-TR")} ₺
                                            </span>
                                            <div className="w-8 flex justify-end shrink-0">
                                                {!item.description?.startsWith("İPTAL") && (
                                                    <button
                                                        onClick={() => onCancelFolioItem && onCancelFolioItem(folio.id, item)}
                                                        className="text-slate-300 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                                                        title="Düzeltme Kaydı Ekle"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden p-6">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Activity Log</h3>
                        <div className="space-y-4">
                            {auditLogs.length > 0 ? (
                                auditLogs.map(log => {
                                    const actorName = log.actor_name || log.user_id || "Sistem";
                                    const actionLabel =
                                        log.action === "folio_charge_added" ? "Borç Eklendi" :
                                            log.action === "folio_payment_added" ? "Tahsilat Eklendi" :
                                                log.action === "folio_refund_added" ? "İade Eklendi" :
                                                    log.action === "folio_transaction_added" ? "İşlem Eklendi" :
                                                        log.action;
                                    const description = log.details?.description || "—";

                                    return (
                                        <div key={`audit-${log.id}`} className="flex gap-4 items-start">
                                            <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${log.action?.includes('payment') ? 'bg-emerald-500' :
                                                log.action?.includes('refund') ? 'bg-rose-500' : 'bg-indigo-500'
                                                }`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <p className="text-[11px] font-bold text-slate-800">
                                                        {actionLabel}: <span className="font-medium text-slate-600">{description}</span>
                                                    </p>
                                                    <span className="text-[9px] font-medium text-slate-400 whitespace-nowrap ml-2">
                                                        {new Date(log.created_at).toLocaleString("tr-TR", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded border border-slate-100 flex items-center gap-1">
                                                        {actorName}
                                                    </span>
                                                    {log.details?.amount && (
                                                        <span className="text-[9px] font-bold text-slate-400 italic">
                                                            {Number(log.details.amount).toLocaleString("tr-TR")} {log.details.currency || "₺"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-[11px] text-slate-400 italic">Henüz kayıtlı bir işlem geçmişi bulunmuyor.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
