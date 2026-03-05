import React from "react";
import { ModalHeader } from "./modal/ModalHeader";
import { DateTimeSection } from "./modal/DateTimeSection";
import { GuestPicker } from "./modal/GuestPicker";
import { ReservationDetails } from "./modal/ReservationDetails";
import { GuestNotes } from "./modal/GuestNotes";
import { ModalFooter } from "./modal/ModalFooter";
import { CalendarReservation, ReservationFormState, GuestSearchResult } from "@/hooks/useReservationManagement";

interface ReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    editing: CalendarReservation | null;
    formDate: string;
    setFormDate: (date: string) => void;
    formTime: string;
    setFormTime: (time: string) => void;
    today: string;
    todaySchedule: { open: string; close: string; enabled: boolean } | undefined;
    form: ReservationFormState;
    setForm: React.Dispatch<React.SetStateAction<ReservationFormState>>;
    staffMembers: string[];
    guestSearch: string;
    setGuestSearch: (val: string) => void;
    guestSearchResults: GuestSearchResult[];
    guestSearchLoading: boolean;
    selectedGuestId: string;
    setSelectedGuestId: (val: string) => void;
    duplicateGuest: GuestSearchResult | null;
    isNewGuest: boolean;
    guestMatchInfo: string | null;
    matchedGuestPreferences: string | null;
    matchedGuestPassport: string | null;
    conflictWarning: string | null;
    handleSubmit: (e: React.FormEvent) => void;
    handleDelete: () => void;
    handleUseDuplicate: () => void;
    rooms: { id: string; room_number: string; room_type?: { name: string; }[] }[];
    isUploading?: boolean;
    handleFileUpload?: (file: File, idx?: number) => Promise<string | null>;
    uploadingGuestIndex?: number | null;
}

export function ReservationModal(props: ReservationModalProps) {
    const [autoAssign, setAutoAssign] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [showMoreInfo, setShowMoreInfo] = React.useState(false);

    if (!props.isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto" onClick={props.onClose}>
            <div className="bg-white rounded-3xl shadow-2xl border w-full max-w-2xl mx-auto overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                <ModalHeader
                    editing={!!props.editing}
                    formDate={props.formDate}
                    formTime={props.formTime}
                    onClose={props.onClose}
                    onSubmit={(e) => {
                        if (autoAssign) {
                            // Logic for auto-assignment could be handled here or inside props.handleSubmit
                            // Since props.handleSubmit is passed from parent, we should ensure it knows about autoAssign
                        }
                        props.handleSubmit(e);
                    }}
                />

                <div className="relative max-h-[80vh] flex flex-col italic-none">
                    <div className="px-6 py-5 overflow-y-auto">
                        <form id="appointment-form" onSubmit={(e) => {
                            if (autoAssign) {
                                // If autoAssign is checked, we might want to tell the parent or handle it after creation
                            }
                            props.handleSubmit(e);
                        }} className="grid gap-3 md:grid-cols-2">
                            <DateTimeSection
                                formDate={props.formDate}
                                setFormDate={props.setFormDate}
                                formTime={props.formTime}
                                setFormTime={props.setFormTime}
                                today={props.today}
                                form={props.form}
                                setForm={props.setForm}
                                rooms={props.rooms}
                            />

                            {props.conflictWarning && (
                                <div className="col-span-2 p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between group animate-in slide-in-from-top-2">
                                    <div className="flex items-center gap-2 text-rose-600">
                                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 14c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <span className="text-[11px] font-black uppercase tracking-tight">{props.conflictWarning}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="text-[10px] font-black uppercase bg-white px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                        onClick={() => {
                                            // TODO: Implement "Show Available Rooms" logic
                                            // For now, let's just log or set a filter state if available
                                            alert("Uygun odalar özelliği yakında eklenecek.");
                                        }}
                                    >
                                        Uygun Odalar
                                    </button>
                                </div>
                            )}

                            <GuestPicker
                                selectedGuestId={props.selectedGuestId}
                                setSelectedGuestId={props.setSelectedGuestId}
                                guestSearch={props.guestSearch}
                                setGuestSearch={props.setGuestSearch}
                                guestSearchResults={props.guestSearchResults}
                                guestSearchLoading={props.guestSearchLoading}
                                setForm={props.setForm}
                                duplicateGuest={props.duplicateGuest}
                                handleUseDuplicate={props.handleUseDuplicate}
                                form={props.form}
                                isNewGuest={props.isNewGuest}
                                matchedGuestPreferences={props.matchedGuestPreferences}
                                matchedGuestPassport={props.matchedGuestPassport}
                                guestMatchInfo={props.guestMatchInfo}
                                showAllInfo={showMoreInfo}
                                isUploading={props.isUploading}
                                handleFileUpload={props.handleFileUpload}
                                uploadingGuestIndex={props.uploadingGuestIndex}
                            />

                            {showMoreInfo && (
                                <>
                                    <ReservationDetails
                                        form={props.form}
                                        setForm={props.setForm}
                                        editing={props.editing}
                                        staffMembers={props.staffMembers}
                                        today={props.today}
                                    />

                                    <GuestNotes
                                        form={props.form}
                                        setForm={props.setForm}
                                    />
                                </>
                            )}

                            {/* Auto Assign Toggle */}
                            {!props.form.roomId && !props.editing && (
                                <div className="col-span-2 mt-2 p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-none">Akıllı Atama Sistemi</span>
                                        </div>
                                        <span className="text-[9px] text-emerald-600/70 font-bold leading-none">Uygun en iyi odayı sistem otomatik seçsin</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={autoAssign}
                                            onChange={(e) => setAutoAssign(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-emerald-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-emerald-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 shadow-inner group-hover:scale-110 transition-transform"></div>
                                    </label>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* ALWAYS VISIBLE TOGGLE BUTTON (Sticky) */}
                    <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent px-6 py-3 border-t border-slate-50 flex justify-center z-10">
                        <button
                            type="button"
                            onClick={() => setShowMoreInfo(!showMoreInfo)}
                            className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 backdrop-blur-sm px-5 py-2.5 text-xs font-bold text-indigo-700 shadow-sm hover:bg-indigo-100 hover:border-indigo-200 transition-all active:scale-95 group"
                        >
                            {showMoreInfo ? "Detayları Gizle" : "Daha Fazla Bilgi (Notlar, Ücret, vb.)"}
                            <svg
                                className={`h-4 w-4 transition-transform duration-300 ${showMoreInfo ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2.5}
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                    </div>

                    <div className="px-6 pb-5">
                        <ModalFooter
                            editing={!!props.editing}
                            handleDelete={props.handleDelete}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
