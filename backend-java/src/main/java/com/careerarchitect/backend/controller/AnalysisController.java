package com.careerarchitect.backend.controller;

import com.careerarchitect.backend.dto.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Analysis Controller (PRODUCTION VERSION)
 * 
 * Updated to support Job Description (JD) Gap Analysis
 * 
 * Handles resume analysis requests by acting as a gateway between
 * the React frontend and Python AI service.
 * 
 * NEW: Accepts optional Job Description parameter for targeted analysis
 * 
 * @author CareerArchitect Team
 * @version 2.0.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1")
public class AnalysisController {

    private final RestTemplate restTemplate;
    
    @Value("${ai.service.url:http://localhost:5001}")
    private String aiServiceUrl;
    
    @Value("${ai.service.timeout:30000}")
    private int aiServiceTimeout;

    public AnalysisController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Analyze Resume Endpoint (UPDATED FOR JD SUPPORT)
     * 
     * Accepts a PDF resume file and optional Job Description text
     * Returns AI-powered career analysis
     * 
     * @param file PDF resume file (required)
     * @param jd Job Description text (optional)
     * @return Analysis results in JSON format
     */
    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "jd", required = false) String jd) {
        
        log.info("=== Resume Analysis Request Received ===");
        log.info("JD Provided: {}", jd != null ? "YES (" + jd.length() + " chars)" : "NO");
        
        // === VALIDATION: Check if file exists ===
        if (file == null || file.isEmpty()) {
            log.warn("Empty file received in request");
            return ResponseEntity
                    .badRequest()
                    .body(ErrorResponse.of("File is empty or missing"));
        }

        // === VALIDATION: Check file type ===
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
            log.warn("Non-PDF file uploaded: {}", filename);
            return ResponseEntity
                    .badRequest()
                    .body(ErrorResponse.of("Only PDF files are supported"));
        }

        // === VALIDATION: Check file size (10MB limit) ===
        long fileSizeKB = file.getSize() / 1024;
        if (file.getSize() > 10 * 1024 * 1024) { // 10MB
            log.warn("File too large: {}KB", fileSizeKB);
            return ResponseEntity
                    .badRequest()
                    .body(ErrorResponse.of("File size exceeds 10MB limit"));
        }

        log.info("File validated: {} ({}KB)", filename, fileSizeKB);

        try {
            // === PREPARE MULTIPART REQUEST WITH OPTIONAL JD ===
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Add file
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });
            
            // Add Job Description if provided
            if (jd != null && !jd.trim().isEmpty()) {
                body.add("jd", jd.trim());
                log.info("Including Job Description in request ({} chars)", jd.length());
            }

            HttpEntity<MultiValueMap<String, Object>> requestEntity = 
                new HttpEntity<>(body, headers);

            // === FORWARD TO PYTHON AI SERVICE ===
            String aiEndpoint = aiServiceUrl + "/analyze";
            log.info("Forwarding to AI Service: {}", aiEndpoint);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                    aiEndpoint,
                    HttpMethod.POST,
                    requestEntity,
                    Map.class
            );

            log.info("AI Service responded: {} - Status: {}", 
                response.getBody() != null ? "Success" : "Empty",
                response.getStatusCode()
            );
            
            // Add analysis mode to response metadata
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && jd != null) {
                responseBody.put("jd_analysis", true);
            }
            
            return ResponseEntity.ok(responseBody);

        } catch (ResourceAccessException e) {
            // === ERROR: AI Service is not reachable ===
            log.error("AI Service is unavailable: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ErrorResponse.of(
                        "AI Service Unavailable",
                        "Cannot connect to Python AI service. Please ensure it is running on port 5001.",
                        "/api/v1/analyze"
                    ));
                    
        } catch (HttpClientErrorException e) {
            // === ERROR: 4xx error from AI Service ===
            log.error("AI Service returned client error: {} - {}", 
                e.getStatusCode(), e.getMessage());
            return ResponseEntity
                    .status(e.getStatusCode())
                    .body(ErrorResponse.of(
                        "AI Service Error",
                        e.getResponseBodyAsString(),
                        "/api/v1/analyze"
                    ));
                    
        } catch (HttpServerErrorException e) {
            // === ERROR: 5xx error from AI Service ===
            log.error("AI Service internal error: {} - {}", 
                e.getStatusCode(), e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of(
                        "AI Service Internal Error",
                        "The AI service encountered an error while processing your request.",
                        "/api/v1/analyze"
                    ));
                    
        } catch (IOException e) {
            // === ERROR: File reading error ===
            log.error("Error reading file: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of(
                        "File Processing Error",
                        e.getMessage(),
                        "/api/v1/analyze"
                    ));
                    
        } catch (Exception e) {
            // === ERROR: Unexpected error ===
            log.error("Unexpected error during analysis", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of(
                        "Internal Server Error",
                        "An unexpected error occurred. Please try again.",
                        "/api/v1/analyze"
                    ));
        }
    }

    /**
     * Health Check Endpoint
     * 
     * @return Service health status
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "healthy");
        health.put("service", "Backend Gateway");
        health.put("version", "2.0.0");
        health.put("port", 8080);
        
        // Check AI Service connectivity
        try {
            ResponseEntity<Map> aiHealth = restTemplate.getForEntity(
                aiServiceUrl + "/health", 
                Map.class
            );
            
            Map<String, Object> aiHealthData = aiHealth.getBody();
            if (aiHealthData != null) {
                health.put("ai_service", "connected");
                health.put("ai_version", aiHealthData.get("version"));
                health.put("ai_gemini_enabled", aiHealthData.get("gemini_api"));
            } else {
                health.put("ai_service", "connected");
            }
        } catch (Exception e) {
            health.put("ai_service", "disconnected");
            log.warn("AI Service health check failed: {}", e.getMessage());
        }
        
        return ResponseEntity.ok(health);
    }

    /**
     * Root Endpoint - API Information
     */
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> apiInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("service", "CareerArchitect Backend Gateway");
        info.put("version", "2.0.0");
        info.put("port", 8080);
        info.put("features", new String[]{
            "Resume Analysis",
            "Job Description Gap Analysis",
            "Gemini AI Integration"
        });
        
        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("analyze", "POST /api/v1/analyze?file=<pdf>&jd=<optional>");
        endpoints.put("health", "GET /api/v1/health");
        info.put("endpoints", endpoints);
        
        return ResponseEntity.ok(info);
    }
}
