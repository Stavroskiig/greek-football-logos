package com.gfl.api.controller;

import com.gfl.api.model.League;
import com.gfl.api.repository.LeagueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leagues")
@RequiredArgsConstructor
public class LeagueController {

    private final LeagueRepository leagueRepository;

    @GetMapping
    public ResponseEntity<List<League>> getAllLeagues() {
        return ResponseEntity.ok(leagueRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<League> createLeague(@RequestBody League league) {
        return ResponseEntity.ok(leagueRepository.save(league));
    }
}
