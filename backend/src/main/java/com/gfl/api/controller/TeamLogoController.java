package com.gfl.api.controller;

import com.gfl.api.model.TeamLogo;
import com.gfl.api.service.TeamLogoService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/logos")
@RequiredArgsConstructor
public class TeamLogoController {

    private final TeamLogoService teamLogoService;

    @GetMapping
    public ResponseEntity<Page<TeamLogo>> getAllLogos(
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
                    .body(teamLogoService.searchLogosByLeagueAndName(league, search, pageable));
        }

        if (league != null && !league.isEmpty()) {
            return ResponseEntity.ok()
                    .cacheControl(cacheControl)
                    .body(teamLogoService.getLogosByLeague(league, pageable));
        }

        if (search != null && !search.isEmpty()) {
            return ResponseEntity.ok()
                    .cacheControl(cacheControl)
                    .body(teamLogoService.searchLogosByName(search, pageable));
        }

        return ResponseEntity.ok()
                .cacheControl(cacheControl)
                .body(teamLogoService.getAllLogos(pageable));
    }

    @PostMapping("/by-ids")
    public ResponseEntity<Page<TeamLogo>> getLogosByIds(
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
                    .body(teamLogoService.searchLogosByIdsAndName(ids, search, pageable));
        }

        return ResponseEntity.ok()
                .cacheControl(cacheControl)
                .body(teamLogoService.getLogosByIds(ids, pageable));
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
