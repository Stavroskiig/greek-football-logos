package com.gfl.api.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class Colors {
    private String primaryColor;
    private String secondaryColor;
}
