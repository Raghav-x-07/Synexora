package com.synexora.api.dto;

import lombok.*;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private UUID id;
    private String email;
    private String fullName;
    private String role;
    private String major;
    private String academicYear;
    private Double gpa;
    private Double masteryScore;
    private Integer studyStreakDays;
}
