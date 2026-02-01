package com.careerarchitect.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Project Recommendation DTO
 * 
 * UPDATED FOR LOVABLE DESIGN:
 * - Added system_architecture for high-level design description
 * - Added mock_interview_questions for interview preparation
 * - Updated tech_stack to include icons
 * 
 * @version 5.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectRecommendation {
    
    /**
     * Project type classification
     * Values: "Gap Filler", "Strength Builder", "Showstopper"
     */
    private String type;
    
    /**
     * Project title
     */
    private String title;
    
    /**
     * One-line compelling tagline
     */
    private String tagline;
    
    /**
     * Detailed project description (2-3 sentences)
     */
    private String description;
    
    /**
     * NEW: System architecture overview
     * High-level design explanation (2-3 sentences)
     * Describes data flow, components, and architectural patterns
     */
    @JsonProperty("system_architecture")
    private String systemArchitecture;
    
    /**
     * Technologies required for this project
     * NOW INCLUDES ICON FIELD
     */
    @JsonProperty("tech_stack")
    private List<TechStackItem> techStack;
    
    /**
     * Week-by-week learning milestones
     */
    @JsonProperty("learning_milestones")
    private List<LearningMilestone> learningMilestones;
    
    /**
     * NEW: Mock interview questions
     * 3-5 technical questions specific to this project
     * Used for interview preparation feature
     */
    @JsonProperty("mock_interview_questions")
    private List<String> mockInterviewQuestions;
    
    /**
     * Ready-to-use resume bullet points
     */
    @JsonProperty("resume_bullets")
    private List<String> resumeBullets;
}
