package com.careerarchitect.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Analysis Response DTO
 * 
 * Complete response structure from Python AI service
 * Maps to frontend requirements for Lovable design
 * 
 * @version 5.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResponse {
    
    /**
     * Response status: "success" or "error"
     */
    private String status;
    
    /**
     * Candidate profile with current and missing skills
     */
    @JsonProperty("candidate_profile")
    private CandidateProfile candidateProfile;
    
    /**
     * Radar chart data for skill visualization
     */
    @JsonProperty("radar_chart_data")
    private List<RadarChartData> radarChartData;
    
    /**
     * Project recommendations with architecture and interview questions
     */
    @JsonProperty("recommended_projects")
    private List<ProjectRecommendation> recommendedProjects;
    
    /**
     * Optional: JD analysis flag (set by Java backend)
     */
    @JsonProperty("jd_analysis")
    private Boolean jdAnalysis;
}
