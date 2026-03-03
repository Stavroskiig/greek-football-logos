package com.gfl.api.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class LogoSyncDTO {
    private String name;
    private String path;
    private String league;
}
