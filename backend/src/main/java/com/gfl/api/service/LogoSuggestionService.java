package com.gfl.api.service;

import com.gfl.api.model.LogoSuggestion;
import com.gfl.api.model.SuggestionAuditLog;
import com.gfl.api.repository.LogoSuggestionRepository;
import com.gfl.api.repository.SuggestionAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LogoSuggestionService {

    private final LogoSuggestionRepository logoSuggestionRepository;
    private final SuggestionAuditLogRepository suggestionAuditLogRepository;

    public List<LogoSuggestion> getAllSuggestions() {
        return logoSuggestionRepository.findAll();
    }

    public List<LogoSuggestion> getPendingSuggestions() {
        return logoSuggestionRepository.findByStatus(LogoSuggestion.SuggestionStatus.PENDING);
    }

    @Transactional
    public LogoSuggestion saveSuggestion(LogoSuggestion suggestion) {
        if (suggestion.getCreatedAt() == null) {
            suggestion.setCreatedAt(LocalDateTime.now());
        }
        if (suggestion.getStatus() == null) {
            suggestion.setStatus(LogoSuggestion.SuggestionStatus.PENDING);
        }
        LogoSuggestion saved = logoSuggestionRepository.save(suggestion);

        try {
            String teamTypeStr = Boolean.TRUE.equals(saved.getIsNewTeam())
                    ? "New Team"
                    : (saved.getTeamId() != null ? "Existing Team (ID: " + saved.getTeamId() + ")" : "Existing Team");
            String details = String.format("Suggestion submitted for '%s' [%s]. EPS: %s, URL: %s",
                    saved.getTeamName(), teamTypeStr, saved.getEps() != null ? saved.getEps() : "-", saved.getUrl());

            SuggestionAuditLog auditLog = SuggestionAuditLog.builder()
                    .suggestionId(saved.getId())
                    .teamName(saved.getTeamName())
                    .action("SUBMITTED")
                    .performedBy(saved.getSenderEmail() != null ? "USER (" + saved.getSenderEmail() + ")" : "USER")
                    .details(details)
                    .timestamp(LocalDateTime.now())
                    .build();
            suggestionAuditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.warn("Failed to create audit log for suggestion submission: {}", e.getMessage());
        }

        return saved;
    }

    @Transactional
    public LogoSuggestion updateStatus(Long id, LogoSuggestion.SuggestionStatus status) {
        return logoSuggestionRepository.findById(id).map(s -> {
            LogoSuggestion.SuggestionStatus previousStatus = s.getStatus();
            s.setStatus(status);
            LogoSuggestion updated = logoSuggestionRepository.save(s);

            try {
                String actionName = status == LogoSuggestion.SuggestionStatus.APPROVED ? "APPROVED" : "REJECTED";
                String details = String.format("Suggestion for '%s' changed from %s to %s",
                        updated.getTeamName(), previousStatus, status);

                SuggestionAuditLog auditLog = SuggestionAuditLog.builder()
                        .suggestionId(updated.getId())
                        .teamName(updated.getTeamName())
                        .action(actionName)
                        .performedBy("ADMIN")
                        .details(details)
                        .timestamp(LocalDateTime.now())
                        .build();
                suggestionAuditLogRepository.save(auditLog);
            } catch (Exception e) {
                log.warn("Failed to create audit log for status update: {}", e.getMessage());
            }

            return updated;
        }).orElseThrow(() -> new RuntimeException("Suggestion not found with id " + id));
    }

    @Transactional
    public void deleteSuggestion(Long id) {
        logoSuggestionRepository.findById(id).ifPresent(s -> {
            try {
                String details = String.format("Suggestion for '%s' deleted. (Status was %s, Submitter: %s)",
                        s.getTeamName(), s.getStatus(), s.getSenderEmail());

                SuggestionAuditLog auditLog = SuggestionAuditLog.builder()
                        .suggestionId(s.getId())
                        .teamName(s.getTeamName())
                        .action("DELETED")
                        .performedBy("ADMIN")
                        .details(details)
                        .timestamp(LocalDateTime.now())
                        .build();
                suggestionAuditLogRepository.save(auditLog);
            } catch (Exception e) {
                log.warn("Failed to create audit log for suggestion deletion: {}", e.getMessage());
            }
        });

        logoSuggestionRepository.deleteById(id);
    }

    public List<SuggestionAuditLog> getAuditLogs() {
        return suggestionAuditLogRepository.findAllByOrderByTimestampDesc();
    }

    public List<SuggestionAuditLog> getAuditLogsForSuggestion(Long suggestionId) {
        return suggestionAuditLogRepository.findBySuggestionIdOrderByTimestampDesc(suggestionId);
    }
}
