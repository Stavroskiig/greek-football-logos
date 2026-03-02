package com.gfl.api.repository;

import com.gfl.api.model.TeamLogo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamLogoRepository extends JpaRepository<TeamLogo, String> {
    List<TeamLogo> findByLeague(String league);

    List<TeamLogo> findByNameContainingIgnoreCase(String name);
}
