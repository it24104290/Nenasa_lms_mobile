package com.nanasa.nanasa_lms.controller;

import com.nanasa.nanasa_lms.model.Exam;
import com.nanasa.nanasa_lms.model.ExamResult;
import com.nanasa.nanasa_lms.model.Role;
import com.nanasa.nanasa_lms.service.ExamService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @PostMapping("/{examId}/submit")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ExamResult> submitExam(
            @PathVariable String examId,
            @RequestBody Map<String, String> answers,
            Authentication authentication) {

        return ResponseEntity.ok(examService.submitMcqAsStudent(examId, answers, authentication.getName()));
    }

    @PostMapping("/{examId}/submit/mcq")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ExamResult> submitMcqExam(
            @PathVariable String examId,
            @RequestBody Map<String, String> answers,
            Authentication authentication) {

        return ResponseEntity.ok(examService.submitMcqAsStudent(examId, answers, authentication.getName()));
    }

    @PostMapping("/{examId}/submit/essay")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ExamResult> submitEssayExam(
            @PathVariable String examId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        return ResponseEntity.ok(examService.uploadEssayAnswerAsStudent(examId, file, authentication.getName()));
    }

    @GetMapping("/{examId}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getStudentExamStatus(
            @PathVariable String examId,
            Authentication authentication) {

        return ResponseEntity.ok(examService.getStudentExamStatus(examId, authentication.getName()));
    }

    @PostMapping("/{examId}/enroll")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> enrollStudentForExam(
            @PathVariable String examId,
            Authentication authentication) {
        return ResponseEntity.ok(examService.enrollStudentForExam(examId, authentication.getName()));
    }

    @GetMapping("/leaderboard/daily-subject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getDailySubjectLeaderboard(Authentication authentication) {
        boolean isTeacher = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_TEACHER".equals(a.getAuthority()) || "TEACHER".equals(a.getAuthority()));
        boolean isStudent = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_STUDENT".equals(a.getAuthority()) || "STUDENT".equals(a.getAuthority()));

        Role role = Role.ADMIN;
        if (isTeacher) {
            role = Role.TEACHER;
        } else if (isStudent) {
            role = Role.STUDENT;
        }
        return ResponseEntity.ok(examService.getDailySubjectLeaderboard(authentication.getName(), role));
    }

    @GetMapping("/{examId}/submissions/essay")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN','ROLE_TEACHER','TEACHER')")
    public ResponseEntity<List<Map<String, Object>>> getEssaySubmissions(
            @PathVariable String examId,
            Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ADMIN".equals(a.getAuthority()));
        Role role = isAdmin ? Role.ADMIN : Role.TEACHER;
        return ResponseEntity.ok(examService.getEssaySubmissionsForExam(examId, authentication.getName(), role));
    }

    @GetMapping("/{examId}/submissions")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN','ROLE_TEACHER','TEACHER')")
    public ResponseEntity<List<Map<String, Object>>> getSubmissions(
            @PathVariable String examId,
            Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ADMIN".equals(a.getAuthority()));
        Role role = isAdmin ? Role.ADMIN : Role.TEACHER;
        return ResponseEntity.ok(examService.getSubmissionsForExam(examId, authentication.getName(), role));
    }

    @PatchMapping("/{examId}/submissions/{resultId}/result")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN','ROLE_TEACHER','TEACHER')")
    public ResponseEntity<Map<String, Object>> publishResultSheet(
            @PathVariable String examId,
            @PathVariable String resultId,
            @RequestBody Map<String, Object> payload,
            Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ADMIN".equals(a.getAuthority()));
        Role role = isAdmin ? Role.ADMIN : Role.TEACHER;

        Integer score = payload.get("score") == null ? null : Integer.parseInt(String.valueOf(payload.get("score")));
        Integer totalMarks = payload.get("totalMarks") == null ? null : Integer.parseInt(String.valueOf(payload.get("totalMarks")));
        String teacherRemark = payload.get("teacherRemark") == null ? null : String.valueOf(payload.get("teacherRemark"));

        return ResponseEntity.ok(examService.publishResultSheet(examId, resultId, score, totalMarks, teacherRemark, authentication.getName(), role));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN','ROLE_TEACHER','TEACHER','ROLE_STUDENT','STUDENT')")
    public List<Exam> getAllExams(Authentication authentication) {
        String username = authentication.getName();
        boolean isTeacher = authentication.getAuthorities().stream()
            .anyMatch(a -> "ROLE_TEACHER".equals(a.getAuthority()) || "TEACHER".equals(a.getAuthority()));
        Role role = isTeacher ? Role.TEACHER : Role.ADMIN;
        boolean isStudent = authentication.getAuthorities().stream()
            .anyMatch(a -> "ROLE_STUDENT".equals(a.getAuthority()) || "STUDENT".equals(a.getAuthority()));
        if (isStudent) {
            role = Role.STUDENT;
        }
        boolean isAdmin = authentication.getAuthorities().stream()
            .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()) || "ADMIN".equals(a.getAuthority()));
        if (isAdmin) {
            role = Role.ADMIN;
        }
        return examService.findAll(username, role);
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN','ROLE_TEACHER','TEACHER')")
    public Exam createExam(@RequestParam(required = false) String classId,
                           @RequestParam(required = false) String teacherId,
                           @RequestParam(required = false) String moduleId,
                           @RequestBody Exam exam,
                           Authentication authentication) {
        boolean isTeacher = authentication.getAuthorities().stream()
            .anyMatch(a -> "ROLE_TEACHER".equals(a.getAuthority()) || "TEACHER".equals(a.getAuthority()));
        if (isTeacher) {
            return examService.createByTeacher(exam, classId, moduleId, authentication.getName());
        }
        return examService.createByAdmin(exam, classId, teacherId, moduleId);
    }

    @PostMapping("/teacher")
    @PreAuthorize("hasAnyAuthority('ROLE_TEACHER','TEACHER')")
    public Exam createExamByTeacher(@RequestParam(required = false) String classId,
                                    @RequestParam(required = false) String moduleId,
                                    @RequestBody Exam exam,
                                    Authentication authentication) {
        return examService.createByTeacher(exam, classId, moduleId, authentication.getName());
    }

    @PutMapping("/{id}/admin")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN')")
    public Exam updateExamByAdmin(@PathVariable String id,
                                  @RequestParam(required = false) String classId,
                                  @RequestParam String teacherId,
                                  @RequestParam String moduleId,
                                  @RequestBody Exam exam) {
        return examService.updateByAdmin(id, exam, classId, teacherId, moduleId);
    }

    @PutMapping("/{id}/teacher")
    @PreAuthorize("hasAnyAuthority('ROLE_TEACHER','TEACHER')")
    public Exam updateExamByTeacher(@PathVariable String id,
                                    @RequestBody Exam exam,
                                    Authentication authentication) {
        return examService.updateByTeacher(id, exam, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN')")
    public ResponseEntity<Void> deleteExam(@PathVariable String id) {
        examService.deleteByAdmin(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/active")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN','ADMIN','ROLE_TEACHER','TEACHER')")
    public Exam toggleExamActive(@PathVariable String id,
                                 @RequestParam boolean active,
                                 Authentication authentication) {
        boolean isTeacher = authentication.getAuthorities().stream()
            .anyMatch(a -> "ROLE_TEACHER".equals(a.getAuthority()) || "TEACHER".equals(a.getAuthority()));
        Role role = isTeacher ? Role.TEACHER : Role.ADMIN;
        return examService.setActive(id, active, authentication.getName(), role);
    }

    @PostMapping("/{id}/upload/paper")
    @PreAuthorize("hasAnyAuthority('ROLE_TEACHER','TEACHER')")
    public ResponseEntity<String> uploadExamPaper(@PathVariable String id,
                                                  @RequestParam("file") MultipartFile file,
                                                  Authentication authentication) {
        String url = examService.uploadExamPaperByTeacher(id, file, authentication.getName());
        return ResponseEntity.ok(url);
    }
}
