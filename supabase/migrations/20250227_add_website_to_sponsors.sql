-- Migration: add_website_to_sponsors
-- Created at: 2025-02-27

-- Add website field to sponsors table
ALTER TABLE api.sponsors ADD COLUMN website TEXT;

-- @UNDO
-- Remove website field from sponsors table
-- ALTER TABLE api.sponsors DROP COLUMN website;
