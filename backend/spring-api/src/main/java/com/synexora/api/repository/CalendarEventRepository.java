package com.synexora.api.repository;

import com.synexora.api.model.CalendarEvent;
import com.synexora.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, UUID> {
    List<CalendarEvent> findByUserOrderByStartTimeAsc(User user);
    List<CalendarEvent> findByUserIdOrderByStartTimeAsc(UUID userId);
    List<CalendarEvent> findByUserIdAndStartTimeBetween(UUID userId, Instant start, Instant end);
}
