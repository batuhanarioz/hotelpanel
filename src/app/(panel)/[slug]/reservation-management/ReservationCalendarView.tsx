"use client";

import { useReservationManagement, CalendarReservation } from "@/hooks/useReservationManagement";
import { CalendarHeader } from "@/app/components/reservations/CalendarHeader";
import { CalendarGrid } from "@/app/components/reservations/CalendarGrid";
import { ReservationModal } from "@/app/components/reservations/ReservationModal";

interface ReservationCalendarViewProps {
    initialReservations: CalendarReservation[];
    hotelId: string;
    slug: string;
}

export default function ReservationCalendarView({ initialReservations, hotelId, slug }: ReservationCalendarViewProps) {
    const {
        today,
        selectedDate,
        setSelectedDate,
        reservations,
        reservationsLoading,
        modalOpen,
        editing,
        formTime,
        setFormTime,
        formDate,
        setFormDate,
        staffMembers,
        guestSearch,
        setGuestSearch,
        guestSearchResults,
        guestSearchLoading,
        selectedGuestId,
        setSelectedGuestId,
        duplicateGuest,
        form,
        setForm,
        guestMatchInfo,
        isNewGuest,
        conflictWarning,
        matchedGuestPreferences,
        matchedGuestPassport,
        openNew,
        openEdit,
        handleSubmit,
        handleCancel,
        handleUseDuplicate,
        closeModal,
        todaySchedule,
        isDayOff,
        workingHourSlots,
        rooms
    } = useReservationManagement({ reservations: initialReservations, hotelId, slug });

    return (
        <div className="space-y-6">
            <CalendarHeader
                selectedDate={selectedDate}
                today={today}
                onDateChange={setSelectedDate}
                onTodayClick={() => setSelectedDate(today)}
                onNewReservationClick={() => openNew()}
                reservationCount={reservations.length}
            />

            <section className="rounded-2xl md:rounded-3xl border bg-white p-3 md:p-6 shadow-sm relative min-h-[400px]">
                {reservationsLoading && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-indigo-100 overflow-hidden">
                        <div className="h-full bg-indigo-600 animate-progress origin-left" />
                    </div>
                )}
                <CalendarGrid
                    reservations={reservations}
                    workingHourSlots={workingHourSlots}
                    isDayOff={isDayOff}
                    onSlotClick={(hour) => openNew(selectedDate, `${hour.toString().padStart(2, "0")}:00`)}
                    onEditClick={openEdit}
                />
            </section>

            {modalOpen && (
                <ReservationModal
                    isOpen={modalOpen}
                    onClose={closeModal}
                    editing={editing}
                    formDate={formDate}
                    setFormDate={setFormDate}
                    formTime={formTime}
                    setFormTime={setFormTime}
                    today={today}
                    todaySchedule={todaySchedule}
                    form={form}
                    setForm={setForm}
                    staffMembers={staffMembers}
                    guestSearch={guestSearch}
                    setGuestSearch={setGuestSearch}
                    guestSearchResults={guestSearchResults}
                    guestSearchLoading={guestSearchLoading}
                    selectedGuestId={selectedGuestId}
                    setSelectedGuestId={setSelectedGuestId}
                    duplicateGuest={duplicateGuest}
                    isNewGuest={isNewGuest}
                    guestMatchInfo={guestMatchInfo}
                    matchedGuestPreferences={matchedGuestPreferences}
                    matchedGuestPassport={matchedGuestPassport}
                    conflictWarning={conflictWarning}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                    handleUseDuplicate={handleUseDuplicate}
                    rooms={rooms}
                />
            )}

            <style jsx>{`
                @keyframes progress {
                    0% { transform: scaleX(0); }
                    50% { transform: scaleX(0.5); }
                    100% { transform: scaleX(1); }
                }
                .animate-progress {
                    animation: progress 1s infinite linear;
                }
            `}</style>
        </div>
    );
}
