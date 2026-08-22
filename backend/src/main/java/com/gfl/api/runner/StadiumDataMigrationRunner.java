package com.gfl.api.runner;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gfl.api.model.Team;
import com.gfl.api.repository.TeamRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.transaction.annotation.Transactional;

@Component
public class StadiumDataMigrationRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(StadiumDataMigrationRunner.class);
    private final TeamRepository teamRepository;
    private final ObjectMapper objectMapper;

    public StadiumDataMigrationRunner(TeamRepository teamRepository, ObjectMapper objectMapper) {
        this.teamRepository = teamRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Only run if there are teams that need migration
        long teamsMissingCoordinates = teamRepository.findAll().stream()
                .filter(t -> t.getStadium() == null || t.getStadium().getLatitude() == null)
                .count();

        if (teamsMissingCoordinates == 0) {
            logger.info("All teams have coordinates. Skipping stadium data migration.");
            return;
        }

        logger.info("Starting Stadium Data Migration from JSON...");
        
        File jsonFile = new File("../frontend/src/assets/data/team-locations.json");
        if (!jsonFile.exists()) {
            logger.warn("team-locations.json not found at {}. Skipping migration.", jsonFile.getAbsolutePath());
            return;
        }

        List<Map<String, Object>> locations = objectMapper.readValue(jsonFile, new TypeReference<>() {});
        
        int updatedCount = 0;
        for (Map<String, Object> loc : locations) {
            String id = (String) loc.get("id");
            String name = (String) loc.get("name");
            Double lat = ((Number) loc.get("lat")).doubleValue();
            Double lng = ((Number) loc.get("lng")).doubleValue();
            String region = (String) loc.get("region");

            Optional<Team> teamOpt = teamRepository.findById(id);
            if (teamOpt.isEmpty()) {
                // Try finding by name
                teamOpt = teamRepository.findAll().stream()
                        .filter(t -> name.equals(t.getName()))
                        .findFirst();
            }

            if (teamOpt.isPresent()) {
                Team team = teamOpt.get();
                if (team.getStadium() == null) {
                    team.setStadium(new com.gfl.api.model.Stadium());
                }
                if (team.getStadium().getLatitude() == null) {
                    team.getStadium().setLatitude(lat);
                    team.getStadium().setLongitude(lng);
                    team.getStadium().setRegion(region);
                    teamRepository.save(team);
                    updatedCount++;
                    logger.debug("Migrated stadium coordinates for team: {}", team.getName());
                }
            }
        }
        
        logger.info("Stadium Data Migration completed. Updated {} teams.", updatedCount);
    }
}
