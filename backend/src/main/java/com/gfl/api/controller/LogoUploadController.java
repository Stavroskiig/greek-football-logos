package com.gfl.api.controller;

import com.gfl.api.dto.LogoUploadResponseDTO;
import com.gfl.api.model.Team;
import com.gfl.api.model.TeamLogo;
import com.gfl.api.repository.TeamRepository;
import com.gfl.api.service.GitHubService;
import com.gfl.api.service.TeamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/logos")
@RequiredArgsConstructor
@Slf4j
public class LogoUploadController {

    private final GitHubService gitHubService;
    private final TeamService teamService;
    private final TeamRepository teamRepository;

    private static final List<String> STANDARD_FOLDERS = Arrays.asList(
            "SUPERLEAGUE",
            "SUPERLEAGUE 2",
            "Γ ΕΘΝΙΚΗ",
            "history",
            "women",
            "ΕΠΣ ΑΘΗΝΩΝ",
            "ΕΠΣ ΑΙΤΩΛΟΑΚΑΡΝΑΝΙΑΣ",
            "ΕΠΣ ΑΝΑΤΟΛΙΚΗΣ ΑΤΤΙΚΗΣ",
            "ΕΠΣ ΑΡΓΟΛΙΔΑΣ",
            "ΕΠΣ ΑΡΚΑΔΙΑΣ",
            "ΕΠΣ ΑΡΤΑΣ",
            "ΕΠΣ ΑΧΑΪΑΣ",
            "ΕΠΣ ΒΟΙΩΤΙΑΣ",
            "ΕΠΣ ΓΡΕΒΕΝΩΝ",
            "ΕΠΣ ΔΡΑΜΑΣ",
            "ΕΠΣ ΔΥΤΙΚΗΣ ΑΤΤΙΚΗΣ",
            "ΕΠΣ ΔΩΔΕΚΑΝΗΣΟΥ",
            "ΕΠΣ ΕΒΡΟΥ",
            "ΕΠΣ ΕΥΒΟΙΑΣ",
            "ΕΠΣ ΕΥΡΥΤΑΝΙΑΣ",
            "ΕΠΣ ΖΑΚΥΝΘΟΥ",
            "ΕΠΣ ΗΛΕΙΑΣ",
            "ΕΠΣ ΗΜΑΘΙΑΣ",
            "ΕΠΣ ΗΠΕΙΡΟΥ",
            "ΕΠΣ ΗΡΑΚΛΕΙΟΥ",
            "ΕΠΣ ΘΕΣΠΡΩΤΙΑΣ",
            "ΕΠΣ ΘΕΣΣΑΛΙΑΣ",
            "ΕΠΣ ΘΡΑΚΗΣ",
            "ΕΠΣ ΚΑΒΑΛΑΣ",
            "ΕΠΣ ΚΑΡΔΙΤΣΑΣ",
            "ΕΠΣ ΚΑΣΤΟΡΙΑΣ",
            "ΕΠΣ ΚΕΡΚΥΡΑΣ",
            "ΕΠΣ ΚΕΦΑΛΛΗΝΙΑΣ-ΙΘΑΚΗΣ",
            "ΕΠΣ ΚΙΛΚΙΣ",
            "ΕΠΣ ΚΟΖΑΝΗΣ",
            "ΕΠΣ ΚΟΡΙΝΘΙΑΣ",
            "ΕΠΣ ΚΥΚΛΑΔΩΝ",
            "ΕΠΣ ΛΑΚΩΝΙΑΣ",
            "ΕΠΣ ΛΑΡΙΣΑΣ",
            "ΕΠΣ ΛΑΣΙΘΙΟΥ",
            "ΕΠΣ ΛΕΣΒΟΥ-ΛΗΜΝΟΥ",
            "ΕΠΣ ΜΑΚΕΔΟΝΙΑΣ",
            "ΕΠΣ ΜΕΣΣΗΝΙΑΣ",
            "ΕΠΣ ΞΑΝΘΗΣ",
            "ΕΠΣ ΠΕΙΡΑΙΑ",
            "ΕΠΣ ΠΕΛΛΑΣ",
            "ΕΠΣ ΠΙΕΡΙΑΣ",
            "ΕΠΣ ΠΡΕΒΕΖΑΣ-ΛΕΥΚΑΔΑΣ",
            "ΕΠΣ ΡΕΘΥΜΝΟΥ",
            "ΕΠΣ ΣΑΜΟΥ",
            "ΕΠΣ ΣΕΡΡΩΝ",
            "ΕΠΣ ΤΡΙΚΑΛΩΝ",
            "ΕΠΣ ΦΘΙΩΤΙΔΑΣ",
            "ΕΠΣ ΦΛΩΡΙΝΑΣ",
            "ΕΠΣ ΦΩΚΙΔΑΣ",
            "ΕΠΣ ΧΑΛΚΙΔΙΚΗΣ",
            "ΕΠΣ ΧΑΝΙΩΝ",
            "ΕΠΣ ΧΙΟΥ"
    );

    @GetMapping("/folders")
    public ResponseEntity<List<String>> getAvailableFolders() {
        return ResponseEntity.ok(STANDARD_FOLDERS);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LogoUploadResponseDTO> uploadLogo(
            @RequestParam("file") MultipartFile file,
            @RequestParam("league") String league,
            @RequestParam(value = "teamId", required = false) String teamId,
            @RequestParam(value = "filename", required = false) String customFilename,
            @RequestParam(value = "isHistorical", defaultValue = "false") boolean isHistorical,
            @RequestParam(value = "startYear", required = false) Integer startYear,
            @RequestParam(value = "endYear", required = false) Integer endYear) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    LogoUploadResponseDTO.builder()
                            .success(false)
                            .message("Uploaded file cannot be empty")
                            .build()
            );
        }

        try {
            // Determine clean file name and extension
            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "logo.png";
            String extension = "";
            int dotIndex = originalFilename.lastIndexOf('.');
            if (dotIndex > 0) {
                extension = originalFilename.substring(dotIndex).toLowerCase();
            } else {
                extension = ".png";
            }

            String baseName;
            if (customFilename != null && !customFilename.trim().isEmpty()) {
                baseName = customFilename.trim();
                if (baseName.toLowerCase().endsWith(extension)) {
                    baseName = baseName.substring(0, baseName.length() - extension.length());
                }
            } else {
                baseName = dotIndex > 0 ? originalFilename.substring(0, dotIndex) : originalFilename;
            }

            // Sanitize filename for git/filesystem
            String cleanFilename = sanitizeFilename(baseName) + extension;
            String cleanLeague = league != null && !league.trim().isEmpty() ? league.trim() : "SUPERLEAGUE";

            // Relative path in git repository and in Angular assets
            String repoPath = "frontend/src/assets/logos/" + cleanLeague + "/" + cleanFilename;
            String appPath = "assets/logos/" + cleanLeague + "/" + cleanFilename;

            String commitMessage = String.format("admin: upload logo %s to %s", cleanFilename, cleanLeague);
            GitHubService.CommitResult commitResult = gitHubService.commitFile(repoPath, file.getBytes(), commitMessage);

            // If a teamId is specified, link this logo to the team in the database
            if (teamId != null && !teamId.trim().isEmpty()) {
                Team team = teamRepository.findById(teamId).orElse(null);
                if (team != null) {
                    if (isHistorical) {
                        TeamLogo histLogo = new TeamLogo();
                        histLogo.setPath(appPath);
                        histLogo.setStartYear(startYear);
                        histLogo.setEndYear(endYear);
                        teamService.addHistoricalLogo(teamId, histLogo);
                        log.info("Linked historical logo {} to team {}", appPath, teamId);
                    } else {
                        TeamLogo primary = team.getPrimaryLogo();
                        if (primary == null) {
                            primary = new TeamLogo();
                            primary.setId(teamId);
                            primary.setName(team.getName());
                            primary.setTeam(team);
                            team.setPrimaryLogo(primary);
                        }
                        primary.setPath(appPath);
                        if (startYear != null) primary.setStartYear(startYear);
                        if (endYear != null) primary.setEndYear(endYear);
                        teamRepository.save(team);
                        log.info("Updated primary logo {} for team {}", appPath, teamId);
                    }
                } else {
                    log.warn("Team with id {} not found to associate with uploaded logo", teamId);
                }
            }

            return ResponseEntity.ok(
                    LogoUploadResponseDTO.builder()
                            .success(true)
                            .message("Logo successfully uploaded and committed to GitHub!")
                            .path(appPath)
                            .githubCommitSha(commitResult.commitSha())
                            .commitUrl(commitResult.commitUrl())
                            .teamId(teamId)
                            .isHistorical(isHistorical)
                            .build()
            );

        } catch (Exception e) {
            log.error("Failed to upload logo: ", e);
            return ResponseEntity.internalServerError().body(
                    LogoUploadResponseDTO.builder()
                            .success(false)
                            .message("Upload failed: " + e.getMessage())
                            .build()
            );
        }
    }

    private String sanitizeFilename(String filename) {
        return filename.trim()
                .replaceAll("[\\\\/:*?\"<>|]", "-")
                .replaceAll("\\s+", " ")
                .replaceAll("-+", "-");
    }
}
