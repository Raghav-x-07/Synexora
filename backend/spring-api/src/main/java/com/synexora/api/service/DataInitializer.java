package com.synexora.api.service;

import com.synexora.api.model.*;
import com.synexora.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final MemoryRepository memoryRepository;
    private final TaskRepository taskRepository;
    private final NoteRepository noteRepository;
    private final GoalRepository goalRepository;
    private final CalendarEventRepository calendarEventRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.findByEmail("alex.rivera@synexora.io").isPresent()) {
            return;
        }

        log.info("Initializing Synexora demo student dataset...");

        // 1. Seed Demo User
        User student = User.builder()
                .email("alex.rivera@synexora.io")
                .password(passwordEncoder.encode("Password123!"))
                .fullName("Alex Rivera")
                .role(Role.ROLE_STUDENT)
                .build();

        User savedStudent = userRepository.save(student);

        // 2. Seed Student Profile
        StudentProfile profile = StudentProfile.builder()
                .user(savedStudent)
                .major("Computer Science & Engineering")
                .academicYear("Year 3")
                .gpa(3.85)
                .masteryScore(84.0)
                .studyStreakDays(14)
                .learningStylePreference("Interactive Code Traces & Socratic Hints")
                .build();
        profileRepository.save(profile);

        // 3. Seed Controlled Memories
        memoryRepository.save(Memory.builder()
                .user(savedStudent)
                .category("Academic Performance")
                .title("DBMS Midterm Score")
                .value("72/100 (Target: 85%+ in Final Exam)")
                .confidenceScore(0.98)
                .isConfirmed(true)
                .isSensitive(false)
                .sourceContext("Midterm Assessment Dialogue")
                .build());

        memoryRepository.save(Memory.builder()
                .user(savedStudent)
                .category("Important Dates")
                .title("Distributed Systems Project Submission")
                .value("Friday Final Submission at 23:59")
                .confidenceScore(0.99)
                .isConfirmed(true)
                .isSensitive(false)
                .sourceContext("Syllabus Extraction")
                .build());

        memoryRepository.save(Memory.builder()
                .user(savedStudent)
                .category("Learning Style")
                .title("Explanation Format Preference")
                .value("Prefers step-by-step Socratic hints over plain textbook answers")
                .confidenceScore(0.94)
                .isConfirmed(true)
                .isSensitive(false)
                .sourceContext("Student Persona Configuration")
                .build());

        // 4. Seed Tasks
        taskRepository.save(Task.builder()
                .user(savedStudent)
                .title("Submit Distributed Systems Project Draft")
                .courseCode("CS301")
                .status("TODO")
                .priority("HIGH")
                .dueDate(Instant.now().plus(2, ChronoUnit.DAYS))
                .build());

        taskRepository.save(Task.builder()
                .user(savedStudent)
                .title("Complete BCNF Normalization Practice Set")
                .courseCode("CS220")
                .status("TODO")
                .priority("HIGH")
                .dueDate(Instant.now().plus(1, ChronoUnit.DAYS))
                .build());

        taskRepository.save(Task.builder()
                .user(savedStudent)
                .title("Review Bellman-Ford Shortest Path Proof")
                .courseCode("CS240")
                .status("DONE")
                .priority("MEDIUM")
                .dueDate(Instant.now().minus(1, ChronoUnit.DAYS))
                .build());

        // 5. Seed Notes
        noteRepository.save(Note.builder()
                .user(savedStudent)
                .title("BFS vs DFS Queue Invariants")
                .courseCode("CS240")
                .content("BFS uses FIFO Queue ensuring level-by-level traversal. DFS uses LIFO Stack exploring deep branches first.")
                .isAiSuggested(true)
                .build());

        // 6. Seed Goals
        goalRepository.save(Goal.builder()
                .user(savedStudent)
                .title("Achieve 85%+ in DBMS Final Exam")
                .targetDate(Instant.now().plus(60, ChronoUnit.DAYS))
                .progressPercentage(68)
                .status("IN_PROGRESS")
                .build());

        // 7. Seed Calendar Events
        calendarEventRepository.save(CalendarEvent.builder()
                .user(savedStudent)
                .title("CS301 Lecture: Raft Consensus Algorithm")
                .eventType("LECTURE")
                .roomLocation("Hall B")
                .startTime(Instant.now().plus(3, ChronoUnit.HOURS))
                .endTime(Instant.now().plus(5, ChronoUnit.HOURS))
                .build());

        calendarEventRepository.save(CalendarEvent.builder()
                .user(savedStudent)
                .title("Synexora Scheduled Study: B-Tree Indexing")
                .eventType("AI_STUDY_BLOCK")
                .roomLocation("Library")
                .startTime(Instant.now().plus(6, ChronoUnit.HOURS))
                .endTime(Instant.now().plus(8, ChronoUnit.HOURS))
                .build());

        log.info("✓ Synexora demo student dataset initialized successfully (Email: alex.rivera@synexora.io / Password: Password123!)");
    }
}
