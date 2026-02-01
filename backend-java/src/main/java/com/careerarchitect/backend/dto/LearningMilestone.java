package com.careerarchitect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Learning Milestone DTO
 * 
 * Represents a week-by-week task in the project roadmap
 * 
 * @version 5.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningMilestone {
    
    /**
     * Week number (1, 2, 3, 4...)
     */
    private Integer week;
    
    /**
     * Task description for this week
     */
    private String task;
}
