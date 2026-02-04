package com.careerarchitect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.annotation.JsonIgnore; // 👈 1. ADD THIS IMPORT

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "analyses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Analysis {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore // 👈 2. ADD THIS ANNOTATION
    private User user; 

    @Column(name = "candidate_name")
    private String candidateName;

    @Column(name = "overall_score", nullable = false)
    private Integer overallScore;

    @Column(name = "full_analysis_json", columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private String fullAnalysisJson;

    @Column(name = "resume_filename")
    private String resumeFilename;

    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    @Column(name = "analysis_version")
    private String analysisVersion;

    @Column(name = "ai_model")
    private String aiModel;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}