package com.gfl.api.controller;

import com.gfl.api.model.TeamLogo;
import com.gfl.api.service.TeamLogoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logos")
@RequiredArgsConstructor
public class TeamLogoController {

    private final TeamLogoService teamLogoService;

    @GetMapping
    public ResponseEntity<List<TeamLogo>> getAllLogos(
            @RequestParam(required = false) String league,
            @RequestParam(required = false) String search) {

        org.springframework.http.CacheControl cacheControl = org.springframework.http.CacheControl
                .maxAge(java.time.Duration.ofHours(1));

        if (league != null && !league.isEmpty()) {
            return ResponseEntity.ok()
                    .cacheControl(cacheControl)
                    .body(teamLogoService.getLogosByLeague(league));
        }

        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok()
                    .cacheControl(cacheControl)
                    .body(teamLogoService.searchLogosByName(search));
        }

        return ResponseEntity.ok()
                .cacheControl(cacheControl)
                .body(teamLogoService.getAllLogos());
    }

    @PostMapping
    public ResponseEntity<TeamLogo> createLogo(@RequestBody TeamLogo teamLogo) {
        return ResponseEntity.ok(teamLogoService.saveTeamLogo(teamLogo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLogo(@PathVariable String id) {
        teamLogoService.deleteTeamLogo(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncLogos(@RequestBody java.util.List<com.gfl.api.dto.LogoSyncDTO> manifestData) {
        try {
            int addedCount = teamLogoService.syncLogosFromManifest(manifestData);
            return ResponseEntity.ok(java.util.Map.of("message", "Sync successful", "addedCount", addedCount));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
