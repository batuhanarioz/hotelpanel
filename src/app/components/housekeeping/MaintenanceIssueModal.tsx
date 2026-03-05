import React, { useState } from 'react';

interface MaintenanceIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    roomNumber: string;
    onSubmit: (description: string, priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT', category: string) => void;
}

export function MaintenanceIssueModal({ isOpen, onClose, roomNumber, onSubmit }: MaintenanceIssueModalProps) {
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
    const [category, setCategory] = useState('General');

    const categories = [
        { id: 'General', label: 'Genel', icon: '🔧' },
        { id: 'Electrical', label: 'Elektrik', icon: '⚡' },
        { id: 'Water', label: 'Su / Tesisat', icon: '🚰' },
        { id: 'Furniture', label: 'Mobilya', icon: '🪑' },
        { id: 'Air Conditioning', label: 'Klima / HVAC', icon: '❄️' },
    ];

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim()) {
            onSubmit(description, priority, category);
            setDescription('');
            setCategory('General');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-rose-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Arıza / Sorun Bildir</h3>
                            <p className="text-xs text-rose-600 font-semibold uppercase tracking-wider">Oda {roomNumber}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                        <div className="grid grid-cols-2 gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setCategory(cat.id)}
                                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-all ${category === cat.id
                                            ? 'bg-slate-800 text-white border-slate-900 shadow-md'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <span>{cat.icon}</span>
                                    <span>{cat.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Sorun Açıklaması</label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Arızayı veya eksik ürünü detaylandırın..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all min-h-[120px] resize-none"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-slate-700 mb-3">Öncelik Derecesi</label>
                        <div className="grid grid-cols-2 gap-2">
                            {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${priority === p
                                        ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-100'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    {p === 'LOW' && 'Düşük'}
                                    {p === 'MEDIUM' && 'Normal'}
                                    {p === 'HIGH' && 'Yüksek'}
                                    {p === 'URGENT' && 'ACİL'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-colors"
                        >
                            Vazgeç
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold shadow-lg shadow-rose-100 transition-all active:scale-95"
                        >
                            Bildirimi Gönder
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
