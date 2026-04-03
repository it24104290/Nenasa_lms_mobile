package com.nanasa.nanasa_lms.repository;

import com.nanasa.nanasa_lms.model.StudentProfile;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface StudentProfileRepository extends MongoRepository<StudentProfile, String> {
    Optional<StudentProfile> findByUserId(String userId);
}
