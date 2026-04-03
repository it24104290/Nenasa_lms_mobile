package com.nanasa.nanasa_lms.repository;

import com.nanasa.nanasa_lms.model.ExamResult;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ExamResultRepository extends MongoRepository<ExamResult, String> {
	long countByExamIdAndStudentId(String examId, String studentId);
	Optional<ExamResult> findTopByExamIdAndStudentIdOrderBySubmittedAtDesc(String examId, String studentId);
	List<ExamResult> findByExamIdAndStudentIdOrderBySubmittedAtDesc(String examId, String studentId);
	List<ExamResult> findByExamIdOrderBySubmittedAtDesc(String examId);
	List<ExamResult> findBySubmittedAtBetween(LocalDateTime startInclusive, LocalDateTime endExclusive);
}

