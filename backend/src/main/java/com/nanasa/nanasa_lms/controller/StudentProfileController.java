package com.nanasa.nanasa_lms.controller;

import com.nanasa.nanasa_lms.dto.StudentProfileRequest;
import com.nanasa.nanasa_lms.model.StudentProfile;
import com.nanasa.nanasa_lms.service.StudentProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin
public class StudentProfileController {

    private final StudentProfileService profileService;

    public StudentProfileController(StudentProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping
    public ResponseEntity<StudentProfile> completeProfile(@Valid @RequestBody StudentProfileRequest request, Authentication authentication) {
        String username = authentication.getName();
        StudentProfile profile = profileService.createOrUpdateProfile(username, request);
        return ResponseEntity.ok(profile);
    }
}
