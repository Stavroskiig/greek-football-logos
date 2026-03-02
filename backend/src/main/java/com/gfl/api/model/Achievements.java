package com.gfl.api.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class Achievements {
    private Integer leagueTitles;
    private Integer cupTitles;
    private String otherTitlesJson;
}
