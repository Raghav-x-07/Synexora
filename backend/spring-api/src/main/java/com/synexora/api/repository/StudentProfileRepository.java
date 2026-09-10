package com.synexora.api.repository;

import com.synexora.api.model.StudentProfile;
import com.synexora.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, UUID> {
    Optional<StudentProfile> findByUser(User user);
    Optional<StudentProfile> findByUserId(UUID userId);
}
