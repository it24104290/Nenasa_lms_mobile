package com.nanasa.nanasa_lms.repository;

import com.nanasa.nanasa_lms.model.Teacher;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface TeacherRepository extends MongoRepository<Teacher, String> {
	Optional<Teacher> findByEmail(String email);
}

