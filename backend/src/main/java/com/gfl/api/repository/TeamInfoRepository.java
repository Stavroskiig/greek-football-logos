package com.gfl.api.repository;

import com.gfl.api.model.TeamInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TeamInfoRepository extends JpaRepository<TeamInfo, String> {
}
