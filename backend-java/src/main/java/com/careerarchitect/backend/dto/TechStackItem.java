package com.careerarchitect.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Tech Stack Item DTO
 * 
 * UPDATED FOR LOVABLE DESIGN:
 * - Added icon field for UI rendering
 * 
 * @version 5.0.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechStackItem {
    
    /**
     * Technology name (e.g., "Spring Boot", "React")
     */
    private String name;
    
    /**
     * How this technology is used in the project
     */
    private String usage;
    
    /**
     * NEW: Icon name for UI rendering
     * Examples: "React", "Docker", "AWS", "Spring"
     * Frontend will map these to actual icon components
     */
    private String icon;
}
