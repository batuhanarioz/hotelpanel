import React, { useState, useMemo } from "react";
import { ReservationFolio, LedgerItemType, CurrencyType } from "@/hooks/useFolio";

interface GlobalFinanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    folios: ReservationFolio[];
    onSubmit: (folioId: string, amount: number, currency: CurrencyType, rate: number, type: LedgerItemType, method: string, note: string, referenceNo: string) => Promise<void>;
}

export function GlobalFinanceModal({ isOpen, onClose, folios, onSubmit }: GlobalFinanceModalProps) {
    const [search, setSearch] = useState("");
    const [selectedFolioId, setSelectedFolioId] = useState<string | null>(null);

    const [amount, setAmount] = useState("");
    const [currency, setCurrency] = useState<CurrencyType>("TRY");
    const [exchangeRate, setExchangeRate] = useState("1.00");
    const [type, setType] = useState<LedgerItemType>("payment");
    const [method, setMethod] = useState("Nakit");
    const [note, setNote] = useState("");
    const [referenceNo, setReferenceNo] = useState("");
    const [saving, setSaving] = useState(false);

    // Reset when modal closes
    React.useEffect(() => {
        if (!isOpen) {
            setSearch("");
            setSelectedFolioId(null);
            setAmount("");
            setCurrency("TRY");
            setExchangeRate("1.00");
            setType("payment");
            setMethod("Nakit");
            setNote("");
            setReferenceNo("");
        }
    }, [isOpen]);

    const activeFolio = selectedFolioId ? folios.find(f => f.id === selectedFolioId) : null;

    const filteredFolios = useMemo(() => {
        if (!search.trim()) return [];
        const t = search.toLowerCase();
        return folios.filter(f => f.guest_name.toLowerCase().includes(t) || f.room_number?.toLowerCase().includes(t)).slice(0, 5);
    }, [folios, search]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFolioId || !amount || isNaN(Number(amount))) return;

        setSaving(true);
        await onSubmit(selectedFolioId, Number(amount), currency, Number(exchangeRate) || 1, type, method, note, referenceNo);
        setSaving(false);
        onClose();
    };

    const maxAmount = activeFolio ? (type === 'payment' ? activeFolio.balance : type === 'refund' ? activeFolio.total_payments : undefined) : undefined;
    const isAmountValid = maxAmount === undefined || Number(amount) <= maxAmount;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 italic-none">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 transform transition-all">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black tracking-tight text-slate-800">
                        Yeni Finans Hareketi
                    </h3>
                    <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 transition-colors">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Guest Search */}
                    {!activeFolio ? (
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Misafir veya Oda Ara</label>
                            <div className="relative">
                                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 pl-10 pr-4 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                    placeholder="İsim veya oda numarası..."
                                />
                            </div>

                            {search.trim() && (
                                <div className="mt-2 rounded-xl border border-slate-100 overflow-hidden bg-white shadow-sm border-t max-h-40 overflow-y-auto">
                                    {filteredFolios.length === 0 ? (
                                        <div className="p-3 text-xs text-slate-400 font-medium text-center">Sonuç bulunamadı.</div>
                                    ) : (
                                        filteredFolios.map(f => (
                                            <div
                                                key={f.id}
                                                className="px-4 py-3 border-b border-slate-50 hover:bg-indigo-50 cursor-pointer transition-colors flex justify-between items-center"
                                                onClick={() => {
                                                    setSelectedFolioId(f.id);
                                                    setSearch("");
                                                }}
                                            >
                                                <div>
                                                    <div className="text-sm font-bold text-slate-800">{f.guest_name}</div>
                                                    <div className="text-[10px] uppercase font-bold text-slate-400 mt-0.5 tracking-wider">Oda: {f.room_number || "—"}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-xs font-black ${f.balance > 0 ? "text-amber-600" : f.balance < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                                        {f.balance.toLocaleString("tr-TR")} ₺
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-0.5">Seçili Misafir</p>
                                <p className="text-sm font-black text-indigo-900">{activeFolio.guest_name}</p>
                                <p className="text-xs font-semibold text-indigo-600">Oda: {activeFolio.room_number || "—"} &bull; Bakiye: {activeFolio.balance.toLocaleString("tr-TR")} ₺</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedFolioId(null)}
                                className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/60 text-indigo-600 hover:bg-white shadow-sm transition-all"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    )}

                    {activeFolio && (
                        <>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">İşlem Türü</label>
                                    <select
                                        value={type}
                                        onChange={e => {
                                            setType(e.target.value as LedgerItemType);
                                            setAmount("");
                                        }}
                                        className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                    >
                                        <option value="payment">Tahsilat (+)</option>
                                        <option value="extra">Ekstra (-)</option>
                                        <option value="discount">İndirim (+)</option>
                                        <option value="refund">İade (-)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Tutar</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                required
                                                max={maxAmount}
                                                value={amount}
                                                onChange={e => {
                                                    let val = e.target.value;
                                                    if (maxAmount !== undefined && Number(val) > maxAmount) {
                                                        val = maxAmount.toString();
                                                    }
                                                    setAmount(val);
                                                }}
                                                className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 pl-4 pr-12 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                                placeholder="0.00"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{currency !== "TRY" ? currency : "₺"}</span>
                                        </div>
                                        <select
                                            value={currency}
                                            onChange={e => setCurrency(e.target.value as CurrencyType)}
                                            className="w-20 h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                        >
                                            <option value="TRY">TRY</option>
                                            <option value="EUR">EUR</option>
                                            <option value="USD">USD</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {currency !== "TRY" && (
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Kur (1 {currency} = ? TRY)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            value={exchangeRate}
                                            onChange={e => setExchangeRate(e.target.value)}
                                            className="w-full h-12 rounded-xl border-2 border-slate-100 bg-amber-50/30 pl-4 pr-10 text-sm font-bold text-slate-800 focus:bg-white focus:border-amber-500 outline-none transition-all placeholder:text-slate-300"
                                            placeholder="0.00"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                                    </div>
                                </div>
                            )}

                            {!isAmountValid && (
                                <p className="text-[10px] font-bold text-amber-600 mx-1">
                                    Maksimum tutar aşıldı! (Maks: {maxAmount?.toLocaleString("tr-TR")} ₺)
                                </p>
                            )}

                            {type !== "discount" && type !== "extra" && (
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Ödeme Yöntemi</label>
                                    <select
                                        value={method}
                                        onChange={e => setMethod(e.target.value)}
                                        className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                    >
                                        <option value="Nakit">Nakit</option>
                                        <option value="Kredi Kartı">Kredi Kartı</option>
                                        <option value="Havale / EFT">Havale / EFT</option>
                                    </select>
                                </div>
                            )}

                            {type === "extra" && (
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Kategori</label>
                                    <select
                                        value={method}
                                        onChange={e => setMethod(e.target.value)}
                                        className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-bold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                    >
                                        <option value="Minibar">Minibar</option>
                                        <option value="Restoran">Restoran</option>
                                        <option value="Oda Servisi">Oda Servisi</option>
                                        <option value="Diğer">Diğer</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                    Referans No
                                </label>
                                <input
                                    type="text"
                                    value={referenceNo}
                                    onChange={e => setReferenceNo(e.target.value)}
                                    className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                    placeholder="POS Slip / Dekont No..."
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                                    Açıklama / Not
                                </label>
                                <input
                                    type="text"
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    className="w-full h-12 rounded-xl border-2 border-slate-100 bg-slate-50/50 px-4 text-sm font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                                    placeholder="İsteğe bağlı not..."
                                />
                            </div>
                        </>
                    )}

                    <div className="mt-8 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="h-12 flex-1 rounded-xl bg-slate-100 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-all tracking-wide disabled:opacity-50"
                            disabled={saving}
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={saving || !activeFolio || !amount || !isAmountValid}
                            className={`h-12 flex-1 rounded-xl text-sm font-black text-white shadow-lg transition-all tracking-wide disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200`}
                        >
                            {saving ? "Kaydediliyor..." : "Kaydet"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
