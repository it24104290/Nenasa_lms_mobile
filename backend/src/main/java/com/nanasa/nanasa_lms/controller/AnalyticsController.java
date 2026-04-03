package com.nanasa.nanasa_lms.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin
public class AnalyticsController {

    @GetMapping("/exams/{examId}/average")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getExamAverage(@PathVariable String examId) {
        // Query logic: SELECT AVG(score) FROM results WHERE exam_id = examId
        double averageScore = 78.5; // Mock metric data
        return ResponseEntity.ok(Map.of(
                "examId", examId,
                "averageScore", averageScore,
                "passPercentage", 85.0));
    }
}
