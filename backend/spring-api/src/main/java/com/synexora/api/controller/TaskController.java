package com.synexora.api.controller;

import com.synexora.api.model.Task;
import com.synexora.api.model.User;
import com.synexora.api.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskRepository taskRepository;

    @GetMapping
    public ResponseEntity<List<Task>> getTasks(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String status
    ) {
        if (status != null) {
            return ResponseEntity.ok(taskRepository.findByUserIdAndStatus(user.getId(), status));
        }
        return ResponseEntity.ok(taskRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Task> createTask(
            @AuthenticationPrincipal User user,
            @RequestBody Task task
    ) {
        task.setUser(user);
        Task saved = taskRepository.save(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestBody Task updated
    ) {
        return taskRepository.findById(id)
                .filter(task -> task.getUser().getId().equals(user.getId()))
                .map(task -> {
                    if (updated.getTitle() != null) task.setTitle(updated.getTitle());
                    if (updated.getStatus() != null) task.setStatus(updated.getStatus());
                    if (updated.getPriority() != null) task.setPriority(updated.getPriority());
                    if (updated.getDueDate() != null) task.setDueDate(updated.getDueDate());
                    return ResponseEntity.ok(taskRepository.save(task));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        taskRepository.findById(id).ifPresent(task -> {
            if (task.getUser().getId().equals(user.getId())) {
                taskRepository.delete(task);
            }
        });
        return ResponseEntity.noContent().build();
    }
}
