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

    private String shortName;

    private Integer founded;

    @Column(columnDefinition = "TEXT")
    private String history;

    private String website;

    @Column(name = "history_en", columnDefinition = "TEXT")
    private String historyEn;

    @Column(name = "history_el", columnDefinition = "TEXT")
    private String historyEl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "league_id")
    private League league;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_logo_id")
    private TeamLogo primaryLogo;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("startYear ASC")
    private List<TeamLogo> historicalLogos = new ArrayList<>();

    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE}, fetch = FetchType.LAZY)
    @JoinColumn(name = "stadium_id")
    private Stadium stadium;

    @Embedded
    private Colors colors;

    @Embedded
    private Achievements achievements;

    @Embedded
    private SocialMedia socialMedia;
}
