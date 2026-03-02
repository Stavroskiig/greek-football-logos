package com.gfl.api.repository;

import com.gfl.api.model.LogoSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LogoSuggestionRepository extends JpaRepository<LogoSuggestion, Long> {
    List<LogoSuggestion> findByStatus(LogoSuggestion.SuggestionStatus status);
}
