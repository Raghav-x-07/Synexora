package com.synexora.api.repository;

import com.synexora.api.model.Memory;
import com.synexora.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MemoryRepository extends JpaRepository<Memory, UUID> {
    List<Memory> findByUserAndIsConfirmedOrderByCreatedAtDesc(User user, Boolean isConfirmed);
    List<Memory> findByUserIdAndIsConfirmedOrderByCreatedAtDesc(UUID userId, Boolean isConfirmed);
    List<Memory> findByUserIdAndCategoryAndIsConfirmed(UUID userId, String category, Boolean isConfirmed);
}
