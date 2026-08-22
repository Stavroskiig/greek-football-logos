package com.gfl.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Entity
@Table(name = "team_logo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamLogo {

    @Id
    private String id;

    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Team team;

    private Integer startYear;
    private Integer endYear;
    @ElementCollection
    @CollectionTable(name = "team_logo_tags", joinColumns = @JoinColumn(name = "team_logo_id"))
    @Column(name = "tag")
    private List<String> tags;
}
