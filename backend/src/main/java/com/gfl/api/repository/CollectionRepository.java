package com.gfl.api.repository;

import com.gfl.api.model.Collection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, String> {
    Page<Collection> findByIsPublicTrue(Pageable pageable);

    Page<Collection> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description,
            Pageable pageable);

    Page<Collection> findByIsPublicTrueAndNameContainingIgnoreCaseOrIsPublicTrueAndDescriptionContainingIgnoreCase(
            String name, String description, Pageable pageable);
}
