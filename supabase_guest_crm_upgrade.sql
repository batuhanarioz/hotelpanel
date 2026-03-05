-- GUEST CRM UPGRADE - DATABASE SCHEMA UPDATES

-- 1. MODIFICATION TO GUESTS TABLE
-- Note: Adjusting the existing guests table to support CRM features
ALTER TABLE guests 
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS id_type TEXT DEFAULT 'TC', -- 'TC' or 'PASSPORT'
ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_blacklist BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS blacklist_reason TEXT,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- 2. CREATE GUEST NOTES TABLE
CREATE TABLE IF NOT EXISTS guest_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL,
    created_by UUID, -- Link to user/staff
    note_type TEXT DEFAULT 'general', -- 'general', 'reservation', 'complaint'
    content TEXT NOT NULL,
    is_important BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE GUEST DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS guest_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL,
    document_type TEXT, -- 'ID', 'PASSPORT', 'KVKK', 'OTHER'
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_guests_phone ON guests(phone);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
CREATE INDEX IF NOT EXISTS idx_guests_identity ON guests(identity_no);
CREATE INDEX IF NOT EXISTS idx_guests_passport ON guests(passport_number);
CREATE INDEX IF NOT EXISTS idx_guest_notes_guest_id ON guest_notes(guest_id);

-- 5. RLS (ROW LEVEL SECURITY) - Ensure only hotel members can see their guests
ALTER TABLE guest_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_documents ENABLE ROW LEVEL SECURITY;

-- Dynamic Policies (Assuming auth.uid() and hotel_id association exists)
-- This is a template, actual implementation depends on existing RLS strategy
-- CREATE POLICY hotel_access_notes ON guest_notes USING (hotel_id IN (SELECT current_hotel_id FROM user_profiles WHERE id = auth.uid()));
-- CREATE POLICY hotel_access_docs ON guest_documents USING (hotel_id IN (SELECT current_hotel_id FROM user_profiles WHERE id = auth.uid()));
