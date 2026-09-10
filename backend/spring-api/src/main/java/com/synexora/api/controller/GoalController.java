package com.synexora.api.controller;

import com.synexora.api.model.Goal;
import com.synexora.api.model.User;
import com.synexora.api.repository.GoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/goals")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GoalController {

    private final GoalRepository goalRepository;

    @GetMapping
    public ResponseEntity<List<Goal>> getGoals(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(goalRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Goal> createGoal(
            @AuthenticationPrincipal User user,
            @RequestBody Goal goal
    ) {
        goal.setUser(user);
        Goal saved = goalRepository.save(goal);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestBody Goal updated
    ) {
        return goalRepository.findById(id)
                .filter(goal -> goal.getUser().getId().equals(user.getId()))
                .map(goal -> {
                    if (updated.getTitle() != null) goal.setTitle(updated.getTitle());
                    if (updated.getProgressPercentage() != null) goal.setProgressPercentage(updated.getProgressPercentage());
                    if (updated.getStatus() != null) goal.setStatus(updated.getStatus());
                    if (updated.getTargetDate() != null) goal.setTargetDate(updated.getTargetDate());
                    return ResponseEntity.ok(goalRepository.save(goal));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        goalRepository.findById(id).ifPresent(goal -> {
            if (goal.getUser().getId().equals(user.getId())) {
                goalRepository.delete(goal);
            }
        });
        return ResponseEntity.noContent().build();
    }
}
