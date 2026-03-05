"use client";

import React from "react";

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    itemName?: string;
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Rezervasyonu Sil",
    description = "Bu işlem geri alınamaz. Rezervasyon kalıcı olarak silinecektir.",
    confirmText = "Evet, Sil",
    cancelText = "Vazgeç",
    itemName
}: DeleteConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[3000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md mx-auto overflow-hidden animate-in zoom-in duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Icon */}
                <div className="bg-rose-50 px-6 py-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                        {title}
                    </h3>
                </div>

                {/* Body */}
                <div className="px-8 py-6 text-center">
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                        {description}
                    </p>
                    {itemName && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-sm font-black text-slate-700 uppercase">
                            {itemName}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 pb-8 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-200 text-xs font-black uppercase text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="flex-1 px-4 py-3.5 rounded-2xl bg-rose-600 text-white text-xs font-black uppercase shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
