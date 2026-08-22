package com.gfl.api.service;

import com.gfl.api.model.League;
import com.gfl.api.model.Team;
import com.gfl.api.model.TeamLogo;
import com.gfl.api.repository.LeagueRepository;
import com.gfl.api.repository.TeamRepository;
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
public class TeamService {

    private final TeamRepository teamRepository;
    private final LeagueRepository leagueRepository;

    public Page<Team> getAllTeams(Pageable pageable) {
        return teamRepository.findAll(pageable);
    }

    public Page<Team> getTeamsByLeague(String leagueId, Pageable pageable) {
        return teamRepository.findByLeagueId(leagueId, pageable);
    }

    public Page<Team> searchTeamsByName(String name, Pageable pageable) {
        return teamRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    public Page<Team> searchTeamsByLeagueAndName(String leagueId, String name, Pageable pageable) {
        return teamRepository.findByLeagueIdAndNameContainingIgnoreCase(leagueId, name, pageable);
    }

    public Page<Team> getTeamsByIds(List<String> ids, Pageable pageable) {
        return teamRepository.findByIdIn(ids, pageable);
    }

    public Page<Team> searchTeamsByIdsAndName(List<String> ids, String name, Pageable pageable) {
        return teamRepository.findByIdInAndNameContainingIgnoreCase(ids, name, pageable);
    }

    public Team saveTeam(Team team) {
        return teamRepository.save(team);
    }

    public Team updateTeamLeague(String teamId, String leagueId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        League league = leagueRepository.findById(leagueId)
                .orElseThrow(() -> new RuntimeException("League not found"));
        team.setLeague(league);
        return teamRepository.save(team);
    }

    public void deleteTeam(String id) {
        teamRepository.deleteById(id);
    }

    public int syncTeamsFromManifest(List<com.gfl.api.dto.LogoSyncDTO> rawLogos) {
        int addedCount = 0;
        try {
            for (com.gfl.api.dto.LogoSyncDTO rawLogo : rawLogos) {
                String name = rawLogo.getName();

                String rawLeagueName = rawLogo.getLeague();
                String lId = "other";
                String lName = "Other";
                if (rawLeagueName != null && !rawLeagueName.isEmpty() && !rawLeagueName.equalsIgnoreCase("Other")
                        && !rawLeagueName.equalsIgnoreCase("No League")) {
                    lId = generateConsistentId(rawLeagueName);
                    lName = rawLeagueName;
                }

                final String finalLeagueId = lId;
                final String finalLeagueName = lName;
                League league = leagueRepository.findById(finalLeagueId).orElseGet(() -> {
                    League newLeague = new League(finalLeagueId, finalLeagueName, 0);
                    return leagueRepository.save(newLeague);
                });

                String id = generateId(name);
                Team existingTeam = teamRepository.findById(id).orElse(null);

                if (existingTeam == null) {
                    Team team = new Team();
                    team.setId(id);
                    team.setName(name);
                    team.setLeague(league);
                    
                    TeamLogo logo = new TeamLogo();
                    logo.setId(id);
                    logo.setName(name);
                    logo.setTeam(team);
                    
                    team.setPrimaryLogo(logo);
                    
                    teamRepository.save(team);
                    addedCount++;
                }
            }
            log.info("Successfully synced {} new teams.", addedCount);
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
