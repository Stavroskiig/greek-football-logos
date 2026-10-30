package com.gfl.api.repository;

import com.gfl.api.model.SuggestionAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SuggestionAuditLogRepository extends JpaRepository<SuggestionAuditLog, Long> {
    List<SuggestionAuditLog> findAllByOrderByTimestampDesc();
    List<SuggestionAuditLog> findBySuggestionIdOrderByTimestampDesc(Long suggestionId);
}

