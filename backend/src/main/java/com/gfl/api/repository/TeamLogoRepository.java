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

    Page<TeamLogo> findByIdIn(java.util.List<String> ids, Pageable pageable);

    Page<TeamLogo> findByIdInAndNameContainingIgnoreCase(java.util.List<String> ids, String name, Pageable pageable);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM team_logo ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    java.util.List<TeamLogo> findRandomLogos(@org.springframework.data.repository.query.Param("limit") int limit);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM team_logo WHERE league IN :leagues ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    java.util.List<TeamLogo> findRandomLogosByLeagues(
            @org.springframework.data.repository.query.Param("leagues") java.util.List<String> leagues,
            @org.springframework.data.repository.query.Param("limit") int limit);
}
