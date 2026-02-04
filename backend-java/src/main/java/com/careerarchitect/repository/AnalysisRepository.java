package com.careerarchitect.repository;

import com.careerarchitect.model.Analysis;
import com.careerarchitect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AnalysisRepository extends JpaRepository<Analysis, UUID> {
    // Fetches history for a specific user, newest first
    List<Analysis> findByUserOrderByCreatedAtDesc(User user);
}