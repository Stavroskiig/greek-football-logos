package com.gfl.api.service;

import com.gfl.api.model.TeamLogo;
import com.gfl.api.repository.TeamLogoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamLogoService {

    private final TeamLogoRepository teamLogoRepository;

    public Page<TeamLogo> getAllLogos(Pageable pageable) {
        return teamLogoRepository.findAll(pageable);
    }

    public Page<TeamLogo> getLogosByLeague(String league, Pageable pageable) {
        return teamLogoRepository.findByLeague(league, pageable);
    }

    public Page<TeamLogo> searchLogosByName(String name, Pageable pageable) {
        return teamLogoRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    public Page<TeamLogo> searchLogosByLeagueAndName(String league, String name, Pageable pageable) {
        return teamLogoRepository.findByLeagueAndNameContainingIgnoreCase(league, name, pageable);
    }

    public TeamLogo saveTeamLogo(TeamLogo teamLogo) {
        return teamLogoRepository.save(teamLogo);
    }

    public void deleteTeamLogo(String id) {
        teamLogoRepository.deleteById(id);
    }

    public int syncLogosFromManifest(List<com.gfl.api.dto.LogoSyncDTO> rawLogos) {
        int addedCount = 0;
        try {
            for (com.gfl.api.dto.LogoSyncDTO rawLogo : rawLogos) {
                String name = rawLogo.getName();
                String path = rawLogo.getPath();
                String league = rawLogo.getLeague();

                String id = generateId(name);
                if (!teamLogoRepository.existsById(id)) {
                    TeamLogo logo = new TeamLogo();
                    logo.setId(id);
                    logo.setName(name);
                    logo.setPath(path);
                    logo.setLeague(league);
                    teamLogoRepository.save(logo);
                    addedCount++;
                }
            }
            log.info("Successfully synced {} new logos.", addedCount);
        } catch (Exception e) {
            log.error("Failed to sync database: ", e);
            throw new RuntimeException("Sync failed", e);
        }
        return addedCount;
    }

    private String generateId(String name) {
        if (name == null)
            return "unknown";

        Map<String, String> teamIdMap = Map.ofEntries(
                Map.entry("ΑΟ ΠΑΝΑΘΗΝΑΙΚΟΣ", "panathinaikos"),
                Map.entry("ΑΕΚ", "aek"),
                Map.entry("ΠΑΟΚ", "paok"),
                Map.entry("ΣΦΠ ΟΛΥΜΠΙΑΚΟΣ", "olympiakos"),
                Map.entry("ΑΣ ΑΡΗΣ ΘΕΣΣΑΛΟΝΙΚΗΣ", "aris"),
                Map.entry("ΠΑΣ ΛΑΜΙΑ", "lamia"),
                Map.entry("ΟΦΗ", "ofi"),
                Map.entry("ΝΠΣ ΒΟΛΟΣ", "volos"),
                Map.entry("ΑΓΣ ΑΣΤΕΡΑΣ ΤΡΙΠΟΛΗΣ", "asteras-tripolis"),
                Map.entry("ΓΦΣ ΠΑΝΑΙΤΩΛΙΚΟΣ", "panetolikos"),
                Map.entry("ΑΠΣ ΑΤΡΟΜΗΤΟΣ ΑΘΗΝΩΝ", "atromitos"),
                Map.entry("ΜΓΣ ΠΑΝΣΕΡΡΑΪΚΟΣ", "panserraikos"),
                Map.entry("ΓΣ ΚΑΛΛΙΘΕΑ", "kallithea"),
                Map.entry("ΑΠΟ ΛΕΒΑΔΕΙΑΚΟΣ", "levadiakos"));

        String generatedId = teamIdMap.get(name);
        if (generatedId != null) {
            return generatedId;
        }

        return generateConsistentId(name);
    }

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
