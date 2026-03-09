package com.gfl.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestionDTO {
    private String id;
    private String logoPath;
    private String correctAnswer;
    private List<String> options;
    private String difficulty;
    private int points;
}
