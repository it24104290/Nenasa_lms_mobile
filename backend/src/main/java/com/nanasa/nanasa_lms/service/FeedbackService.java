package com.nanasa.nanasa_lms.service;

import com.nanasa.nanasa_lms.model.Feedback;
import com.nanasa.nanasa_lms.repository.FeedbackRepository;
import com.nanasa.nanasa_lms.dto.FeedbackCreateRequest;
import com.nanasa.nanasa_lms.model.StudentProfile;
import com.nanasa.nanasa_lms.model.Teacher;
import com.nanasa.nanasa_lms.model.Module;
import com.nanasa.nanasa_lms.repository.StudentProfileRepository;
import com.nanasa.nanasa_lms.repository.TeacherRepository;
import com.nanasa.nanasa_lms.repository.ModuleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherRepository teacherRepository;
    private final ModuleRepository moduleRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, StudentProfileRepository studentProfileRepository, TeacherRepository teacherRepository, ModuleRepository moduleRepository) {
        this.feedbackRepository = feedbackRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.teacherRepository = teacherRepository;
        this.moduleRepository = moduleRepository;
    }

    public List<Feedback> findAll() {
        return feedbackRepository.findAll();
    }

    public Feedback findById(String id) {
        return feedbackRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Feedback not found"));
    }

    public Feedback create(Feedback feedback) {
        feedback.setCreatedAt(LocalDateTime.now());
        return feedbackRepository.save(feedback);
    }

    public Feedback create(FeedbackCreateRequest request, String studentId) {
        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
        Module module = null;
        if (request.getModuleId() != null && !request.getModuleId().isEmpty()) {
            module = moduleRepository.findById(request.getModuleId())
                    .orElseThrow(() -> new IllegalArgumentException("Module not found"));
        }

        StudentProfile student = null;
        if (!Boolean.TRUE.equals(request.getIsAnonymous()) && studentId != null) {
            student = studentProfileRepository.findById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        }

        Feedback feedback = Feedback.builder()
                .student(student)
                .teacher(teacher)
                .module(module)
                .rating(request.getRating())
                .comment(request.getComment())
                .isAnonymous(request.getIsAnonymous())
                .createdAt(LocalDateTime.now())
                .build();

        return feedbackRepository.save(feedback);
    }

    public List<Feedback> findByTeacherId(String teacherId) {
        return feedbackRepository.findByTeacherId(teacherId);
    }

    public List<Feedback> findByModuleId(String moduleId) {
        return feedbackRepository.findByModuleId(moduleId);
    }

    public List<Feedback> findByStudentId(String studentId) {
        return feedbackRepository.findByStudentId(studentId);
    }
}