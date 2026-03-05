import React from "react";
import { GuestSearchResult, ReservationFormState } from "@/hooks/useReservationManagement";
import Image from "next/image";
import { PremiumDatePicker } from "@/app/components/PremiumDatePicker";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface GuestPickerProps {
    selectedGuestId: string;
    setSelectedGuestId: (val: string) => void;
    guestSearch: string;
    setGuestSearch: (val: string) => void;
    guestSearchResults: GuestSearchResult[];
    guestSearchLoading: boolean;
    setForm: React.Dispatch<React.SetStateAction<ReservationFormState>>;
    duplicateGuest: GuestSearchResult | null;
    handleUseDuplicate: () => void;
    form: ReservationFormState;
    guestMatchInfo: string | null;
    isNewGuest: boolean;
    matchedGuestPreferences: string | null;
    matchedGuestPassport: string | null;
    isUploading?: boolean;
    handleFileUpload?: (file: File, guestIndex?: number) => Promise<string | null>;
    uploadingGuestIndex?: number | null;
    showAllInfo?: boolean;
}

export function GuestPicker({
    selectedGuestId, setSelectedGuestId, guestSearch, setGuestSearch,
    guestSearchResults, guestSearchLoading, setForm,
    duplicateGuest, handleUseDuplicate,
    form, guestMatchInfo, isNewGuest,
    matchedGuestPreferences, matchedGuestPassport,
    isUploading = false, handleFileUpload, uploadingGuestIndex = null
}: GuestPickerProps) {
    const [showAdditional, setShowAdditional] = React.useState(false);
    return (
        <div className="space-y-1 md:col-span-2 border-t pt-3 mt-1">
            <label className="block text-xs font-medium text-slate-700">
                Misafir seç
            </label>
            {!selectedGuestId ? (
                <>
                    <input
                        value={guestSearch}
                        onChange={(e) => setGuestSearch(e.target.value)}
                        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        placeholder="Ad soyad veya telefon ile ara..."
                    />
                    <div className="max-h-40 overflow-y-auto border rounded-lg bg-white mt-1 shadow-sm">
                        {guestSearchLoading && (
                            <div className="px-3 py-2 text-[11px] text-slate-600">
                                Misafirler yükleniyor...
                            </div>
                        )}
                        {!guestSearchLoading &&
                            guestSearch.trim() &&
                            guestSearchResults.length === 0 && (
                                <div className="px-3 py-2 text-[11px] text-slate-600">
                                    Bu arama ile eşleşen misafir bulunamadı.
                                </div>
                            )}
                        {!guestSearchLoading &&
                            guestSearchResults.map((guest) => (
                                <div
                                    key={guest.id}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setSelectedGuestId(guest.id);
                                        setForm((f) => ({
                                            ...f,
                                            guestName: guest.full_name,
                                            phone: guest.phone || "",
                                            email: guest.email || "",
                                            birthDate: guest.birth_date || "",
                                            identityPhotoUrl: (guest as any).identity_photo_url || "",
                                        }));
                                    }}
                                    className="w-full px-3 py-2 text-left text-[11px] flex flex-col gap-0.5 transition-colors cursor-pointer hover:bg-slate-50"
                                >
                                    <span className="font-medium text-slate-900 pointer-events-none">
                                        {guest.full_name}{" "}
                                        {guest.phone ? `· ${guest.phone}` : ""}
                                    </span>
                                    {guest.email && (
                                        <span className="text-[10px] text-slate-600 pointer-events-none">
                                            {guest.email}
                                        </span>
                                    )}
                                </div>
                            ))}
                    </div>
                </>
            ) : (
                <div className="relative">
                    <div className="w-full rounded-lg border border-indigo-500 bg-indigo-50 px-3 py-2.5 text-sm">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-900">
                                    {form.guestName}
                                </div>
                                <div className="text-[11px] text-slate-600 mt-0.5">
                                    {form.phone && `${form.phone}`}
                                    {form.email && ` · ${form.email}`}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedGuestId("");
                                    setGuestSearch("");
                                    setForm((f) => ({
                                        ...f,
                                        guestName: "",
                                        phone: "",
                                        email: "",
                                        birthDate: "",
                                    }));
                                }}
                                className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-200 text-indigo-700 hover:bg-indigo-300 transition-colors"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Guest Counts & Capacity */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t md:col-span-2">
                <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-2">Yetişkin</label>
                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, adultsCount: Math.max(1, f.adultsCount - 1) }))}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-90 transition-all font-bold"
                        >-</button>
                        <span className="flex-1 text-center font-black text-slate-800">{form.adultsCount}</span>
                        <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, adultsCount: f.adultsCount + 1 }))}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-90 transition-all font-bold"
                        >+</button>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-2">Çocuk</label>
                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, childrenCount: Math.max(0, f.childrenCount - 1) }))}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-90 transition-all font-bold"
                        >-</button>
                        <span className="flex-1 text-center font-black text-slate-800">{form.childrenCount}</span>
                        <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, childrenCount: f.childrenCount + 1 }))}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-90 transition-all font-bold"
                        >+</button>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-2">Bebek</label>
                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, infantsCount: Math.max(0, f.infantsCount - 1) }))}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-90 transition-all font-bold"
                        >-</button>
                        <span className="flex-1 text-center font-black text-slate-800">{form.infantsCount}</span>
                        <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, infantsCount: f.infantsCount + 1 }))}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-200 text-slate-600 hover:bg-slate-50 active:scale-90 transition-all font-bold"
                        >+</button>
                    </div>
                </div>
            </div>

            <div className="space-y-1 md:col-span-2 border-t pt-3 mt-1">
                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-2">
                    Misafir 1 {!selectedGuestId && "(Düzenleme)"}
                </label>

                {duplicateGuest && (
                    <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px]">
                        <div className="flex items-center gap-2 text-amber-800">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                            <span>
                                <span className="font-bold">Bu numara kayıtlı:</span> {duplicateGuest.full_name} ({duplicateGuest.phone})
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleUseDuplicate}
                            className="shrink-0 rounded-md bg-amber-600 px-2 py-0.5 font-bold text-white hover:bg-amber-700"
                        >
                            Bu Misafiri Kullan
                        </button>
                    </div>
                )}

                <div className="grid gap-3 md:grid-cols-2 bg-slate-50/50 p-4 rounded-3xl border border-slate-100">
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Telefon</label>
                        <PhoneInput
                            country={'tr'}
                            value={form.phone}
                            onChange={phone => setForm(f => ({ ...f, phone: phone.startsWith('+') ? phone : '+' + phone }))}
                            containerClass="!w-full"
                            inputClass="!w-full !h-[38px] !rounded-xl !border-slate-200 !text-sm focus:!border-indigo-500 !bg-white"
                            buttonClass="!rounded-l-xl !border-slate-200 !bg-white"
                            placeholder="5XX XXX XX XX"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Ad Soyad</label>
                        <input
                            value={form.guestName}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, guestName: e.target.value }))
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="Misafir adı soyadı"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">TC Kimlik / Passport No</label>
                        <input
                            value={form.identityNo || ""}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, identityNo: e.target.value }))
                            }
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                            placeholder="TC Kimlik No"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Doğum Tarihi</label>
                        <PremiumDatePicker
                            value={form.birthDate || ""}
                            onChange={(date) => setForm((f) => ({ ...f, birthDate: date }))}
                            today={new Date().toISOString().split('T')[0]}
                            compact
                        />
                    </div>
                </div>
                {guestMatchInfo && (
                    <p className="mt-1 text-[10px] text-slate-600">
                        {guestMatchInfo}{" "}
                        <span className="font-semibold text-indigo-600">
                            ({isNewGuest ? "Yeni misafir" : "Mevcut misafir"})
                        </span>
                    </p>
                )}
                {(matchedGuestPreferences || matchedGuestPassport) && (
                    <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-[11px]">
                        <p className="font-semibold text-amber-800 mb-1">Özel İstek / Pasaport</p>
                        {matchedGuestPreferences && (
                            <p className="text-amber-900"><span className="font-medium">Özel İstek:</span> {matchedGuestPreferences}</p>
                        )}
                        {matchedGuestPassport && (
                            <p className="text-amber-900 mt-0.5"><span className="font-medium">Pasaport:</span> {matchedGuestPassport}</p>
                        )}
                    </div>
                )}

                {(isNewGuest || selectedGuestId) && (
                    <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                        <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75L12 3m0 0L8.25 6.75m3.75-3.75v10.5m0 0v10.5m-9-9h18" /></svg>
                            Misafir Kimlik Belgesi (Fotoğraf/Pasaport) <span className="text-[10px] font-medium text-slate-400 lowercase">(Opsiyonel)</span>
                        </label>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            {form.identityPhotoUrl ? (
                                <div className="relative group overflow-hidden rounded-xl border-2 border-indigo-100 shadow-md h-[150px]">
                                    <Image
                                        src={form.identityPhotoUrl}
                                        alt="Identity"
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setForm(f => ({ ...f, identityPhotoUrl: "" }))}
                                        className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="h-24 w-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white text-slate-400">
                                    <svg className="w-8 h-8 opacity-20 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                                    <span className="text-[10px] font-medium">Belge Seçilmedi</span>
                                </div>
                            )}

                            <div className="flex-1 w-full space-y-2">
                                <label className="relative cursor-pointer group">
                                    <div className={`flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-700 shadow-sm transition-all active:scale-95 hover:border-indigo-300 hover:text-indigo-600 ${isUploading ? 'opacity-50 cursor-wait' : ''}`}>
                                        {isUploading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full"></div>
                                                <span>Yükleniyor...</span>
                                            </div>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                                                <span>{form.identityPhotoUrl ? 'Değiştir' : 'Belge Yükle'}</span>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        className="sr-only"
                                        accept="image/*"
                                        disabled={isUploading}
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file && handleFileUpload) {
                                                await handleFileUpload(file);
                                            }
                                        }}
                                    />
                                </label>
                                <p className="text-[10px] text-slate-500 leading-tight">PNG, JPG (En fazla 5MB). Kimlik, pasaport veya kayıt belgesi yükleyebilirsiniz.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Guest Details List (MOVED BELOW GUEST 1) */}
            {(form.adultsCount + form.childrenCount > 1) && (
                <div className="pt-3 md:col-span-2 space-y-4">
                    <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Ek Misafir Detayları</span>
                            <span className="text-xs font-bold text-indigo-700">{form.adultsCount + form.childrenCount - 1} Misafir Bilgisi Gerekiyor</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowAdditional(!showAdditional)}
                            className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-[10px] font-black uppercase border border-indigo-100 shadow-sm hover:bg-indigo-50 transition-all"
                        >
                            {showAdditional ? 'Listeyi Gizle' : 'Listeyi Düzenle'}
                        </button>
                    </div>

                    {showAdditional && (
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                            {form.additionalGuests.map((guest, idx) => (
                                <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-wider">Misafir {idx + 2}</h4>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Ad Soyad</label>
                                            <input
                                                value={guest.fullName}
                                                onChange={(e) => {
                                                    const g = [...form.additionalGuests];
                                                    g[idx].fullName = e.target.value;
                                                    setForm(f => ({ ...f, additionalGuests: g }));
                                                }}
                                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                                placeholder="Misafir adı"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Telefon (Opsiyonel)</label>
                                            <PhoneInput
                                                country={'tr'}
                                                value={guest.phone}
                                                onChange={phone => {
                                                    const g = [...form.additionalGuests];
                                                    g[idx].phone = phone.startsWith('+') ? phone : '+' + phone;
                                                    setForm(f => ({ ...f, additionalGuests: g }));
                                                }}
                                                containerClass="!w-full"
                                                inputClass="!w-full !h-[38px] !rounded-xl !border-slate-200 !text-sm focus:!border-indigo-500 !bg-white"
                                                buttonClass="!rounded-l-xl !border-slate-200 !bg-white"
                                                placeholder="5XX XXX XX XX"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase">TC Kimlik No</label>
                                            <input
                                                value={guest.identityNo}
                                                onChange={(e) => {
                                                    const g = [...form.additionalGuests];
                                                    g[idx].identityNo = e.target.value;
                                                    setForm(f => ({ ...f, additionalGuests: g }));
                                                }}
                                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                                                placeholder="11 Haneli"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Doğum Tarihi</label>
                                            <PremiumDatePicker
                                                value={guest.birthDate || ""}
                                                onChange={(date) => {
                                                    const g = [...form.additionalGuests];
                                                    g[idx].birthDate = date;
                                                    setForm(f => ({ ...f, additionalGuests: g }));
                                                }}
                                                today={new Date().toISOString().split('T')[0]}
                                                compact
                                            />
                                        </div>

                                        {/* Image Upload for this guest */}
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-slate-500 uppercase">Kimlik Fotoğrafı</label>
                                            <div className="flex items-center gap-3">
                                                {guest.identityPhotoUrl ? (
                                                    <div className="relative h-10 w-16 rounded-lg overflow-hidden border border-slate-200">
                                                        <Image src={guest.identityPhotoUrl} alt="Identity" fill className="object-cover" />
                                                        <button
                                                            onClick={() => {
                                                                const g = [...form.additionalGuests];
                                                                g[idx].identityPhotoUrl = "";
                                                                setForm(f => ({ ...f, additionalGuests: g }));
                                                            }}
                                                            className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="cursor-pointer group">
                                                        <div className="h-10 w-16 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center hover:border-indigo-400 group-hover:bg-indigo-50 transition-all">
                                                            {uploadingGuestIndex === idx ? (
                                                                <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full"></div>
                                                            ) : (
                                                                <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                                                            )}
                                                        </div>
                                                        <input
                                                            type="file"
                                                            className="sr-only"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file && handleFileUpload) await handleFileUpload(file, idx);
                                                            }}
                                                        />
                                                    </label>
                                                )}
                                                <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">Kimlik veya pasaport (Opsiyonel)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
