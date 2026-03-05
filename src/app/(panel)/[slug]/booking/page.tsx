import BookingBoard from "@/app/components/reservations/BookingBoard";

export default function AppointmentsPage() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex-1 min-h-0">
        <BookingBoard />
      </div>
    </div>
  );
}
