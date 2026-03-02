package com.gfl.api.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class SocialMedia {
    private String facebook;
    private String twitter;
    private String instagram;
}
