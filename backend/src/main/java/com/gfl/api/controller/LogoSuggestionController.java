package com.gfl.api.controller;

import com.gfl.api.model.LogoSuggestion;
import com.gfl.api.service.LogoSuggestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suggestions")
@RequiredArgsConstructor
public class LogoSuggestionController {

    private final LogoSuggestionService logoSuggestionService;

    @GetMapping
    public ResponseEntity<List<LogoSuggestion>> getAllSuggestions(
            @RequestParam(required = false, defaultValue = "false") boolean pendingOnly) {
        if (pendingOnly) {
            return ResponseEntity.ok(logoSuggestionService.getPendingSuggestions());
        }
        return ResponseEntity.ok(logoSuggestionService.getAllSuggestions());
    }

    @PostMapping
    public ResponseEntity<LogoSuggestion> submitSuggestion(@RequestBody LogoSuggestion suggestion) {
        return ResponseEntity.ok(logoSuggestionService.saveSuggestion(suggestion));
    }
}
