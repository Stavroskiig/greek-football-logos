package com.gfl.api.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class Stadium {
    private String stadiumName;
    private Integer stadiumCapacity;
    private String stadiumLocation;
    private String stadiumImage;
}
