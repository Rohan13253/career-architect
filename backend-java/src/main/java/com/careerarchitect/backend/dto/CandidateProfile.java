package com.careerarchitect.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Candidate Profile DTO
 * 
 * UPDATED FOR LOVABLE DESIGN:
 * - Added current_skills (skills found in resume)
 * - Added market_fit_level (Entry/Junior/Senior)
 * - Maintains backward compatibility
 * 
 * @version 5.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CandidateProfile {
    
    /**
     * Candidate's full name extracted from resume
     */
    private String name;
    
    /**
     * Overall score out of 100
     */
    @JsonProperty("total_score")
    private Integer totalScore;
    
    /**
     * Market fit classification
     * Values: "Entry", "Junior", "Senior"
     */
    @JsonProperty("market_fit_level")
    private String marketFitLevel;
    
    /**
     * Whether GitHub code has been verified
     */
    @JsonProperty("code_verified")
    private Boolean codeVerified;
    
    /**
     * GitHub username if found
     */
    @JsonProperty("github_handle")
    private String githubHandle;
    
    /**
     * NEW: Skills currently possessed by the candidate
     * These will display with GREEN checkmarks in the UI
     */
    @JsonProperty("current_skills")
    private List<String> currentSkills;
    
    /**
     * Skills the candidate needs to acquire
     * These will display with RED checkboxes in the UI
     */
    @JsonProperty("missing_skills")
    private List<String> missingSkills;
}
