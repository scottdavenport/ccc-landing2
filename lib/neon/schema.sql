-- Create api schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS api;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS api.sponsors CASCADE;
DROP TABLE IF EXISTS api.sponsor_levels CASCADE;

-- Create sponsor_levels table first (referenced by sponsors)
CREATE TABLE api.sponsor_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    amount NUMERIC,
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

-- Insert default sponsor level
INSERT INTO api.sponsor_levels (id, name)
VALUES ('00000000-0000-0000-0000-000000000001', 'Gold')
ON CONFLICT (id) DO NOTHING; 