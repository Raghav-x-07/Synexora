package com.synexora.api.controller;

import com.synexora.api.model.CalendarEvent;
import com.synexora.api.model.User;
import com.synexora.api.repository.CalendarEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/calendar/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CalendarController {

    private final CalendarEventRepository calendarEventRepository;

    @GetMapping
    public ResponseEntity<List<CalendarEvent>> getEvents(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(calendarEventRepository.findByUserIdOrderByStartTimeAsc(user.getId()));
    }

    @PostMapping
    public ResponseEntity<CalendarEvent> createEvent(
            @AuthenticationPrincipal User user,
            @RequestBody CalendarEvent event
    ) {
        event.setUser(user);
        CalendarEvent saved = calendarEventRepository.save(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        calendarEventRepository.findById(id).ifPresent(event -> {
            if (event.getUser().getId().equals(user.getId())) {
                calendarEventRepository.delete(event);
            }
        });
        return ResponseEntity.noContent().build();
    }
}
