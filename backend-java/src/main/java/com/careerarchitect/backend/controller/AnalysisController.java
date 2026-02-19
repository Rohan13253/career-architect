package com.careerarchitect.backend.controller;

import com.careerarchitect.backend.dto.ErrorResponse;
import com.careerarchitect.model.Analysis;
import com.careerarchitect.model.User;
import com.careerarchitect.repository.AnalysisRepository;
import com.careerarchitect.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/v1")
public class AnalysisController {

    private final RestTemplate restTemplate;
    private final AnalysisRepository analysisRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${ai.service.url:http://localhost:5001}")
    private String aiServiceUrl;

    public AnalysisController(
            RestTemplate restTemplate,
            AnalysisRepository analysisRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper
    ) {
        this.restTemplate = restTemplate;
        this.analysisRepository = analysisRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    // ========================= WAKE UP ENDPOINT =========================
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("Server is awake!");
    }

    // ========================= ANALYZE RESUME =========================

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "jd", required = false) String jd,
            @RequestHeader(value = "X-Firebase-UID", required = false) String firebaseUid,
            @RequestHeader(value = "X-User-Email", required = false) String email
    ) {
        // Calls the helper with RESUME type
        return processAnalysis(file, jd, firebaseUid, email, "/analyze", "RESUME");
    }

    // ========================= ANALYZE LINKEDIN (NEW) =========================

    @PostMapping("/analyze-linkedin")
    public ResponseEntity<?> analyzeLinkedin(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-Firebase-UID", required = false) String firebaseUid,
            @RequestHeader(value = "X-User-Email", required = false) String email
    ) {
        // Calls the helper with LINKEDIN type (No JD needed)
        return processAnalysis(file, null, firebaseUid, email, "/analyze-linkedin", "LINKEDIN");
    }

    // ========================= SHARED LOGIC (THE ENGINE) =========================

    private ResponseEntity<?> processAnalysis(
            MultipartFile file,
            String jd,
            String firebaseUid,
            String email,
            String aiEndpoint,
            String type
    ) {
        log.info("Processing {} Analysis for UID: {}", type, firebaseUid);

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(ErrorResponse.of("File is empty"));
        }

        try {
            // 1. GET OR CREATE USER
            User user = null;
            if (firebaseUid != null && !firebaseUid.isBlank()) {
                user = userRepository.findByFirebaseUid(firebaseUid)
                        .orElseGet(() -> userRepository.save(
                                User.builder()
                                        .firebaseUid(firebaseUid)
                                        .email(email != null ? email : "unknown@example.com")
                                        .fullName(extractNameFromEmail(email))
                                        .lastLogin(LocalDateTime.now())
                                        .build()
                        ));
                user.setLastLogin(LocalDateTime.now());
                userRepository.save(user);
            }

            // 2. PREPARE AI REQUEST
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() { return file.getOriginalFilename(); }
            });

            if (jd != null && !jd.isBlank()) {
                body.add("jd", jd.trim());
            }

            // 3. CALL PYTHON AI SERVICE
            ResponseEntity<Map> aiResponse = restTemplate.exchange(
                    aiServiceUrl + aiEndpoint, // Calls either /analyze or /analyze-linkedin
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class
            );

            Map<String, Object> aiResult = aiResponse.getBody();
            if (aiResult == null) {
                return ResponseEntity.status(500).body(ErrorResponse.of("AI returned empty response"));
            }

            // 4. PARSE SCORES (Works for both Resume & LinkedIn JSON structures)
            int score = 0;
            String candidateName = "Unknown";

            // Try to find score in "candidate_profile" (Resume) OR top-level "overall_score" (LinkedIn)
            if (aiResult.get("candidate_profile") instanceof Map profile) {
                Object nObj = profile.get("name");
                if (nObj != null) candidateName = nObj.toString();

                Object s = profile.get("total_score");
                if (s instanceof Number n) score = n.intValue();
            }

            // Fallback for LinkedIn specific score location
            if (aiResult.containsKey("overall_score") && aiResult.get("overall_score") instanceof Number n) {
                score = n.intValue();
            }

            // 5. SAVE TO DATABASE
            Analysis.AnalysisBuilder builder = Analysis.builder()
                    .resumeFilename(file.getOriginalFilename())
                    .jobDescription(jd)
                    .candidateName(candidateName)
                    .overallScore(score)
                    .fullAnalysisJson(objectMapper.writeValueAsString(aiResult))
                    .analysisVersion("v19.0")
                    .aiModel("llama-3.3-70b")
                    .analysisType(type); // ✅ Saves "RESUME" or "LINKEDIN"

            if (user != null) builder.user(user);
            Analysis saved = analysisRepository.save(builder.build());

            // 6. UPDATE USER STATS
            if (user != null) {
                user.setTotalAnalyses(user.getTotalAnalyses() + 1);
                // We keep "Best Score" as the max of any analysis for now
                user.setBestScore(Math.max(user.getBestScore(), score));
                userRepository.save(user);
            }

            // 7. RETURN RESPONSE
            aiResult.put("analysis_id", saved.getId().toString());
            aiResult.put("analysis_type", type);
            aiResult.put("saved_to_database", true);

            return ResponseEntity.ok(aiResult);

        } catch (Exception e) {
            log.error("Analysis error", e);
            return ResponseEntity.status(500)
                    .body(ErrorResponse.of("Server error", e.getMessage(), "/api/v1/" + type.toLowerCase()));
        }
    }

    // ========================= HISTORY =========================

    @GetMapping("/history")
    public ResponseEntity<?> history(
            @RequestHeader("X-Firebase-UID") String firebaseUid
    ) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Analysis> list = analysisRepository.findByUserOrderByCreatedAtDesc(user);

        return ResponseEntity.ok(Map.of(
                "total", list.size(),
                "analyses", list
        ));
    }

    // ========================= DELETE =========================

    @DeleteMapping("/analysis/{id}")
    public ResponseEntity<?> delete(
            @PathVariable UUID id,
            @RequestHeader("X-Firebase-UID") String firebaseUid
    ) {
        Analysis analysis = analysisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Analysis not found"));

        if (analysis.getUser() == null ||
                !analysis.getUser().getFirebaseUid().equals(firebaseUid)) {
            return ResponseEntity.status(403)
                    .body(ErrorResponse.of("Access denied"));
        }

        analysisRepository.delete(analysis);

        return ResponseEntity.ok(Map.of("success", true));
    }

    // ========================= HELPERS =========================

    private String extractNameFromEmail(String email) {
        if (email == null) return "User";
        String name = email.split("@")[0];
        return name.substring(0, 1).toUpperCase() + name.substring(1);
    }
}