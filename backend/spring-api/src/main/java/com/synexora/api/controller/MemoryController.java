package com.synexora.api.controller;

import com.synexora.api.model.Memory;
import com.synexora.api.model.User;
import com.synexora.api.repository.MemoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/memories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MemoryController {

    private final MemoryRepository memoryRepository;

    @GetMapping
    public ResponseEntity<List<Memory>> getConfirmedMemories(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String category
    ) {
        if (category != null && !category.equalsIgnoreCase("ALL")) {
            return ResponseEntity.ok(memoryRepository.findByUserIdAndCategoryAndIsConfirmed(user.getId(), category, true));
        }
        return ResponseEntity.ok(memoryRepository.findByUserIdAndIsConfirmedOrderByCreatedAtDesc(user.getId(), true));
    }

    @PostMapping
    public ResponseEntity<Memory> createMemory(
            @AuthenticationPrincipal User user,
            @RequestBody Memory memory
    ) {
        memory.setUser(user);
        memory.setIsConfirmed(true);
        Memory saved = memoryRepository.save(memory);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMemory(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        memoryRepository.findById(id).ifPresent(memory -> {
            if (memory.getUser().getId().equals(user.getId())) {
                memoryRepository.delete(memory);
            }
        });
        return ResponseEntity.noContent().build();
    }
}
