package com.gfl.api.repository;

import com.gfl.api.model.League;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LeagueRepository extends JpaRepository<League, String> {
    Optional<League> findByName(String name);
}
