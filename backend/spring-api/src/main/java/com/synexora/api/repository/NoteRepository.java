package com.synexora.api.repository;

import com.synexora.api.model.Note;
import com.synexora.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NoteRepository extends JpaRepository<Note, UUID> {
    List<Note> findByUserOrderByCreatedAtDesc(User user);
    List<Note> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
