package com.gfl.api.repository;

import com.gfl.api.model.Team;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamRepository extends JpaRepository<Team, String> {
    Page<Team> findByLeagueId(String leagueId, Pageable pageable);
    Page<Team> findByLeagueIdAndNameContainingIgnoreCase(String leagueId, String name, Pageable pageable);
    Page<Team> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<Team> findByIdIn(java.util.List<String> ids, Pageable pageable);
    Page<Team> findByIdInAndNameContainingIgnoreCase(java.util.List<String> ids, String name, Pageable pageable);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM team ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    java.util.List<Team> findRandomTeams(@org.springframework.data.repository.query.Param("limit") int limit);

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM team WHERE league_id IN :leagueIds ORDER BY RANDOM() LIMIT :limit", nativeQuery = true)
    java.util.List<Team> findRandomTeamsByLeagues(
            @org.springframework.data.repository.query.Param("leagueIds") java.util.List<String> leagueIds,
            @org.springframework.data.repository.query.Param("limit") int limit);
}
