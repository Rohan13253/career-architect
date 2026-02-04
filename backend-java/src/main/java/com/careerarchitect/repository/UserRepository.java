package com.careerarchitect.repository;

import com.careerarchitect.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    // Used to link the Firebase Login to the Postgres User ID
    Optional<User> findByFirebaseUid(String firebaseUid);
}