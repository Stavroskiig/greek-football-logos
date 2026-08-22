package com.gfl.api.controller;

import com.gfl.api.model.Team;
import com.gfl.api.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    public ResponseEntity<Page<Team>> getAllTeams(
            @RequestParam(required = false) String league,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        org.springframework.http.CacheControl cacheControl = org.springframework.http.CacheControl
                .maxAge(java.time.Duration.ofHours(1));

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        if (league != null && !league.isEmpty() && search != null && !search.isEmpty()) {
            return ResponseEntity.ok()
                    .cacheControl(cacheControl)
                    .body(teamService.searchTeamsByLeagueAndName(league, search, pageable));
        }

        if (league != null && !league.isEmpty()) {
            return ResponseEntity.ok()
                    .cacheControl(cacheControl)
                    .body(teamService.getTeamsByLeague(league, pageable));
        }

        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok()
                    .cacheControl(cacheControl)
                    .body(teamService.searchTeamsByName(search, pageable));
        }

        return ResponseEntity.ok()
                .cacheControl(cacheControl)
                .body(teamService.getAllTeams(pageable));
    }

    @PostMapping("/by-ids")
    public ResponseEntity<Page<Team>> getTeamsByIds(
            @RequestBody java.util.List<String> ids,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        org.springframework.http.CacheControl cacheControl = org.springframework.http.CacheControl
                .maxAge(java.time.Duration.ofHours(1));

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok()
                    .cacheControl(cacheControl)
                    .body(teamService.searchTeamsByIdsAndName(ids, search, pageable));
        }

        return ResponseEntity.ok()
                .cacheControl(cacheControl)
                .body(teamService.getTeamsByIds(ids, pageable));
    }

    @PostMapping
    public ResponseEntity<Team> createTeam(@RequestBody Team team) {
        return ResponseEntity.ok(teamService.saveTeam(team));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable String id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/league/{leagueId}")
    public ResponseEntity<Team> updateTeamLeague(@PathVariable String id, @PathVariable String leagueId) {
        try {
            return ResponseEntity.ok(teamService.updateTeamLeague(id, leagueId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncTeams(@RequestBody java.util.List<com.gfl.api.dto.LogoSyncDTO> manifestData) {
        try {
            int addedCount = teamService.syncTeamsFromManifest(manifestData);
            return ResponseEntity.ok(java.util.Map.of("message", "Sync successful", "addedCount", addedCount));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
