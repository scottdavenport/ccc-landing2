-- Create API schema and set up permissions
CREATE SCHEMA IF NOT EXISTS api;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA api TO authenticated, anon, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA api GRANT ALL ON TABLES TO authenticated, anon, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA api GRANT ALL ON FUNCTIONS TO authenticated, anon, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA api GRANT ALL ON SEQUENCES TO authenticated, anon, service_role;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS api.sponsors CASCADE;
DROP TABLE IF EXISTS api.sponsor_levels CASCADE;

-- Create sponsor_levels table first (referenced by sponsors)
CREATE TABLE api.sponsor_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sponsors table
CREATE TABLE api.sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    level UUID NOT NULL REFERENCES api.sponsor_levels(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    cloudinary_public_id TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE api.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.sponsor_levels ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON api.sponsors;
DROP POLICY IF EXISTS "Enable read access for all users" ON api.sponsor_levels;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON api.sponsors;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON api.sponsors;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON api.sponsors;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON api.sponsor_levels;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON api.sponsor_levels;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON api.sponsor_levels;

-- Create policies
CREATE POLICY "Enable read access for all users" ON api.sponsors
    FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON api.sponsor_levels
    FOR SELECT USING (true);

-- Create policies for authenticated users
CREATE POLICY "Enable insert for authenticated users only" ON api.sponsors
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON api.sponsors
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON api.sponsors
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON api.sponsor_levels
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON api.sponsor_levels
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON api.sponsor_levels
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert default sponsor level
INSERT INTO api.sponsor_levels (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Gold')
ON CONFLICT (id) DO NOTHING;
