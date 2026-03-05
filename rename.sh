#!/bin/bash
cd /Users/batuhanarioz/Desktop/dentistpanel-main/src

# Folders
mv app/\(panel\)/\[slug\]/patients app/\(panel\)/\[slug\]/guests
mv app/\(panel\)/\[slug\]/appointment-management app/\(panel\)/\[slug\]/reservation-management
mv app/\(panel\)/\[slug\]/appointments app/\(panel\)/\[slug\]/reservations
mv app/\(panel\)/platform/clinics app/\(panel\)/platform/hotels
mv app/api/automations/appointments app/api/automations/reservations
mv app/api/channels/web-appointment app/api/channels/web-reservation
mv app/api/admin/clinics app/api/admin/hotels
mv app/appointments app/reservations
mv app/patients app/guests
mv app/components/appointments app/components/reservations
mv app/components/patients app/components/guests
mv app/components/platform/clinics app/components/platform/hotels
mv legacy/appointments legacy/reservations
mv legacy/patients legacy/guests

# Files - appointments -> reservations
mv app/\(panel\)/\[slug\]/reservation-management/AppointmentCalendarView.tsx app/\(panel\)/\[slug\]/reservation-management/ReservationCalendarView.tsx
mv app/components/reservations/AppointmentModal.tsx app/components/reservations/ReservationModal.tsx
mv app/components/reservations/modal/AppointmentDetails.tsx app/components/reservations/modal/ReservationDetails.tsx
mv app/components/dashboard/AppointmentDetailDrawer.tsx app/components/dashboard/ReservationDetailDrawer.tsx
mv app/components/dashboard/AppointmentsSection.tsx app/components/dashboard/ReservationsSection.tsx
mv constants/appointments.ts constants/reservations.ts
mv hooks/useAppointmentManagement.ts hooks/useReservationManagement.ts
mv lib/validations/appointment.ts lib/validations/reservation.ts
mv lib/validations/appointment.test.ts lib/validations/reservation.test.ts

# Files - patients -> guests
mv app/components/reservations/modal/PatientNotes.tsx app/components/reservations/modal/GuestNotes.tsx
mv app/components/reservations/modal/PatientPicker.tsx app/components/reservations/modal/GuestPicker.tsx
mv app/components/guests/PatientDetailModal.tsx app/components/guests/GuestDetailModal.tsx
mv app/components/guests/PatientListTable.tsx app/components/guests/GuestListTable.tsx
mv hooks/usePatients.ts hooks/useGuests.ts
mv lib/validations/patient.ts lib/validations/guest.ts
mv lib/validations/patient.test.ts lib/validations/guest.test.ts

# Files - clinics -> hotels
mv app/components/platform/hotels/ClinicList.tsx app/components/platform/hotels/HotelList.tsx
mv app/components/platform/hotels/ClinicModal.tsx app/components/platform/hotels/HotelModal.tsx
mv app/context/ClinicContext.tsx app/context/HotelContext.tsx
mv lib/validations/clinic.ts lib/validations/hotel.ts

echo "Done"
