-- Migration: Add website column to sponsors table
-- Date: 2025-02-27
-- Description: Adds a website URL column to the sponsors table for storing sponsor website links

-- Add website column to sponsors table
ALTER TABLE api.sponsors 
ADD COLUMN website TEXT;

-- Add comment to explain the purpose of the column
COMMENT ON COLUMN api.sponsors.website IS 'URL to the sponsor''s website';

-- Note: We're not making this column NOT NULL since:
-- 1. It's being added to an existing table that may already have data
-- 2. We want to maintain backward compatibility
-- 3. Not all sponsors may have websites

-- Update the RLS policies to ensure they apply to the new column
-- No need to create new policies as the existing ones will cover this column
