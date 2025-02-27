-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS api;

-- Enable Row Level Security on the tables
ALTER TABLE api.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE api.sponsor_levels ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (read-only)
CREATE POLICY "Allow anonymous read access to sponsors"
  ON api.sponsors
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous read access to sponsor levels"
  ON api.sponsor_levels
  FOR SELECT
  TO anon
  USING (true);

-- Create policies for authenticated users (full access)
CREATE POLICY "Allow authenticated users full access to sponsors"
  ON api.sponsors
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users full access to sponsor levels"
  ON api.sponsor_levels
  FOR ALL
  TO authenticated
  USING (true);

-- Grant usage on schema to anon and authenticated roles
GRANT USAGE ON SCHEMA api TO anon, authenticated;

-- Grant select permissions to anon role
GRANT SELECT ON api.sponsors TO anon;
GRANT SELECT ON api.sponsor_levels TO anon;

-- Grant all permissions to authenticated role
GRANT ALL ON api.sponsors TO authenticated;
GRANT ALL ON api.sponsor_levels TO authenticated;
