"use client";

import React, { useState, useRef } from "react";
import { useGuests } from "@/hooks/useGuests";

interface CSVUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete: () => void;
}

type Step = 'upload' | 'mapping' | 'preview' | 'result';

export function CSVUploadModal({ isOpen, onClose, onUploadComplete }: CSVUploadModalProps) {
    const { checkDuplicateGuest, createGuest } = useGuests();
    const [step, setStep] = useState<Step>('upload');
    const [headers, setHeaders] = useState<string[]>([]);
    const [rawRows, setRawRows] = useState<string[][]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({
        full_name: "",
        phone: "",
        email: "",
        nationality: "",
        identity_no: "",
        birth_date: "",
    });
    const [importData, setImportData] = useState<Record<string, string>[]>([]);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState({ success: 0, failed: 0, duplicates: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const downloadTemplate = () => {
        const template = "full_name;phone;email;nationality;identity_no;birth_date\nAhmet Yilmaz;+905321234567;ahmet@example.com;TR;12345678901;1990-01-01";
        const blob = new Blob([template], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "misafir_sablonu.csv";
        link.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                const sep = text.includes(";") ? ";" : ",";
                const lines = text.split("\n").filter(l => l.trim());
                const rows = lines.map(line => {
                    const values: string[] = [];
                    let current = "";
                    let inQuotes = false;
                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        if (char === '"') inQuotes = !inQuotes;
                        else if (char === sep && !inQuotes) {
                            values.push(current.trim().replace(/^"|"$/g, ""));
                            current = "";
                        } else current += char;
                    }
                    values.push(current.trim().replace(/^"|"$/g, ""));
                    return values;
                });

                const detectedHeaders = rows[0];
                setHeaders(detectedHeaders);
                setRawRows(rows.slice(1));

                // Auto-mapping
                const newMapping = { ...mapping };
                detectedHeaders.forEach(h => {
                    const lowH = h.toLowerCase();
                    if (lowH.includes("ad") || lowH.includes("name")) newMapping.full_name = h;
                    if (lowH.includes("tel") || lowH.includes("phone") || lowH.includes("gsm")) newMapping.phone = h;
                    if (lowH.includes("mail") || lowH.includes("email")) newMapping.email = h;
                    if (lowH.includes("uyruk") || lowH.includes("nation")) newMapping.nationality = h;
                    if (lowH.includes("tc") || lowH.includes("kimlik") || lowH.includes("passport") || lowH.includes("identity")) newMapping.identity_no = h;
                    if (lowH.includes("doğum") || lowH.includes("birth")) newMapping.birth_date = h;
                });
                setMapping(newMapping);
                setStep('mapping');
            };
            reader.readAsText(selectedFile);
        }
    };

    const preparePreview = () => {
        const processed = rawRows.map(row => {
            const item: Record<string, string> = {};
            Object.entries(mapping).forEach(([dbKey, csvHeader]) => {
                if (csvHeader) {
                    const idx = headers.indexOf(csvHeader);
                    item[dbKey] = row[idx] || "";
                } else {
                    item[dbKey] = "";
                }
            });
            return item;
        });
        setImportData(processed);
        setStep('preview');
    };

    const startImport = async () => {
        setLoading(true);
        let success = 0;
        let failed = 0;
        let duplicates = 0;

        for (const guest of importData) {
            try {
                // Dedupe check
                const existing = await checkDuplicateGuest({
                    phone: guest.phone,
                    email: guest.email,
                    identity_no: guest.identity_no,
                    full_name: guest.full_name,
                    birth_date: guest.birth_date
                });

                if (existing) {
                    duplicates++;
                    continue; // Skip duplicates in simple import for now
                }

                await createGuest(guest);
                success++;
            } catch (e) {
                console.error(e);
                failed++;
            }
        }

        setResults({ success, failed, duplicates });
        setStep('result');
        onUploadComplete();
        setLoading(false);
    };

    const fields = [
        { label: "Ad Soyad", key: "full_name", required: true },
        { label: "Telefon", key: "phone", required: true },
        { label: "E-posta", key: "email" },
        { label: "Milliyet", key: "nationality" },
        { label: "Kimlik/Pasaport No", key: "identity_no" },
        { label: "Doğum Tarihi", key: "birth_date" },
    ];

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="border-b bg-slate-50/50 p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 leading-tight">Misafir İçe Aktar</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Excel veya CSV Listesi</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
                        <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {step === 'upload' && (
                        <div className="space-y-6 py-4">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-emerald-100 rounded-3xl p-12 text-center cursor-pointer hover:bg-emerald-50 transition-all group"
                            >
                                <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                                <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                                </div>
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">CSV Dosyası Yükleyin</h4>
                                <p className="text-xs text-slate-400 mt-2">Sürükle bırak veya bilgisayarından seç</p>
                            </div>
                            <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                                <div>
                                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Örnek Şablon</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Eşleşme Sorunu Yaşamamak İçin Şablonu Kullanın</p>
                                </div>
                                <button onClick={downloadTemplate} className="text-xs font-black text-emerald-600 uppercase tracking-widest hover:text-emerald-700">Şablonu İndir</button>
                            </div>
                        </div>
                    )}

                    {step === 'mapping' && (
                        <div className="space-y-6">
                            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex gap-3">
                                <svg className="h-5 w-5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                                <p className="text-[11px] font-bold text-amber-700 uppercase leading-normal italic">CSV sütun başlıklarını sistemdeki alanlarla eşleştirin. Yıldızlı alanlar zorunludur.</p>
                            </div>
                            <div className="space-y-3">
                                {fields.map(f => (
                                    <div key={f.key} className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <label className="text-xs font-black text-slate-600 uppercase tracking-tight">{f.label} {f.required && "*"}</label>
                                        <select
                                            value={mapping[f.key]}
                                            onChange={e => setMapping({ ...mapping, [f.key]: e.target.value })}
                                            className="min-w-[200px] rounded-lg border-2 border-slate-100 bg-white px-3 py-1.5 text-xs font-bold focus:border-emerald-500 outline-none"
                                        >
                                            <option value="">Eşleştirme Yok</option>
                                            {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={preparePreview}
                                disabled={!mapping.full_name || !mapping.phone}
                                className="w-full mt-4 rounded-2xl bg-emerald-600 py-3 text-xs font-black text-white uppercase tracking-widest hover:bg-emerald-700 shadow-lg"
                            >
                                Kontrol Et ve Devam Et
                            </button>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-6">
                            <div className="bg-white border rounded-2xl overflow-hidden">
                                <div className="bg-slate-50 px-4 py-2 border-b flex justify-between items-center">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Veri Önizleme ({importData.length} Kayıt)</p>
                                </div>
                                <div className="max-h-[300px] overflow-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-slate-50 sticky top-0 uppercase tracking-tighter text-[10px] text-slate-400">
                                            <tr>
                                                <th className="p-3 font-black">AD SOYAD</th>
                                                <th className="p-3 font-black">TELEFON</th>
                                                <th className="p-3 font-black">EYLEM</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-bold">
                                            {importData.slice(0, 50).map((row, i) => (
                                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-3 text-slate-800 truncate max-w-[150px]">{row.full_name}</td>
                                                    <td className="p-3 text-slate-500">{row.phone}</td>
                                                    <td className="p-3"><button className="text-[10px] text-rose-500 hover:underline" onClick={() => setImportData(importData.filter((_, idx) => idx !== i))}>Kaldır</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <button
                                onClick={startImport}
                                disabled={loading}
                                className="w-full rounded-2xl bg-emerald-600 py-3 text-xs font-black text-white uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100"
                            >
                                {loading ? "İçeri Aktarılıyor..." : "Aktarımı Başlat"}
                            </button>
                        </div>
                    )}

                    {step === 'result' && (
                        <div className="py-8 text-center space-y-6">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-500 shadow-sm border border-emerald-100 animate-bounce">
                                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-black text-slate-900 leading-tight">İçerik Aktarımı Başarıyla Tamamlandı!</h4>
                                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto mt-6">
                                    <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-100">
                                        <p className="text-lg font-black text-emerald-600">{results.success}</p>
                                        <p className="text-[9px] font-black text-emerald-500 uppercase">Eklenen</p>
                                    </div>
                                    <div className="bg-amber-50 rounded-2xl p-3 border border-amber-100">
                                        <p className="text-lg font-black text-amber-600">{results.duplicates}</p>
                                        <p className="text-[9px] font-black text-amber-500 uppercase">Dükerrer</p>
                                    </div>
                                    <div className="bg-rose-50 rounded-2xl p-3 border border-rose-100">
                                        <p className="text-lg font-black text-rose-600">{results.failed}</p>
                                        <p className="text-[9px] font-black text-rose-500 uppercase">Hatalı</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} className="w-full max-w-xs mx-auto mt-4 rounded-2xl border-2 border-slate-100 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all">Tamamla ve Kapat</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
