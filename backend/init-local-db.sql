-- ====================================================================
-- Greek Football Logos - Local Database Initialization Script
-- ====================================================================
-- Run this script in DBeaver against your `greek_football_logos` database
-- before starting the backend for the first time on a fresh setup.
--
-- This creates the base schema that Flyway's migrations (V1-V8) build upon.
-- ====================================================================

-- 1. Reset public schema to clear any previous failed Flyway attempts
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- 2. Create initial baseline tables
CREATE TABLE IF NOT EXISTS league (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    display_order INTEGER
);

CREATE TABLE IF NOT EXISTS team_info (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    full_name VARCHAR(255),
    founded INTEGER,
    history TEXT,
    website VARCHAR(255),
    stadium_name VARCHAR(255),
    stadium_capacity INTEGER,
    stadium_location VARCHAR(255),
    stadium_image VARCHAR(255),
    primary_color VARCHAR(255),
    secondary_color VARCHAR(255),
    championships INTEGER,
    cups INTEGER,
    international_titles INTEGER,
    facebook VARCHAR(255),
    twitter VARCHAR(255),
    instagram VARCHAR(255),
    youtube VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS team_logo (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    league_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS collection (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    description TEXT,
    is_public BOOLEAN,
    created_by VARCHAR(255),
    featured BOOLEAN,
    cover_image VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS collection_logos (
    collection_id VARCHAR(255) REFERENCES collection(id),
    logo_id VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS collection_tags (
    collection_id VARCHAR(255) REFERENCES collection(id),
    tag VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS team_logo_tags (
    team_logo_id VARCHAR(255) REFERENCES team_logo(id),
    tag VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS logo_suggestion (
    id BIGSERIAL PRIMARY KEY,
    team_name VARCHAR(255),
    eps VARCHAR(255),
    logo_image_path VARCHAR(255),
    sender_email VARCHAR(255),
    url VARCHAR(255),
    created_at TIMESTAMP,
    status VARCHAR(255)
);
