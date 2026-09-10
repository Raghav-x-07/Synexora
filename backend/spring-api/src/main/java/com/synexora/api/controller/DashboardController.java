package com.synexora.api.controller;

import com.synexora.api.model.*;
import com.synexora.api.repository.*;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final TaskRepository taskRepository;
    private final MemoryRepository memoryRepository;
    private final NoteRepository noteRepository;
    private final GoalRepository goalRepository;
    private final CalendarEventRepository calendarEventRepository;
    private final StudentProfileRepository profileRepository;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary(@AuthenticationPrincipal User user) {
        StudentProfile profile = profileRepository.findByUser(user).orElse(null);
        List<Task> tasks = taskRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<Memory> memories = memoryRepository.findByUserIdAndIsConfirmedOrderByCreatedAtDesc(user.getId(), true);
        List<Goal> goals = goalRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<CalendarEvent> events = calendarEventRepository.findByUserIdOrderByStartTimeAsc(user.getId());

        long completedTasks = tasks.stream().filter(t -> "DONE".equalsIgnoreCase(t.getStatus())).count();

        DashboardSummaryDto summary = DashboardSummaryDto.builder()
                .studentName(user.getFullName())
                .masteryScore(profile != null ? profile.getMasteryScore() : 84.0)
                .studyStreakDays(profile != null ? profile.getStudyStreakDays() : 14)
                .totalTasks(tasks.size())
                .completedTasks((int) completedTasks)
                .totalMemories(memories.size())
                .activeGoals(goals.size())
                .upcomingEventsCount(events.size())
                .recentTasks(tasks.stream().limit(5).toList())
                .recentMemories(memories.stream().limit(3).toList())
                .activeGoalsList(goals.stream().limit(3).toList())
                .upcomingEvents(events.stream().limit(3).toList())
                .build();

        return ResponseEntity.ok(summary);
    }

    @Data
    @Builder
    public static class DashboardSummaryDto {
        private String studentName;
        private Double masteryScore;
        private Integer studyStreakDays;
        private Integer totalTasks;
        private Integer completedTasks;
        private Integer totalMemories;
        private Integer activeGoals;
        private Integer upcomingEventsCount;
        private List<Task> recentTasks;
        private List<Memory> recentMemories;
        private List<Goal> activeGoalsList;
        private List<CalendarEvent> upcomingEvents;
    }
}
