CREATE TABLE IF NOT EXISTS suggestion_audit_log (
    id BIGSERIAL PRIMARY KEY,
    suggestion_id BIGINT,
    team_name VARCHAR(255),
    action VARCHAR(50),
    performed_by VARCHAR(255),
    details TEXT,
    timestamp TIMESTAMP
);

ALTER TABLE logo_suggestion ADD COLUMN IF NOT EXISTS is_new_team BOOLEAN DEFAULT FALSE;
ALTER TABLE logo_suggestion ADD COLUMN IF NOT EXISTS team_id VARCHAR(255);

