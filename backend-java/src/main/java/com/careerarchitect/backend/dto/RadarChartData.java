package com.careerarchitect.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Radar Chart Data Point DTO
 * 
 * Represents a single skill's user score vs market demand
 * 
 * @version 5.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RadarChartData {
    
    /**
     * Skill name (e.g., "Backend Development", "System Design")
     */
    private String skill;
    
    /**
     * User's current score for this skill (0-100)
     */
    @JsonProperty("userScore")
    private Integer userScore;
    
    /**
     * Market demand/standard for this skill (0-100)
     */
    @JsonProperty("marketScore")
    private Integer marketScore;
}
