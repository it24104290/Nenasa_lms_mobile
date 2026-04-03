package com.nanasa.nanasa_lms.repository;

import com.nanasa.nanasa_lms.model.Feedback;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FeedbackRepository extends MongoRepository<Feedback, String> {
    List<Feedback> findByTeacherId(String teacherId);
    List<Feedback> findByModuleId(String moduleId);
    List<Feedback> findByStudentId(String studentId);
}