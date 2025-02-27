-- Migration: sponsor_website_field
-- Created at: 2025-02-27 13:42:25

-- Add website field to sponsors table
ALTER TABLE api.sponsors ADD COLUMN IF NOT EXISTS website TEXT;

-- Grant permissions to access the website column
GRANT SELECT ON api.sponsors TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON api.sponsors TO authenticated;

-- @UNDO
-- Remove website field from sponsors table
-- ALTER TABLE api.sponsors DROP COLUMN website;
