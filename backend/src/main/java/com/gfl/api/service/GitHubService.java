package com.gfl.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class GitHubService {

    @Value("${github.api.token:}")
    private String githubToken;

    @Value("${github.api.repo.owner:Stavroskiig}")
    private String repoOwner;

    @Value("${github.api.repo.name:greek-football-logos}")
    private String repoName;

    @Value("${github.api.branch:main}")
    private String branch;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(15))
            .build();

    public record CommitResult(String commitSha, String commitUrl, String message) {}

    /**
     * Uploads or updates a file directly in the GitHub repository via the GitHub REST API.
     * If GITHUB_TOKEN is not configured, attempts a fallback to local disk (useful in dev).
     */
    public CommitResult commitFile(String filePathInRepo, byte[] fileBytes, String commitMessage) {
        if (githubToken == null || githubToken.trim().isEmpty()) {
            log.warn("GITHUB_TOKEN is not set. Checking local disk fallback...");
            return handleLocalFallback(filePathInRepo, fileBytes);
        }

        try {
            String encodedContent = Base64.getEncoder().encodeToString(fileBytes);
            String existingSha = getExistingFileSha(filePathInRepo);

            String url = String.format("https://api.github.com/repos/%s/%s/contents/%s",
                    repoOwner, repoName, encodePath(filePathInRepo));

            Map<String, Object> payload = new HashMap<>();
            payload.put("message", commitMessage);
            payload.put("content", encodedContent);
            payload.put("branch", branch);
            if (existingSha != null && !existingSha.isEmpty()) {
                payload.put("sha", existingSha);
            }

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Bearer " + githubToken.trim())
                    .header("Accept", "application/vnd.github+json")
                    .header("X-GitHub-Api-Version", "2022-11-28")
                    .header("User-Agent", "GreekFootballLogos-App")
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(30))
                    .PUT(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(response.body());
                String commitSha = root.path("commit").path("sha").asText("");
                String commitUrl = String.format("https://github.com/%s/%s/commit/%s", repoOwner, repoName, commitSha);
                log.info("Successfully committed file to GitHub: {} (commit: {})", filePathInRepo, commitSha);
                return new CommitResult(commitSha, commitUrl, "Committed to GitHub successfully");
            } else {
                log.error("GitHub API error (status {}): {}", response.statusCode(), response.body());
                throw new RuntimeException("GitHub API responded with error " + response.statusCode() + ": " + response.body());
            }
        } catch (Exception e) {
            log.error("Failed to commit file to GitHub: ", e);
            throw new RuntimeException("GitHub commit failed: " + e.getMessage(), e);
        }
    }

    /**
     * Checks if a file exists on GitHub to obtain its current SHA (required by GitHub API for updates).
     */
    private String getExistingFileSha(String filePathInRepo) {
        try {
            String url = String.format("https://api.github.com/repos/%s/%s/contents/%s?ref=%s",
                    repoOwner, repoName, encodePath(filePathInRepo), branch);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Authorization", "Bearer " + githubToken.trim())
                    .header("Accept", "application/vnd.github+json")
                    .header("X-GitHub-Api-Version", "2022-11-28")
                    .header("User-Agent", "GreekFootballLogos-App")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                return root.path("sha").asText(null);
            }
        } catch (Exception e) {
            log.warn("Could not check existing file SHA (file may be new): {}", e.getMessage());
        }
        return null;
    }

    private String encodePath(String path) {
        // Encode URI path segments while preserving slashes
        String[] segments = path.split("/");
        StringBuilder encoded = new StringBuilder();
        for (int i = 0; i < segments.length; i++) {
            if (i > 0) encoded.append("/");
            encoded.append(java.net.URLEncoder.encode(segments[i], java.nio.charset.StandardCharsets.UTF_8)
                    .replace("+", "%20"));
        }
        return encoded.toString();
    }

    private CommitResult handleLocalFallback(String filePathInRepo, byte[] fileBytes) {
        try {
            // Check if we are running in a local environment where the workspace exists
            File targetFile = new File("../" + filePathInRepo);
            if (!targetFile.getParentFile().exists()) {
                targetFile = new File(filePathInRepo);
            }

            if (targetFile.getParentFile().exists() || targetFile.getParentFile().mkdirs()) {
                try (FileOutputStream fos = new FileOutputStream(targetFile)) {
                    fos.write(fileBytes);
                }
                log.info("Saved file locally to {}", targetFile.getAbsolutePath());
                return new CommitResult("local-dev", null, "Saved locally (GITHUB_TOKEN not configured)");
            }
        } catch (Exception e) {
            log.warn("Local fallback failed: {}", e.getMessage());
        }

        throw new IllegalStateException(
                "GITHUB_TOKEN environment variable is not configured. " +
                "Please add GITHUB_TOKEN to your backend environment settings.");
    }
}
