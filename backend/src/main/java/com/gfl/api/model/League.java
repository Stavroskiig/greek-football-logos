package com.gfl.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "league")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class League {

    @Id
    private String id;

    private String name;

    private Integer level;
}
