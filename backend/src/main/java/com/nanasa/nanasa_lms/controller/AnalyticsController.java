package com.nanasa.nanasa_lms.controller;

import com.nanasa.nanasa_lms.model.Role;
import com.nanasa.nanasa_lms.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/teacher/performance")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN','ROLE_TEACHER','TEACHER')")
    public ResponseEntity<Map<String, Object>> getTeacherPerformance(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false, defaultValue = "40") double passMarkPercentage,
            Authentication authentication) {

        boolean isTeacher = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_TEACHER".equals(a.getAuthority()) || "TEACHER".equals(a.getAuthority()));
        Role role = isTeacher ? Role.TEACHER : Role.ADMIN;

        return ResponseEntity.ok(
                analyticsService.getTeacherPerformanceAnalytics(
                        authentication.getName(),
                        role,
                        teacherId,
                        passMarkPercentage));
    }
}
