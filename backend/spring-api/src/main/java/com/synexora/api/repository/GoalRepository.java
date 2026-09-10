package com.synexora.api.repository;

import com.synexora.api.model.Goal;
import com.synexora.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GoalRepository extends JpaRepository<Goal, UUID> {
    List<Goal> findByUserOrderByCreatedAtDesc(User user);
    List<Goal> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
