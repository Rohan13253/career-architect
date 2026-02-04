package com.careerarchitect.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "firebase_uid", unique = true, nullable = false)
    private String firebaseUid;

    @Column(unique = true, nullable = false)
    private String email;

    // ✅ FIX: Ensure this is named 'fullName' to match the Controller's .fullName()
    @Column(name = "full_name")
    private String fullName; 

    @Column(name = "total_analyses")
    @Builder.Default
    private Integer totalAnalyses = 0;

    @Column(name = "best_score")
    @Builder.Default
    private Integer bestScore = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;
    
    private LocalDateTime lastLogin;
}