package com.gfl.api.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "suggestion_audit_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestionAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long suggestionId;

    private String teamName;

    private String action; // e.g. SUBMITTED, APPROVED, REJECTED, DELETED

    private String performedBy; // e.g. "USER (email)" or "ADMIN"

    @Column(columnDefinition = "TEXT")
    private String details;

    private LocalDateTime timestamp;
}

