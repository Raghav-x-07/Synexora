package com.synexora.api.controller;

import com.synexora.api.dto.HealthResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Arrays;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<HealthResponse> checkHealth() {
        HealthResponse response = new HealthResponse(
                "UP",
                "Synexora Spring Boot Core API",
                "1.0.0",
                Arrays.asList("Authentication", "Tasks", "Notes", "Controlled Memory", "Calendar", "Assessments"),
                Instant.now()
        );
        return ResponseEntity.ok(response);
    }
}
