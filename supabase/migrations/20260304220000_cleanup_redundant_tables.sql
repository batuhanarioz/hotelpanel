-- Migration: Cleanup Redundant Tables & Columns
-- Approved by user on 2026-03-04
-- Based on ANALYSIS_REPORT.md

BEGIN;

-- 1. Remove legacy clinics table (replaced by hotels)
DROP TABLE IF EXISTS public.clinics CASCADE;

-- 2. Remove redundant folio_items (replaced by folio_transactions)
DROP TABLE IF EXISTS public.folio_items CASCADE;

-- 3. Remove unused guest_notes table (notes are in guests/reservations)
DROP TABLE IF EXISTS public.guest_notes CASCADE;

-- 4. Room & Floor Normalization
-- UI uses rooms.floor (text). floors table and rooms.floor_id are redundant.
ALTER TABLE public.rooms DROP COLUMN IF EXISTS floor_id;
DROP TABLE IF EXISTS public.floors CASCADE;

COMMIT;
