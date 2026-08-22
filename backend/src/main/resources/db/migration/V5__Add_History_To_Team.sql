-- Add bilingual history columns to team table
ALTER TABLE team ADD COLUMN history_en TEXT;
ALTER TABLE team ADD COLUMN history_el TEXT;
