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

    // ========================= ANALYZE =========================

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "jd", required = false) String jd,
            @RequestHeader(value = "X-Firebase-UID", required = false) String firebaseUid,
            @RequestHeader(value = "X-User-Email", required = false) String email
    ) {
        log.info("Firebase UID: {}", firebaseUid);

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(ErrorResponse.of("File is empty"));
        }

        try {
            // ---------- USER ----------
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

            // ---------- AI SERVICE ----------
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

            if (jd != null && !jd.isBlank()) {
                body.add("jd", jd.trim());
            }

            ResponseEntity<Map> aiResponse = restTemplate.exchange(
                    aiServiceUrl + "/analyze",
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class
            );

            Map<String, Object> aiResult = aiResponse.getBody();
            if (aiResult == null) {
                return ResponseEntity.status(500)
                        .body(ErrorResponse.of("AI returned empty response"));
            }

            // ---------- PARSE ----------
            int score = 0;
            String candidateName = "Unknown";

            if (aiResult.get("candidate_profile") instanceof Map profile) {
                Object s = profile.get("total_score");
                if (s instanceof Number n) score = n.intValue();

                Object nObj = profile.get("name");
                if (nObj != null) candidateName = nObj.toString();
            }

            // ---------- SAVE ----------
            Analysis.AnalysisBuilder builder = Analysis.builder()
                    .resumeFilename(file.getOriginalFilename())
                    .jobDescription(jd)
                    .candidateName(candidateName)
                    .overallScore(score)
                    .fullAnalysisJson(objectMapper.writeValueAsString(aiResult))
                    .analysisVersion("v18.0")
                    .aiModel("llama-3.3-70b");

            if (user != null) builder.user(user);

            Analysis saved = analysisRepository.save(builder.build());

            if (user != null) {
                user.setTotalAnalyses(user.getTotalAnalyses() + 1);
                user.setBestScore(Math.max(user.getBestScore(), score));
                userRepository.save(user);
            }

            aiResult.put("analysis_id", saved.getId().toString());
            aiResult.put("saved_to_database", true);

            return ResponseEntity.ok(aiResult);

        } catch (Exception e) {
            log.error("Analysis error", e);
            return ResponseEntity.status(500)
                    .body(ErrorResponse.of("Server error", e.getMessage(), "/api/v1/analyze"));
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
