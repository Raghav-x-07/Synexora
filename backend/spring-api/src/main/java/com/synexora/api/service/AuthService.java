package com.synexora.api.service;

import com.synexora.api.dto.AuthRequest;
import com.synexora.api.dto.AuthResponse;
import com.synexora.api.dto.RegisterRequest;
import com.synexora.api.dto.UserDto;
import com.synexora.api.model.Role;
import com.synexora.api.model.StudentProfile;
import com.synexora.api.model.User;
import com.synexora.api.repository.StudentProfileRepository;
import com.synexora.api.repository.UserRepository;
import com.synexora.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(Role.ROLE_STUDENT)
                .build();

        User savedUser = userRepository.save(user);

        StudentProfile profile = StudentProfile.builder()
                .user(savedUser)
                .major(request.getMajor() != null ? request.getMajor() : "Computer Science & Engineering")
                .academicYear(request.getAcademicYear() != null ? request.getAcademicYear() : "Year 3")
                .gpa(3.85)
                .masteryScore(84.0)
                .studyStreakDays(14)
                .learningStylePreference("Interactive Socratic & Code Traces")
                .build();

        StudentProfile savedProfile = profileRepository.save(profile);
        savedUser.setProfile(savedProfile);

        String token = jwtService.generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToUserDto(savedUser, savedProfile))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        StudentProfile profile = profileRepository.findByUser(user).orElse(null);
        String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(mapToUserDto(user, profile))
                .build();
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(User user) {
        StudentProfile profile = profileRepository.findByUser(user).orElse(null);
        return mapToUserDto(user, profile);
    }

    public UserDto mapToUserDto(User user, StudentProfile profile) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .major(profile != null ? profile.getMajor() : "Computer Science")
                .academicYear(profile != null ? profile.getAcademicYear() : "Year 3")
                .gpa(profile != null ? profile.getGpa() : 3.85)
                .masteryScore(profile != null ? profile.getMasteryScore() : 84.0)
                .studyStreakDays(profile != null ? profile.getStudyStreakDays() : 14)
                .build();
    }
}
