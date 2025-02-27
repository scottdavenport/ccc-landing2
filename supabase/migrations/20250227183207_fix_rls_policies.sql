-- Fix RLS policies for sponsors table
-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON api.sponsors;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON api.sponsors;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON api.sponsors;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON api.sponsors;

-- Ensure RLS is enabled on the sponsors table
ALTER TABLE api.sponsors ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper permissions
-- Allow anyone to read sponsors data
CREATE POLICY "Enable read access for all users" ON api.sponsors
    FOR SELECT USING (true);

-- Allow authenticated users to insert, update, and delete
CREATE POLICY "Enable insert for authenticated users only" ON api.sponsors
    FOR INSERT WITH CHECK (auth.jwt() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users only" ON api.sponsors
    FOR UPDATE USING (auth.jwt() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users only" ON api.sponsors
    FOR DELETE USING (auth.jwt() IS NOT NULL);

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'sponsors'; 