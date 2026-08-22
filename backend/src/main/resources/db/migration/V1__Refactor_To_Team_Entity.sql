-- Rename team_info to team
ALTER TABLE team_info RENAME TO team;

-- Add new columns to team table
ALTER TABLE team ADD COLUMN primary_logo_id VARCHAR(255);
ALTER TABLE team ADD COLUMN league_id VARCHAR(255);

-- Insert missing teams from team_logo into team
INSERT INTO team (id, name, league_id)
SELECT id, name, league_id FROM team_logo WHERE id NOT IN (SELECT id FROM team);

-- Update the name of existing teams using the name from team_logo
UPDATE team
SET name = (SELECT name FROM team_logo WHERE team_logo.id = team.id);

-- Add new columns to team_logo table
ALTER TABLE team_logo ADD COLUMN team_id VARCHAR(255);
ALTER TABLE team_logo ADD COLUMN start_year INTEGER;
ALTER TABLE team_logo ADD COLUMN end_year INTEGER;

-- Assuming current team_logos correspond 1:1 with teams (as was the old model)
UPDATE team_logo SET team_id = id;
UPDATE team SET primary_logo_id = id;

-- If league_id was on team_logo, migrate it to team (assuming team_logo.id = team.id)
UPDATE team 
SET league_id = (SELECT league_id FROM team_logo WHERE team_logo.id = team.id)
WHERE league_id IS NULL;

-- Drop league_id from team_logo
ALTER TABLE team_logo DROP COLUMN league_id;

-- Add foreign key constraints
ALTER TABLE team 
ADD CONSTRAINT fk_team_primary_logo 
FOREIGN KEY (primary_logo_id) REFERENCES team_logo (id);

ALTER TABLE team 
ADD CONSTRAINT fk_team_league 
FOREIGN KEY (league_id) REFERENCES league (id);

ALTER TABLE team_logo 
ADD CONSTRAINT fk_team_logo_team 
FOREIGN KEY (team_id) REFERENCES team (id);
