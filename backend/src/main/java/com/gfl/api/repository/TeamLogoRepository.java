package com.gfl.api.repository;

import com.gfl.api.model.TeamLogo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamLogoRepository extends JpaRepository<TeamLogo, String> {
    Page<TeamLogo> findByLeague(String league, Pageable pageable);

    Page<TeamLogo> findByLeagueAndNameContainingIgnoreCase(String league, String name, Pageable pageable);

    Page<TeamLogo> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
