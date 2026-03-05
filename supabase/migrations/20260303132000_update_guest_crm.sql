-- Update guests table
ALTER TABLE guests ADD COLUMN IF NOT EXISTS nationality text;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS id_type text; -- 'TC' or 'PASSPORT'
ALTER TABLE guests ADD COLUMN IF NOT EXISTS is_vip boolean DEFAULT false;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS is_blacklist boolean DEFAULT false;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS blacklist_reason text;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false;
ALTER TABLE guests ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '[]';
ALTER TABLE guests ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'; -- For smoking, bed type, etc.

-- Create guest_notes table
CREATE TABLE IF NOT EXISTS guest_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id uuid REFERENCES guests(id) ON DELETE CASCADE,
    hotel_id uuid REFERENCES hotels(id),
    content text NOT NULL,
    category text, -- 'General', 'Reservation', 'Problem', etc.
    created_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now()
);

-- Create guest_documents table
CREATE TABLE IF NOT EXISTS guest_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id uuid REFERENCES guests(id) ON DELETE CASCADE,
    hotel_id uuid REFERENCES hotels(id),
    document_type text, -- 'ID', 'PASSPORT', 'OTHER'
    file_path text NOT NULL,
    file_name text,
    expiry_date date,
    uploaded_by uuid REFERENCES users(id),
    created_at timestamptz DEFAULT now()
);

-- Indexes for performance and deduplication
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_identity_no ON guests(identity_no);
CREATE INDEX IF NOT EXISTS idx_guests_passport_number ON guests(passport_number);
