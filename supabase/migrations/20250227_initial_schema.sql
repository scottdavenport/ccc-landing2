-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS api;

-- Create sponsor_levels table
CREATE TABLE IF NOT EXISTS api.sponsor_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    amount INTEGER NOT NULL DEFAULT 0
);

-- Create sponsors table
CREATE TABLE IF NOT EXISTS api.sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    level UUID NOT NULL REFERENCES api.sponsor_levels(id),
    year INTEGER NOT NULL,
    cloudinary_public_id TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    website TEXT
);

-- Add comment to tables
COMMENT ON TABLE api.sponsor_levels IS 'Table for storing different sponsorship levels';
COMMENT ON TABLE api.sponsors IS 'Table for storing sponsor information';
