package com.nanasa.nanasa_lms.repository;

import com.nanasa.nanasa_lms.model.Student;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface StudentRepository extends MongoRepository<Student, String> {
    Optional<Student> findByAdmissionNumber(String admissionNumber);
    Optional<Student> findByFullName(String fullName);
    Optional<Student> findByEmail(String email);
}

