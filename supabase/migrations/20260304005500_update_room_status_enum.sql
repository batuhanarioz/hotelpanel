-- 1. Part: Add new status values to the enum
-- Transitioning to uppercase enterprise status names
ALTER TYPE public.room_status ADD VALUE IF NOT EXISTS 'DIRTY';
ALTER TYPE public.room_status ADD VALUE IF NOT EXISTS 'CLEANING';
ALTER TYPE public.room_status ADD VALUE IF NOT EXISTS 'CLEAN';
ALTER TYPE public.room_status ADD VALUE IF NOT EXISTS 'INSPECTED';
ALTER TYPE public.room_status ADD VALUE IF NOT EXISTS 'OOO';
ALTER TYPE public.room_status ADD VALUE IF NOT EXISTS 'OCCUPIED';
