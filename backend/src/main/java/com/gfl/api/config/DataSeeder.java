package com.gfl.api.config;

import com.gfl.api.repository.TeamLogoRepository;
import com.gfl.api.service.TeamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final TeamLogoRepository teamLogoRepository;
    private final TeamService teamService;

    @Bean
    CommandLineRunner initDatabase() {
        return args -> {
            if (teamLogoRepository.count() == 0) {
                log.info("Database is empty. Seeding team logos from frontend manifest...");
                try {
                    File manifestFile = new File("../frontend/src/assets/logos-manifest.json");
                    if (manifestFile.exists()) {
                        ObjectMapper mapper = new ObjectMapper();
                        List<com.gfl.api.dto.LogoSyncDTO> rawLogos = mapper.readValue(manifestFile,
                                new TypeReference<List<com.gfl.api.dto.LogoSyncDTO>>() {
                                });
                        teamService.syncTeamsFromManifest(rawLogos);
                    } else {
                        log.warn("Manifest file not found during local seed.");
                    }
                } catch (Exception e) {
                    log.error("Failed local seeder: ", e);
                }
            } else {
                log.info("Database already contains logos. Skipping data seed.");
            }
        };
    }
}
