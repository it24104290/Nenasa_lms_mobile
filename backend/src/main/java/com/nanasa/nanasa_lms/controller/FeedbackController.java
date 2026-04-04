package com.nanasa.nanasa_lms.controller;

import com.nanasa.nanasa_lms.model.Feedback;
import com.nanasa.nanasa_lms.service.FeedbackService;
import com.nanasa.nanasa_lms.dto.FeedbackCreateRequest;
import com.nanasa.nanasa_lms.security.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
@CrossOrigin
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public List<Feedback> getAll() {
        return feedbackService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public Feedback getById(@PathVariable String id) {
        return feedbackService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public Feedback create(@Valid @RequestBody FeedbackCreateRequest request, Authentication authentication) {
        Object principal = authentication.getPrincipal();
        String studentId = null;
        if (principal instanceof CustomUserDetails userDetails && userDetails.getUser().getStudentProfile() != null) {
            studentId = userDetails.getUser().getStudentProfile().getId();
        }
        return feedbackService.create(request, studentId);
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public List<Feedback> getByTeacherId(@PathVariable String teacherId) {
        return feedbackService.findByTeacherId(teacherId);
    }

    @GetMapping("/module/{moduleId}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public List<Feedback> getByModuleId(@PathVariable String moduleId) {
        return feedbackService.findByModuleId(moduleId);
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN','STUDENT')")
    public List<Feedback> getByStudentId(@PathVariable String studentId) {
        return feedbackService.findByStudentId(studentId);
    }
}