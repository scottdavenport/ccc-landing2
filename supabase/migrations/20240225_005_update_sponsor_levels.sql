-- First, add the amount column to the sponsor_levels table
ALTER TABLE api.sponsor_levels ADD COLUMN IF NOT EXISTS amount INTEGER NOT NULL DEFAULT 0;

-- Remove all existing sponsor levels
DELETE FROM api.sponsor_levels;

-- Insert new sponsor levels with their amounts
INSERT INTO api.sponsor_levels (name, amount) VALUES
    ('Champion', 5000),
    ('Eagle', 2500),
    ('Golf Gift', 2500),
    ('Celebration Lunch', 2500),
    ('Bloody Mary', 1000),
    ('Golf Cart', 1000),
    ('Celebration Wall', 700),
    ('Thursday Night', 700),
    ('Chick-Fil-A AM', 500),
    ('Bojangles PM', 500);

-- Update the updated_at timestamp
UPDATE api.sponsor_levels SET updated_at = NOW();
