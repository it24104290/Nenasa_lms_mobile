package com.nanasa.nanasa_lms.repository;

import com.nanasa.nanasa_lms.model.Exam;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ExamRepository extends MongoRepository<Exam, String> {
	List<Exam> findByTeacherId(String teacherId);
}

