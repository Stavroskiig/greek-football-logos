package com.gfl.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "team")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Team {

    @Id
    private String id;

    private String name;

    private String fullName;

    private Integer founded;

    @Column(columnDefinition = "TEXT")
    private String history;

    private String website;

    @ManyToOne
    @JoinColumn(name = "league_id")
    private League league;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "primary_logo_id")
    private TeamLogo primaryLogo;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeamLogo> historicalLogos = new ArrayList<>();

    @Embedded
    private Stadium stadium;

    @Embedded
    private Colors colors;

    @Embedded
    private Achievements achievements;

    @Embedded
    private SocialMedia socialMedia;
}
