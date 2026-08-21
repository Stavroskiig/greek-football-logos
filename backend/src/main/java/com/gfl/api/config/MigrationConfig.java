package com.gfl.api.config;

import com.gfl.api.model.League;
import com.gfl.api.repository.LeagueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;


@Configuration
@RequiredArgsConstructor
@Slf4j
public class MigrationConfig {

    private final JdbcTemplate jdbcTemplate;
    private final LeagueRepository leagueRepository;

    @Bean
    CommandLineRunner runMigration() {
        return args -> {
            log.info("Checking if database migration for leagues is needed...");
            try {
                // Check if the old league column exists and league_id exists
                String checkSql = "SELECT column_name FROM information_schema.columns WHERE table_name='team_logo' AND column_name IN ('league', 'league_id')";
                List<String> columns = jdbcTemplate.queryForList(checkSql, String.class);

                if (columns.contains("league") && columns.contains("league_id")) {
                    log.info("Found both legacy 'league' and new 'league_id' columns. Starting migration...");

                    String findUnmigrated = "SELECT id, league FROM team_logo WHERE league_id IS NULL AND league IS NOT NULL";
                    List<Map<String, Object>> unmigratedLogos = jdbcTemplate.queryForList(findUnmigrated);

                    if (!unmigratedLogos.isEmpty()) {
                        log.info("Found {} logos to migrate.", unmigratedLogos.size());

                        for (Map<String, Object> row : unmigratedLogos) {
                            String logoId = (String) row.get("id");
                            String legacyLeagueName = (String) row.get("league");

                            String lId = "other";
                            String lName = "Other";
                            if (legacyLeagueName != null && !legacyLeagueName.isEmpty()
                                    && !legacyLeagueName.equalsIgnoreCase("Other")
                                    && !legacyLeagueName.equalsIgnoreCase("No League")) {
                                lId = generateConsistentId(legacyLeagueName);
                                lName = legacyLeagueName;
                            }

                            final String finalLeagueId = lId;
                            final String finalLeagueName = lName;

                            League league = leagueRepository.findById(finalLeagueId).orElseGet(() -> {
                                League newLeague = new League(finalLeagueId, finalLeagueName, 0);
                                return leagueRepository.save(newLeague);
                            });

                            String updateSql = "UPDATE team_logo SET league_id = ? WHERE id = ?";
                            jdbcTemplate.update(updateSql, league.getId(), logoId);
                        }
                        log.info("Successfully migrated {} logos.", unmigratedLogos.size());
                    } else {
                        log.info("No unmigrated logos found. Migration skipped.");
                    }
                }
            } catch (Exception e) {
                log.error("Failed to run league migration: ", e);
            }

            try {
                String checkPathSql = "SELECT column_name FROM information_schema.columns WHERE table_name='team_logo' AND column_name='path'";
                List<String> pathColumns = jdbcTemplate.queryForList(checkPathSql, String.class);
                if (pathColumns.contains("path")) {
                    log.info("Found obsolete 'path' column. Dropping it...");
                    jdbcTemplate.execute("ALTER TABLE team_logo DROP COLUMN path");
                    log.info("Successfully dropped 'path' column.");
                }
            } catch (Exception e) {
                log.error("Failed to drop obsolete path column: ", e);
            }
        };
    }

    // Extracted from TeamLogoService
    private String generateConsistentId(String name) {
        String id = name.toLowerCase()
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                .replaceAll("[^a-z0-9α-ωά-ώ]+", "-")
                .replaceAll("^-+|-+$", "");

        id = id.replaceAll("^αο-", "")
                .replaceAll("^αε-", "ae-")
                .replaceAll("^ασ-", "as-")
                .replaceAll("^απσ-", "aps-")
                .replaceAll("^απο-", "apo-")
                .replaceAll("^γσ-", "gs-")
                .replaceAll("^γσσ-", "gss-")
                .replaceAll("^παε-", "pae-")
                .replaceAll("^παο-", "pao-")
                .replaceAll("^πασ-", "pas-")
                .replaceAll("^πσ-", "ps-")
                .replaceAll("^σφπ-", "sfp-")
                .replaceAll("^νπσ-", "nps-")
                .replaceAll("^μγσ-", "mgs-")
                .replaceAll("^μγσκ-", "mgsk-")
                .replaceAll("^οφπφ-", "ofpf-")
                .replaceAll("^γαμσ-", "gams-")
                .replaceAll("^γασ-", "gas-")
                .replaceAll("^γε-", "ge-")
                .replaceAll("^γπσ-", "gps-")
                .replaceAll("^αομ-", "aom-")
                .replaceAll("^ηρακλης-", "iraklis-")
                .replaceAll("^παναθηναικος", "panathinaikos")
                .replaceAll("^ολυμπιακος", "olympiakos")
                .replaceAll("^παοκ", "paok")
                .replaceAll("^αεκ", "aek")
                .replaceAll("^αρης", "aris")
                .replaceAll("^λαμια", "lamia")
                .replaceAll("^οφη", "ofi")
                .replaceAll("^βολος", "volos")
                .replaceAll("^αστερας-", "asteras-")
                .replaceAll("^παναιτωλικος", "panetolikos")
                .replaceAll("^ατρομητος", "atromitos")
                .replaceAll("^πανσερραικος", "panserraikos")
                .replaceAll("^καλλιθεα", "kallithea")
                .replaceAll("^λεβαδιακος", "levadiakos");

        id = id.replaceAll("-+", "-");
        return id;
    }
}
