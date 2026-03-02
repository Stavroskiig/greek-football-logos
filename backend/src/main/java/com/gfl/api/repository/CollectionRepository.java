package com.gfl.api.repository;

import com.gfl.api.model.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, String> {
    List<Collection> findByIsPublicTrue();
}
