package com.gfl.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "team_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamInfo {

    @Id
    private String id;

    private String name;

    private String fullName;

    private Integer founded;

    @Column(columnDefinition = "TEXT")
    private String history;

    private String website;

    @Embedded
    private Stadium stadium;

    @Embedded
    private Colors colors;

    @Embedded
    private Achievements achievements;

    @Embedded
    private SocialMedia socialMedia;
}
