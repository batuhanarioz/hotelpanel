-- Performance optimization indexes for reservations list filtering
CREATE INDEX IF NOT EXISTS idx_reservations_hotel_check_in ON public.reservations (hotel_id, check_in_date);
CREATE INDEX IF NOT EXISTS idx_reservations_hotel_check_out ON public.reservations (hotel_id, check_out_date);
CREATE INDEX IF NOT EXISTS idx_reservations_hotel_status ON public.reservations (hotel_id, status);
CREATE INDEX IF NOT EXISTS idx_reservations_hotel_reservation_number ON public.reservations (hotel_id, reservation_number);

-- Index for guest phone searches
CREATE INDEX IF NOT EXISTS idx_guests_hotel_phone ON public.guests (hotel_id, phone);
