package com.gfl.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogoUploadResponseDTO {
    private boolean success;
    private String message;
    private String path;
    private String githubCommitSha;
    private String commitUrl;
    private String teamId;
    private boolean isHistorical;
}
