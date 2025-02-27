
-- Migration: add_website_to_sponsors
-- Created at: 2025-02-27

-- Add website column to sponsors table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'api'
        AND table_name = 'sponsors'
        AND column_name = 'website'
    ) THEN
        ALTER TABLE api.sponsors
        ADD COLUMN website TEXT;
    END IF;
END $$;