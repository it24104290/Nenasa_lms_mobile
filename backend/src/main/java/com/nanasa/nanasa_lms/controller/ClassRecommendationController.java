package com.nanasa.nanasa_lms.controller;

import com.nanasa.nanasa_lms.model.TuitionClass;
import com.nanasa.nanasa_lms.service.ClassRecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin
public class ClassRecommendationController {

    private final ClassRecommendationService recommendationService;

    public ClassRecommendationController(ClassRecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<TuitionClass>> getRecommendations(
            @RequestParam String subjectId,
            @RequestParam String teacherId) {
        return ResponseEntity.ok(recommendationService.recommendClasses(subjectId, teacherId));
    }
}
