-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS api;

-- Create or replace function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION api.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for sponsor_levels table
DROP TRIGGER IF EXISTS set_api_sponsor_levels_updated_at ON api.sponsor_levels;
CREATE TRIGGER set_api_sponsor_levels_updated_at
BEFORE UPDATE ON api.sponsor_levels
FOR EACH ROW
EXECUTE FUNCTION api.set_updated_at();

-- Create trigger for sponsors table
DROP TRIGGER IF EXISTS set_api_sponsors_updated_at ON api.sponsors;
CREATE TRIGGER set_api_sponsors_updated_at
BEFORE UPDATE ON api.sponsors
FOR EACH ROW
EXECUTE FUNCTION api.set_updated_at();
