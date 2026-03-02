package com.gfl.api.service;

import com.gfl.api.model.LogoSuggestion;
import com.gfl.api.repository.LogoSuggestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LogoSuggestionService {

    private final LogoSuggestionRepository logoSuggestionRepository;

    public List<LogoSuggestion> getAllSuggestions() {
        return logoSuggestionRepository.findAll();
    }

    public List<LogoSuggestion> getPendingSuggestions() {
        return logoSuggestionRepository.findByStatus(LogoSuggestion.SuggestionStatus.PENDING);
    }

    public LogoSuggestion saveSuggestion(LogoSuggestion suggestion) {
        if (suggestion.getCreatedAt() == null) {
            suggestion.setCreatedAt(LocalDateTime.now());
        }
        if (suggestion.getStatus() == null) {
            suggestion.setStatus(LogoSuggestion.SuggestionStatus.PENDING);
        }
        return logoSuggestionRepository.save(suggestion);
    }
}
