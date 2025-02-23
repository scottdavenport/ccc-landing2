-- Insert default sponsor level
INSERT INTO api.sponsor_levels (id, name)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Gold')
ON CONFLICT (id) DO NOTHING;
