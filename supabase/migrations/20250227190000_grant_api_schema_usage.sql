-- Grant usage on api schema to anon role
GRANT USAGE ON SCHEMA api TO anon;

-- Grant select permissions on sponsors table to anon role
GRANT SELECT ON api.sponsors TO anon;

-- Grant select permissions on sponsor_levels table to anon role (if needed for joins)
GRANT SELECT ON api.sponsor_levels TO anon;
