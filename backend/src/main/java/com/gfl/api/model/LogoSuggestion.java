package com.gfl.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "logo_suggestion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogoSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String teamName;

    private String eps;

    private String logoImagePath;

    private String senderEmail;

    private String url;

    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private SuggestionStatus status;

    public enum SuggestionStatus {
        PENDING, APPROVED, REJECTED
    }
}
