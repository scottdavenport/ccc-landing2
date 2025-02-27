-- Add web_url column to sponsors table
ALTER TABLE api.sponsors ADD COLUMN IF NOT EXISTS web_url TEXT;

-- Update the RLS policies to include the new column
-- No need to recreate policies as they apply to the entire row 