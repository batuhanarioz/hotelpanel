"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useGuests, GuestRow } from "@/hooks/useGuests";
import { guestSchema } from "@/lib/validations/guest";
import { z } from "zod";

interface GuestCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (guest: GuestRow) => void;
}

export function GuestCreateModal({ isOpen, onClose, onSuccess }: GuestCreateModalProps) {
    const { createGuest, checkDuplicateGuest, mergeGuests } = useGuests();
    const [loading, setLoading] = useState(false);
    const [duplicate, setDuplicate] = useState<GuestRow | null>(null);
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        email: "",
        nationality: "",
        identity_type: "tc" as "tc" | "passport" | "other",
        identity_no: "",
        birth_date: "",
        is_vip: false,
        vip_level: "silver" as "silver" | "gold" | "platinum",
        is_blacklist: false,
        marketing_consent: false,
        tags: [] as string[],
        identity_photo_url: "",
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validate
            const validated = guestSchema.parse(formData);

            // Check dedupe
            const existing = await checkDuplicateGuest({
                phone: validated.phone || undefined,
                email: validated.email || undefined,
                identity_no: validated.identity_no || undefined,
                full_name: validated.full_name || undefined,
                birth_date: validated.birth_date || undefined
            });

            if (existing) {
                setDuplicate(existing as GuestRow);
                setLoading(false);
                return;
            }

            const newGuest = await createGuest(validated);
            if (newGuest) {
                onSuccess?.(newGuest);
                onClose();
            }
        } catch (err) {
            if (err instanceof z.ZodError) {
                alert(err.issues[0].message);
            } else {
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleMerge = async () => {
        if (!duplicate) return;
        setLoading(true);
        const success = await mergeGuests(duplicate.id, formData);
        if (success) {
            onSuccess?.({ ...duplicate, ...formData });
            onClose();
        }
        setLoading(false);
    };

    const handleCreateAnyway = async () => {
        setLoading(true);
        const newGuest = await createGuest(formData);
        if (newGuest) {
            onSuccess?.(newGuest);
            onClose();
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="border-b bg-slate-50/50 p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight">Yeni Misafir Kaydı</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Misafir Profil Oluşturma</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {duplicate ? (
                    <div className="p-8 text-center space-y-6">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 shadow-sm border border-amber-100">
                            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-lg font-black text-slate-900">Bu misafir zaten kayıtlı olabilir!</h4>
                            <p className="text-sm text-slate-500 max-w-md mx-auto">
                                <span className="font-bold text-slate-900">{duplicate.full_name}</span> isminde, aynı iletişim bilgilerine sahip bir kayıt bulundu. Mevcut kaydı güncellemek mi istersiniz yoksa yeni bir kayıt mı oluşturmak istersiniz?
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                            <button
                                onClick={handleMerge}
                                disabled={loading}
                                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 p-4 transition-all hover:bg-emerald-50 hover:border-emerald-200"
                            >
                                <div className="rounded-full bg-emerald-500 p-1.5 text-white">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <span className="text-xs font-black text-emerald-700 uppercase">Mevcut Kaydı Güncelle</span>
                            </button>
                            <button
                                onClick={handleCreateAnyway}
                                disabled={loading}
                                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-slate-50 hover:border-slate-200"
                            >
                                <div className="rounded-full bg-slate-400 p-1.5 text-white">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </div>
                                <span className="text-xs font-black text-slate-600 uppercase">Yeni Kayıt Oluştur</span>
                            </button>
                        </div>
                        <button onClick={() => setDuplicate(null)} className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Vazgeç ve Düzenlemeye Dön</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 md:col-span-1 space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ad Soyad *</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full rounded-xl border-2 border-slate-100 bg-white px-4 py-2.5 text-sm font-bold focus:border-emerald-500 focus:outline-none transition-all"
                                    placeholder="Örn: Ahmet Yılmaz"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1 space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Telefon *</label>
                                <input
                                    required
                                    type="tel"
                                    className="w-full rounded-xl border-2 border-slate-100 bg-white px-4 py-2.5 text-sm font-bold focus:border-emerald-500 focus:outline-none transition-all"
                                    placeholder="5xx xxx xx xx"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1 space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">E-posta</label>
                                <input
                                    type="email"
                                    className="w-full rounded-xl border-2 border-slate-100 bg-white px-4 py-2.5 text-sm font-bold focus:border-emerald-500 focus:outline-none transition-all"
                                    placeholder="ahmet@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1 space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Doğum Tarihi</label>
                                <input
                                    type="date"
                                    className="w-full rounded-xl border-2 border-slate-100 bg-white px-4 py-2.5 text-sm font-bold focus:border-emerald-500 focus:outline-none transition-all text-slate-400"
                                    value={formData.birth_date}
                                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1 space-y-1.5 border-t pt-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Kimlik Tipi</label>
                                <select
                                    className="w-full rounded-xl border-2 border-slate-100 bg-white px-4 py-2.5 text-sm font-bold focus:border-emerald-500 focus:outline-none transition-all"
                                    value={formData.identity_type}
                                    onChange={(e) => setFormData({ ...formData, identity_type: e.target.value as "tc" | "passport" | "other" })}
                                >
                                    <option value="tc">TC Kimlik</option>
                                    <option value="passport">Pasaport</option>
                                    <option value="other">Diğer</option>
                                </select>
                            </div>
                            <div className="col-span-2 md:col-span-1 space-y-1.5 border-t pt-4">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Kimlik/Pasaport No</label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl border-2 border-slate-100 bg-white px-4 py-2.5 text-sm font-bold focus:border-emerald-500 focus:outline-none transition-all"
                                    placeholder="11 haneli TC veya Pasaport No"
                                    value={formData.identity_no}
                                    onChange={(e) => setFormData({ ...formData, identity_no: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2 space-y-1.5">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Durum ve Etiketler</label>
                                <div className="flex flex-wrap gap-4 pt-2">
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <div className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${formData.is_vip ? 'bg-amber-500 border-amber-500' : 'border-slate-200 group-hover:border-amber-200'}`}>
                                                {formData.is_vip && <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                                            </div>
                                            <input type="checkbox" className="hidden" checked={formData.is_vip} onChange={(e) => setFormData({ ...formData, is_vip: e.target.checked })} />
                                            <span className={`text-xs font-black uppercase tracking-widest ${formData.is_vip ? 'text-amber-600' : 'text-slate-400'}`}>VIP</span>
                                        </label>
                                        {formData.is_vip && (
                                            <select
                                                className="text-[10px] font-black uppercase tracking-widest border-b-2 border-amber-200 bg-transparent py-1 outline-none"
                                                value={formData.vip_level}
                                                onChange={(e) => setFormData({ ...formData, vip_level: e.target.value as "silver" | "gold" | "platinum" })}
                                            >
                                                <option value="silver">Silver</option>
                                                <option value="gold">Gold</option>
                                                <option value="platinum">Platinum</option>
                                            </select>
                                        )}
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${formData.is_blacklist ? 'bg-rose-500 border-rose-500' : 'border-slate-200 group-hover:border-rose-200'}`}>
                                            {formData.is_blacklist && <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={formData.is_blacklist} onChange={(e) => setFormData({ ...formData, is_blacklist: e.target.checked })} />
                                        <span className={`text-xs font-black uppercase tracking-widest ${formData.is_blacklist ? 'text-rose-600' : 'text-slate-400'}`}>Kara Liste</span>
                                    </label>
                                </div>
                            </div>
                            <div className="col-span-2 pt-4">
                                <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                                    <div className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 shrink-0 transition-all ${formData.marketing_consent ? 'bg-emerald-600 border-emerald-600 shadow-md shadow-emerald-100' : 'bg-white border-slate-200'}`}>
                                        {formData.marketing_consent && <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={formData.marketing_consent} onChange={(e) => setFormData({ ...formData, marketing_consent: e.target.checked })} />
                                    <div>
                                        <p className="text-xs font-black text-slate-700 uppercase leading-none">Pazarlama İletişimi Onayı</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">Kampanya ve duyurular için iletişim izni veriyorum.</p>
                                    </div>
                                </label>
                            </div>

                            {/* Identity Photo Upload */}
                            <div className="col-span-2 pt-4 border-t">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">Kimlik / Pasaport Belgesi (Opsiyonel)</label>
                                <div className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    {formData.identity_photo_url ? (
                                        <div className="relative h-20 w-32 rounded-xl overflow-hidden shadow-sm border border-slate-200 group">
                                            <Image src={formData.identity_photo_url} alt="Identity" className="h-full w-full object-cover" width={128} height={80} />
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, identity_photo_url: "" })}
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-20 w-32 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-white text-slate-300">
                                            <svg className="h-8 w-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <label className="inline-block cursor-pointer">
                                            <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                                                {formData.identity_photo_url ? "Değiştir" : "Belge Yükle"}
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    // Simple local upload logic or notify user
                                                    alert("Lütfen rezervasyon ekranından yükleme yapınız veya bu ekranı API ile bağlayınız.");
                                                }}
                                            />
                                        </label>
                                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tight">JPG, PNG (Max 5MB)</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 rounded-2xl border-2 border-slate-100 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all"
                            >
                                Vazgeç
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 py-3 text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-emerald-100 hover:from-emerald-700 hover:to-teal-600 transition-all disabled:opacity-50"
                            >
                                {loading ? "Kaydediliyor..." : "Misafiri Kaydet"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
