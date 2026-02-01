package com.careerarchitect.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Error Response DTO
 * 
 * Standardized error response format for API errors
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    
    private String status;
    private String message;
    private String error;
    private LocalDateTime timestamp;
    private String path;
    
    /**
     * Create a simple error response with just message
     */
    public static ErrorResponse of(String message) {
        return ErrorResponse.builder()
                .status("error")
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    /**
     * Create a detailed error response
     */
    public static ErrorResponse of(String message, String error, String path) {
        return ErrorResponse.builder()
                .status("error")
                .message(message)
                .error(error)
                .path(path)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
