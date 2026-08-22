CREATE TABLE stadium (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    capacity INTEGER,
    location VARCHAR(255),
    image VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    region VARCHAR(255),
    temp_team_id VARCHAR(255) -- Temporary column for migration mapping
);

ALTER TABLE team ADD COLUMN stadium_id BIGINT;
ALTER TABLE team ADD CONSTRAINT fk_team_stadium FOREIGN KEY (stadium_id) REFERENCES stadium (id);

-- Migrate data from team to stadium
INSERT INTO stadium (temp_team_id, name, capacity, location, image, latitude, longitude, region)
SELECT id, stadium_name, stadium_capacity, stadium_location, stadium_image, stadium_latitude, stadium_longitude, stadium_region
FROM team
WHERE stadium_name IS NOT NULL OR stadium_latitude IS NOT NULL OR stadium_location IS NOT NULL;

-- Link teams back to their new stadium records
UPDATE team
SET stadium_id = stadium.id
FROM stadium
WHERE team.id = stadium.temp_team_id;

-- Clean up temporary column
ALTER TABLE stadium DROP COLUMN temp_team_id;

-- Drop old embedded columns from team
ALTER TABLE team DROP COLUMN stadium_name;
ALTER TABLE team DROP COLUMN stadium_capacity;
ALTER TABLE team DROP COLUMN stadium_location;
ALTER TABLE team DROP COLUMN stadium_image;
ALTER TABLE team DROP COLUMN stadium_latitude;
ALTER TABLE team DROP COLUMN stadium_longitude;
ALTER TABLE team DROP COLUMN stadium_region;
