"use client";

import { Suspense, useState } from "react";
import { useFolio, LedgerItemType } from "@/hooks/useFolio";
import { PremiumDatePicker } from "@/app/components/PremiumDatePicker";
import { FolioStats } from "@/app/components/folio/FolioStats";
import { FolioList } from "@/app/components/folio/FolioList";
import { FolioDrawer } from "@/app/components/folio/FolioDrawer";
import { PaymentActionModal } from "@/app/components/folio/PaymentActionModal";
import { GlobalFinanceModal } from "@/app/components/folio/GlobalFinanceModal";

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium animate-pulse italic">Yükleniyor...</div>}>
      <FolioInner />
    </Suspense>
  );
}

function FolioInner() {
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);

  const {
    today, listSearch, setListSearch, selectedDate, setSelectedDate, viewMode, setViewMode,
    folios, loading, stats,
    page, setPage, pageSize, setPageSize, totalCount,
    statusFilter, setStatusFilter, currencyFilter, setCurrencyFilter, roomSearch, setRoomSearch,
    isDrawerOpen, selectedFolio, openDrawer, closeDrawer,
    isPaymentModalOpen, setIsPaymentModalOpen,
    paymentAmount, setPaymentAmount, paymentMethod, setPaymentMethod,
    paymentNote, setPaymentNote, paymentType, setPaymentType,
    paymentCurrency, setPaymentCurrency,
    referenceNo, setReferenceNo,
    savingPayment, handleAddFolioItem, submitGlobalFinanceItem,
    toast, itemToCancel, setItemToCancel, requestCancelFolioItem, confirmCancelFolioItem,
    auditLogs, userRole
  } = useFolio();

  const handleOpenPaymentForm = (type: LedgerItemType) => {
    setPaymentType(type);

    // UI Validation: Auto-fill based on accounting rules
    if (type === "payment" && selectedFolio && selectedFolio.balance > 0) {
      setPaymentAmount(selectedFolio.balance.toString());
      setPaymentMethod("CASH");
    } else if (type === "refund" && selectedFolio) {
      const possibleRefund = selectedFolio.balance < 0 ? Math.abs(selectedFolio.balance) : selectedFolio.total_payments;
      setPaymentAmount(possibleRefund > 0 ? possibleRefund.toString() : "");
      setPaymentMethod("CASH");
    } else {
      setPaymentAmount("");
      if (type === "service_charge") setPaymentMethod("Diğer");
      else setPaymentMethod("");
    }

    setPaymentNote("");
    setReferenceNo("");
    setIsPaymentModalOpen(true);
  };

  const handlePrint = () => {
    window.print(); // Simple print implementation
  };

  const handleExportPdf = () => {
    alert("PDF dışa aktarma işlemi çok yakında eklenecektir.");
  };

  return (
    <div className="space-y-6 pb-20 italic-none">
      {/* Top KPI Cards */}
      <FolioStats stats={stats} />

      {/* Tools Area */}
      <div className="bg-white p-3 rounded-2xl border shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex items-center gap-2 grow sm:grow-0">
            <PremiumDatePicker value={selectedDate} onChange={setSelectedDate} today={today} />
            <button onClick={() => setSelectedDate(today)} className="h-10 px-4 rounded-xl border bg-slate-50 text-[11px] font-black text-slate-600 hover:bg-slate-100 transition-all uppercase tracking-tight">Bugün</button>
          </div>

          <div className="flex grow sm:grow-0 rounded-xl bg-slate-100 p-1">
            {(["day", "week", "month"] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)} className={`flex-1 sm:px-5 py-1.5 text-[11px] font-black rounded-lg transition-all uppercase tracking-tight ${viewMode === m ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                {m === 'day' ? 'Gün' : m === 'week' ? 'Hafta' : 'Ay'}
              </button>
            ))}
          </div>

          <div className="sm:ml-auto relative flex-1 group sm:max-w-xs">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              className="w-full h-11 sm:h-10 rounded-xl border bg-slate-50 pl-10 pr-4 text-[11px] font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
              placeholder="Misafir adı veya oda no ara..."
            />
          </div>

          <button
            onClick={() => setIsGlobalModalOpen(true)}
            className="h-11 sm:h-10 px-5 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-black uppercase tracking-widest text-slate-600 transition-all active:scale-95 whitespace-nowrap shrink-0 flex items-center gap-2 shadow-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            <span className="hidden sm:inline">Yeni</span> Finans Hareketi
          </button>
        </div>
      </div>

      {/* Folio List */}
      <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1fr_1.5fr_auto_auto] gap-4 items-center px-6 py-3 bg-slate-50/50 border-b text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
          <span>Misafir / Oda</span>
          <span>Konaklama</span>
          <span>Finansal Özet</span>
          <span>Kalan Bakiye</span>
          <span className="text-right">Durum</span>
          <span className="text-right ml-10">İşlem</span>
        </div>
        <div className="sm:hidden grid grid-cols-[2fr_1fr_auto] gap-2 items-center px-4 py-3 bg-slate-50/50 border-b text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
          <span>Misafir (Oda)</span>
          <span className="text-right">Bakiye</span>
          <span className="text-right">Durum</span>
        </div>

        <FolioList
          folios={folios}
          loading={loading}
          onViewFolio={openDrawer}
          roomSearch={roomSearch}
          setRoomSearch={setRoomSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          currencyFilter={currencyFilter}
          setCurrencyFilter={setCurrencyFilter}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalCount={totalCount}
        />
      </div>



      {/* Drawers & Modals */}
      <FolioDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        folio={selectedFolio}
        onOpenPaymentForm={handleOpenPaymentForm}
        onPrint={handlePrint}
        onExportPdf={handleExportPdf}
        onCancelFolioItem={requestCancelFolioItem}
        auditLogs={auditLogs}
        userRole={userRole}
      />

      <PaymentActionModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSubmit={() => handleAddFolioItem()}
        type={paymentType}
        amount={paymentAmount}
        setAmount={setPaymentAmount}
        method={paymentMethod}
        setMethod={setPaymentMethod}
        note={paymentNote}
        setNote={setPaymentNote}
        saving={savingPayment}
        currency={paymentCurrency}
        setCurrency={(v) => setPaymentCurrency(v as "TRY" | "USD" | "EUR" | "GBP")}
        referenceNo={referenceNo}
        setReferenceNo={setReferenceNo}
        totalCharges={selectedFolio?.total_charges}
        totalPayments={selectedFolio?.total_payments}
        balance={selectedFolio?.balance}
        userRole={userRole}
      />

      <GlobalFinanceModal
        isOpen={isGlobalModalOpen}
        onClose={() => setIsGlobalModalOpen(false)}
        folios={folios}
        onSubmit={async (folioId, amount, currency, rate, type, method, note, referenceNo) =>
          submitGlobalFinanceItem(folioId, amount, currency, type, method, note, referenceNo)
        }
      />

      {/* Confirmation Modal for Reversals */}
      {itemToCancel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 italic-none">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setItemToCancel(null)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl p-6 transform transition-all text-center">
            <div className="w-12 h-12 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight mb-2">
              İşlemi İptal Et
            </h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              Bu işlemi iptal etmek istediğinize emin misiniz? Arka planda <b className="text-slate-700">ters kayıt (reversal)</b> oluşturulacaktır.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                onClick={() => setItemToCancel(null)}
              >
                Vazgeç
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-md shadow-rose-200 transition-colors"
                onClick={() => confirmCancelFolioItem()}
              >
                Evet, İptal Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Overlay */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-5 duration-300">
          <div className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 min-w-[320px] ${toast.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' :
            toast.type === 'error' ? 'bg-rose-500 text-white border-rose-400' :
              'bg-slate-800 text-white border-slate-700'
            }`}>
            {toast.type === 'success' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
            {toast.type === 'info' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            {toast.type === 'error' && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
            <span className="font-bold text-sm">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
