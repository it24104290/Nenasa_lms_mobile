package com.nanasa.nanasa_lms.service;

import com.nanasa.nanasa_lms.dto.StudentProfileRequest;
import com.nanasa.nanasa_lms.model.StudentProfile;
import com.nanasa.nanasa_lms.model.User;
import com.nanasa.nanasa_lms.repository.StudentProfileRepository;
import com.nanasa.nanasa_lms.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class StudentProfileService {

    private final StudentProfileRepository profileRepository;
    private final UserRepository userRepository;

    public StudentProfileService(StudentProfileRepository profileRepository, UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    public StudentProfile createOrUpdateProfile(String username, StudentProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        StudentProfile profile = profileRepository.findByUserId(user.getId())
                .orElse(new StudentProfile());

        profile.setUser(user);
        profile.setUserId(user.getId());
        profile.setFullName(request.getFullName());
        profile.setAge(request.getAge());
        profile.setGrade(request.getGrade());

        // Only allow stream if grade is 'A/L'
        if ("A/L".equalsIgnoreCase(request.getGrade())) {
            profile.setStream(request.getStream());
        } else {
            profile.setStream(null);
        }

        return profileRepository.save(profile);
    }
}
