"use client";

import { useGuests } from "@/hooks/useGuests";
import { GuestListTable } from "@/app/components/guests/GuestListTable";
import { GuestDetailModal } from "@/app/components/guests/GuestDetailModal";
import { GuestCreateModal } from "@/app/components/guests/GuestCreateModal";
import { CSVUploadModal } from "@/app/components/guests/CSVUploadModal";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";


export default function GuestsPage() {
  const {
    loading,
    error,
    search,
    setSearch,
    currentPage,
    setCurrentPage,
    selectedGuest,
    reservations,
    folios,
    reservationsLoading,
    detailOpen,
    setDetailOpen,
    guests,
    totalPages,

    currentPageGuests,
    handleSelectGuest,

    deleteGuest,
    updateGuest
  } = useGuests();

  const queryClient = useQueryClient();
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const refreshGuests = () => {
    queryClient.invalidateQueries({ queryKey: ["guests"] });
  };

  return (
    <div className="space-y-6 italic-none">
      {/* Cards Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 shadow-sm shadow-emerald-100">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Toplam Misafir</p>
              <p className="text-lg font-black text-slate-900">{guests.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-sm shadow-indigo-100">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-3h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Aktif Konaklayan</p>
              <p className="text-lg font-black text-slate-900">{guests.filter(() => reservations.some(r => r.status === 'checked_in')).length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-100">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Bugün Check-in</p>
              <p className="text-lg font-black text-slate-900">{guests.filter(() => reservations.some(r => r.check_in_date.startsWith(new Date().toISOString().split('T')[0]))).length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-red-500 shadow-sm shadow-rose-100">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Bugün Check-out</p>
              <p className="text-lg font-black text-slate-900">{guests.filter(() => reservations.some(r => r.check_out_date.startsWith(new Date().toISOString().split('T')[0]))).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="border-b bg-slate-50/50 p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 group w-full">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="İsim, telefon, e-posta veya TC/Pasaport no ile ara..."
                  className="w-full rounded-xl border-2 border-slate-200 bg-white py-2 pl-10 pr-4 text-sm font-bold focus:border-emerald-500 focus:outline-none transition-all shadow-sm"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <button
                  onClick={() => setIsCSVModalOpen(true)}
                  className="w-full md:w-auto h-10 flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-100 bg-white px-6 text-xs font-bold text-emerald-700 shadow-sm hover:bg-emerald-50 hover:border-emerald-200 transition-all whitespace-nowrap"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  İçe Aktar
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full md:w-auto h-10 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 text-xs font-bold text-white shadow-lg shadow-emerald-100 hover:from-emerald-700 hover:to-teal-600 transition-all whitespace-nowrap"
                >
                  <span className="text-lg">+</span> Yeni Misafir
                </button>
              </div>
            </div>

            {/* Advanced Filters Placeholder */}
            <div className="flex flex-wrap gap-2">
              <select className="rounded-lg border bg-white px-3 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:border-emerald-500">
                <option value="">Durum (Hepsi)</option>
                <option value="in-house">Konaklayan</option>
                <option value="upcoming">Gelecek</option>
                <option value="past">Geçmiş</option>
              </select>
              <select className="rounded-lg border bg-white px-3 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:border-emerald-500">
                <option value="">VIP (Hepsi)</option>
                <option value="yes">Evet</option>
                <option value="no">Hayır</option>
              </select>
              <select className="rounded-lg border bg-white px-3 py-1.5 text-xs font-bold text-slate-600 focus:outline-none focus:border-emerald-500">
                <option value="">Kara Liste (Hepsi)</option>
                <option value="yes">Evet</option>
                <option value="no">Hayır</option>
              </select>
              <button className="text-xs font-bold text-slate-400 hover:text-slate-600 underline">Filtreleri Temizle</button>
            </div>
          </div>
        </div>

        {error && (
          <div className="m-6 rounded-2xl bg-rose-50 border border-rose-100 p-4 text-sm text-rose-600 font-medium flex items-center gap-3">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            {error}
          </div>
        )}

        <GuestListTable
          guests={currentPageGuests}
          loading={loading}
          onSelectGuest={handleSelectGuest}
        />

        {/* Pagination */}
        <div className="flex items-center justify-between border-t bg-slate-50/50 p-4 md:px-6 md:py-4">
          <p className="hidden md:block text-xs font-semibold text-slate-500">
            Toplam {totalPages} sayfa içerisinden {currentPage}. sayfa
          </p>
          <div className="flex w-full md:w-auto items-center justify-center gap-1.5 font-bold">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-indigo-200 hover:bg-white hover:text-indigo-600 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div className="flex h-9 min-w-[36px] items-center justify-center rounded-xl bg-indigo-600 px-3 text-xs text-white shadow-lg shadow-indigo-200">
              {currentPage}
            </div>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:border-indigo-200 hover:bg-white hover:text-indigo-600 disabled:opacity-30 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <GuestDetailModal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        guest={selectedGuest}
        reservations={reservations}
        folios={folios}
        onDelete={deleteGuest}
        onUpdate={updateGuest}
        isLoading={reservationsLoading}
      />
      <CSVUploadModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        onUploadComplete={refreshGuests}
      />
      <GuestCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refreshGuests}
      />
    </div>
  );
}
