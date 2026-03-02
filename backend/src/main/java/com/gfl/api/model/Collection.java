package com.gfl.api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "collection")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Collection {

    @Id
    private String id;

    private String name;

    private String description;

    @ElementCollection
    @CollectionTable(name = "collection_logos", joinColumns = @JoinColumn(name = "collection_id"))
    @Column(name = "logo_id")
    private List<String> logoIds;

    @ElementCollection
    @CollectionTable(name = "collection_tags", joinColumns = @JoinColumn(name = "collection_id"))
    @Column(name = "tag")
    private List<String> tags;

    @JsonProperty("isPublic")
    private boolean isPublic;

    private String createdBy;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String coverImage;

    private boolean featured;
}
