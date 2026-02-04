package com.careerarchitect.repository;

import com.careerarchitect.model.Analysis;
import com.careerarchitect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AnalysisRepository extends JpaRepository<Analysis, UUID> {
    // This allows you to fetch ONLY your own history
    List<Analysis> findByUserOrderByCreatedAtDesc(User user);
}