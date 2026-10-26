package com.gfl.api.config;

import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

@Configuration
@Slf4j
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy(DataSource dataSource) {
        return flyway -> {
            log.info("Checking database baseline tables before running Flyway...");
            try (Connection conn = dataSource.getConnection();
                 Statement stmt = conn.createStatement()) {

                // Check if baseline tables exist
                boolean tablesExist = false;
                try (ResultSet rs = stmt.executeQuery(
                        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('team', 'team_info')")) {
                    if (rs.next()) {
                        tablesExist = rs.getInt(1) > 0;
                    }
                }

                if (!tablesExist) {
                    log.info("Fresh database detected. Initializing base tables for Flyway migrations...");

                    // Clear failed flyway attempts if any
                    try {
                        stmt.execute("DELETE FROM flyway_schema_history WHERE success = false");
                    } catch (Exception ignored) {
                        // flyway_schema_history might not exist yet
                    }

                    stmt.execute("""
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
                    """);
                    log.info("Baseline tables successfully created.");
                } else {
                    log.info("Existing database schema detected. Proceeding with standard Flyway migration.");
                }

                // Ensure collection table has created_by column in case it was created in a previous attempt
                try {
                    stmt.execute("ALTER TABLE collection ADD COLUMN IF NOT EXISTS created_by VARCHAR(255)");
                    stmt.execute("CREATE TABLE IF NOT EXISTS collection_logos (collection_id VARCHAR(255) REFERENCES collection(id), logo_id VARCHAR(255))");
                } catch (Exception ignored) {}
            } catch (Exception e) {
                log.warn("Could not check or initialize baseline schema: {}", e.getMessage());
            }

            // Always repair any failed attempts and then migrate
            try {
                flyway.repair();
            } catch (Exception ignored) {}

            flyway.migrate();
        };
    }
}
