package com.gfl.api.service;

import com.gfl.api.dto.QuizQuestionDTO;
import com.gfl.api.model.TeamLogo;
import com.gfl.api.repository.TeamLogoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class QuizService {

    private final TeamLogoRepository teamLogoRepository;

    public List<QuizQuestionDTO> generateQuiz(String mode, String difficulty, int count) {
        log.info("Generating quiz: mode={}, difficulty={}, count={}", mode, difficulty, count);

        List<TeamLogo> selectedLogos;
        List<String> leagues = getLeaguesByDifficulty(difficulty);

        if (leagues.isEmpty()) {
            selectedLogos = teamLogoRepository.findRandomLogos(count);
        } else {
            selectedLogos = teamLogoRepository.findRandomLogosByLeagues(leagues, count);
        }

        List<QuizQuestionDTO> questions = new ArrayList<>();
        int i = 0;
        for (TeamLogo logo : selectedLogos) {
            questions.add(createQuestion(logo, mode, difficulty, i++));
        }

        return questions;
    }

    private List<String> getLeaguesByDifficulty(String difficulty) {
        if ("easy".equalsIgnoreCase(difficulty)) {
            return List.of("SUPERLEAGUE", "SUPERLEAGUE 2");
        } else if ("medium".equalsIgnoreCase(difficulty)) {
            return List.of("SUPERLEAGUE", "SUPERLEAGUE 2", "Γ ΕΘΝΙΚΗ");
        }
        return Collections.emptyList(); // Hard or mixed means all leagues
    }

    private QuizQuestionDTO createQuestion(TeamLogo logo, String mode, String difficultySetting, int index) {
        String actualDifficulty = determineQuestionDifficulty(difficultySetting);
        int points = getPointsForDifficulty(actualDifficulty);

        boolean isTeamQuestion = "guess-team".equalsIgnoreCase(mode) ||
                ("mixed".equalsIgnoreCase(mode) && Math.random() > 0.5);

        String correctAnswer;
        List<String> options;

        if (isTeamQuestion) {
            correctAnswer = logo.getName();
            options = generateTeamOptions(logo, actualDifficulty);
        } else {
            correctAnswer = logo.getLeague() != null ? logo.getLeague() : "Unknown";
            options = generateLeagueOptions(logo, actualDifficulty);
        }

        List<String> shuffledOptions = new ArrayList<>(options);
        Collections.shuffle(shuffledOptions);

        return QuizQuestionDTO.builder()
                .id("question-" + index)
                .logoPath(logo.getPath())
                .correctAnswer(correctAnswer)
                .options(shuffledOptions)
                .difficulty(actualDifficulty)
                .points(points)
                .build();
    }

    private String determineQuestionDifficulty(String difficultySetting) {
        if ("mixed".equalsIgnoreCase(difficultySetting)) {
            double rand = Math.random();
            if (rand < 0.4)
                return "easy";
            if (rand < 0.8)
                return "medium";
            return "hard";
        }
        return difficultySetting.toLowerCase();
    }

    private int getPointsForDifficulty(String difficulty) {
        switch (difficulty.toLowerCase()) {
            case "easy":
                return 10;
            case "medium":
                return 20;
            case "hard":
                return 30;
            default:
                return 15;
        }
    }

    private List<String> generateTeamOptions(TeamLogo correctLogo, String difficulty) {
        List<String> options = new ArrayList<>();
        options.add(correctLogo.getName());

        List<String> leagues = getLeaguesByDifficulty(difficulty);
        List<TeamLogo> randomOtherLogos;

        // Fetch enough random logos to ensure we get 3 distinct other names
        if (leagues.isEmpty()) {
            randomOtherLogos = teamLogoRepository.findRandomLogos(10);
        } else {
            randomOtherLogos = teamLogoRepository.findRandomLogosByLeagues(leagues, 10);
        }

        for (TeamLogo other : randomOtherLogos) {
            if (!other.getId().equals(correctLogo.getId()) && !options.contains(other.getName())) {
                options.add(other.getName());
            }
            if (options.size() == 4)
                break;
        }

        // Just in case we didn't find enough
        while (options.size() < 4) {
            options.add("Team " + Math.random());
        }

        return options;
    }

    private List<String> generateLeagueOptions(TeamLogo correctLogo, String difficulty) {
        List<String> options = new ArrayList<>();
        String currentLeague = correctLogo.getLeague() != null ? correctLogo.getLeague() : "Unknown";
        options.add(currentLeague);

        // Define a pool of major leagues to pick from to ensure realistic options, or
        // use distinct query
        List<String> allLeagues = List.of(
                "SUPERLEAGUE", "SUPERLEAGUE 2", "Γ ΕΘΝΙΚΗ",
                "ΕΠΣ ΑΘΗΝΩΝ", "ΕΠΣ ΠΕΙΡΑΙΑ", "ΕΠΣ ΜΑΚΕΔΟΝΙΑΣ", "ΕΠΣ ΗΡΑΚΛΕΙΟΥ",
                "ΕΠΣ ΑΧΑΪΑΣ", "ΕΠΣ ΛΑΡΙΣΑΣ", "ΕΠΣ ΧΑΝΙΩΝ");

        List<String> shuffledLeagues = new ArrayList<>(allLeagues);
        Collections.shuffle(shuffledLeagues);

        for (String otherLeague : shuffledLeagues) {
            if (!otherLeague.equals(currentLeague) && !options.contains(otherLeague)) {
                options.add(otherLeague);
            }
            if (options.size() == 4)
                break;
        }

        while (options.size() < 4) {
            options.add("League " + Math.random());
        }

        return options;
    }
}
