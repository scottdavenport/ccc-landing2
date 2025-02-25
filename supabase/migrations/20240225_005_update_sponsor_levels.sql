-- First, add the amount column to the sponsor_levels table
ALTER TABLE api.sponsor_levels ADD COLUMN IF NOT EXISTS amount INTEGER NOT NULL DEFAULT 0;

-- Create a temporary table to store the new levels
CREATE TEMP TABLE temp_sponsor_levels (
    name TEXT NOT NULL,
    amount INTEGER NOT NULL
);

-- Insert the new levels into the temporary table
INSERT INTO temp_sponsor_levels (name, amount) VALUES
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

-- Create a mapping table for old to new levels (using the lowest amount as default)
CREATE TEMP TABLE level_mapping AS
SELECT 
    old.id as old_id,
    new.id as new_id
FROM api.sponsor_levels old
CROSS JOIN LATERAL (
    SELECT id 
    FROM api.sponsor_levels new
    WHERE new.amount = (
        SELECT MIN(amount) 
        FROM temp_sponsor_levels
    )
    LIMIT 1
) new;

-- Update any existing sponsors to use the mapped levels
UPDATE api.sponsors
SET level = level_mapping.new_id
FROM level_mapping
WHERE level = level_mapping.old_id;

-- Now safe to delete old levels
DELETE FROM api.sponsor_levels;

-- Insert new sponsor levels
INSERT INTO api.sponsor_levels (name, amount)
SELECT name, amount FROM temp_sponsor_levels;

-- Update timestamps
UPDATE api.sponsor_levels SET updated_at = NOW();

-- Clean up temporary tables
DROP TABLE temp_sponsor_levels;
DROP TABLE level_mapping;
