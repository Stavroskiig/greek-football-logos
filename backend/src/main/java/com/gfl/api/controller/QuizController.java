package com.gfl.api.controller;

import com.gfl.api.dto.QuizQuestionDTO;
import com.gfl.api.service.QuizService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/generate")
    public ResponseEntity<List<QuizQuestionDTO>> generateQuiz(
            @RequestParam(defaultValue = "guess-team") String mode,
            @RequestParam(defaultValue = "mixed") String difficulty,
            @RequestParam(defaultValue = "10") int count) {

        // Ensure count is within reasonable bounds
        int safeCount = Math.min(Math.max(count, 1), 50);

        List<QuizQuestionDTO> questions = quizService.generateQuiz(mode, difficulty, safeCount);

        // Cache for 5 minutes since these are random anyway? No, we don't want to cache
        // random quiz generation per user.
        return ResponseEntity.ok()
                .cacheControl(org.springframework.http.CacheControl.noCache())
                .body(questions);
    }
}
