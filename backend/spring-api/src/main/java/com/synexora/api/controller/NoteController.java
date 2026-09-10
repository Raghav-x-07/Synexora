package com.synexora.api.controller;

import com.synexora.api.model.Note;
import com.synexora.api.model.User;
import com.synexora.api.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NoteController {

    private final NoteRepository noteRepository;

    @GetMapping
    public ResponseEntity<List<Note>> getNotes(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(noteRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Note> createNote(
            @AuthenticationPrincipal User user,
            @RequestBody Note note
    ) {
        note.setUser(user);
        Note saved = noteRepository.save(note);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestBody Note updated
    ) {
        return noteRepository.findById(id)
                .filter(note -> note.getUser().getId().equals(user.getId()))
                .map(note -> {
                    if (updated.getTitle() != null) note.setTitle(updated.getTitle());
                    if (updated.getContent() != null) note.setContent(updated.getContent());
                    if (updated.getCourseCode() != null) note.setCourseCode(updated.getCourseCode());
                    if (updated.getTags() != null) note.setTags(updated.getTags());
                    return ResponseEntity.ok(noteRepository.save(note));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNote(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        noteRepository.findById(id).ifPresent(note -> {
            if (note.getUser().getId().equals(user.getId())) {
                noteRepository.delete(note);
            }
        });
        return ResponseEntity.noContent().build();
    }
}
