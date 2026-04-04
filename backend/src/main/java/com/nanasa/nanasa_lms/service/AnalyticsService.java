package com.nanasa.nanasa_lms.service;

import com.nanasa.nanasa_lms.model.Exam;
import com.nanasa.nanasa_lms.model.ExamResult;
import com.nanasa.nanasa_lms.model.Role;
import com.nanasa.nanasa_lms.model.Teacher;
import com.nanasa.nanasa_lms.model.User;
import com.nanasa.nanasa_lms.repository.ExamRepository;
import com.nanasa.nanasa_lms.repository.ExamResultRepository;
import com.nanasa.nanasa_lms.repository.TeacherRepository;
import com.nanasa.nanasa_lms.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private static final String UNASSIGNED_CLASS_ID = "UNASSIGNED";
    private static final String UNASSIGNED_CLASS_NAME = "Unassigned Class";

    private final ExamRepository examRepository;
    private final ExamResultRepository examResultRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;

    public AnalyticsService(ExamRepository examRepository,
                            ExamResultRepository examResultRepository,
                            TeacherRepository teacherRepository,
                            UserRepository userRepository) {
        this.examRepository = examRepository;
        this.examResultRepository = examResultRepository;
        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> getTeacherPerformanceAnalytics(String currentUsername,
                                                              Role role,
                                                              String teacherId,
                                                              double passMarkPercentage) {
        double normalizedPassMark = Math.min(100.0, Math.max(0.0, passMarkPercentage));

        Teacher teacher = resolveTeacher(currentUsername, role, teacherId);
        List<Exam> teacherExams = examRepository.findByTeacherId(teacher.getId());
        Map<String, Exam> examById = teacherExams.stream()
                .filter(e -> e.getId() != null)
                .collect(Collectors.toMap(Exam::getId, e -> e));

        List<ExamResult> relevantResults = latestResultsForTeacherExams(examById);

        Map<String, ExamStats> examStatsByExamId = new HashMap<>();
        Map<String, ClassStats> classStatsByClassId = new HashMap<>();

        for (ExamResult result : relevantResults) {
            Exam exam = result.getExam();
            if (exam == null || exam.getId() == null) {
                continue;
            }
            Integer score = result.getScore();
            Integer totalMarks = result.getTotalMarks();
            if (score == null || totalMarks == null || totalMarks <= 0) {
                continue;
            }

            String classId = exam.getTuitionClass() != null && exam.getTuitionClass().getId() != null
                    ? exam.getTuitionClass().getId()
                    : UNASSIGNED_CLASS_ID;
            String className = exam.getTuitionClass() != null && exam.getTuitionClass().getName() != null
                    ? exam.getTuitionClass().getName()
                    : UNASSIGNED_CLASS_NAME;

            String examKey = exam.getId();
            ExamStats examStats = examStatsByExamId.computeIfAbsent(examKey, k -> new ExamStats(exam, classId, className));
            examStats.add(score, totalMarks, normalizedPassMark);

            ClassStats classStats = classStatsByClassId.computeIfAbsent(classId, k -> new ClassStats(classId, className));
            classStats.add(score, totalMarks, normalizedPassMark, exam.getId());
        }

        List<Map<String, Object>> examPerformance = examStatsByExamId.values().stream()
                .sorted(Comparator.comparing(ExamStats::getScheduledAtSafe))
                .map(ExamStats::toMap)
                .toList();

        List<Map<String, Object>> classComparison = classStatsByClassId.values().stream()
                .sorted(Comparator.comparing(ClassStats::getClassName, String.CASE_INSENSITIVE_ORDER))
                .map(ClassStats::toMap)
                .toList();

        Totals totals = calculateTotals(examStatsByExamId.values(), classStatsByClassId.values());

        Map<String, Object> summary = new HashMap<>();
        summary.put("overallClassAverageMarks", round2(totals.overallAverageMarks));
        summary.put("overallClassAveragePercentage", round2(totals.overallAveragePercentage));
        summary.put("passStudentPercentage", round2(totals.passStudentPercentage));
        summary.put("totalExams", teacherExams.size());
        summary.put("totalClasses", classStatsByClassId.size());
        summary.put("totalSubmissions", totals.totalSubmissions);
        summary.put("passMarkPercentage", normalizedPassMark);

        Map<String, Object> chartData = new HashMap<>();
        chartData.put("examAverages", examStatsByExamId.values().stream()
                .sorted(Comparator.comparing(ExamStats::getScheduledAtSafe))
                .map(ExamStats::toChartMap)
                .toList());
        chartData.put("classComparison", classStatsByClassId.values().stream()
                .sorted(Comparator.comparing(ClassStats::getClassName, String.CASE_INSENSITIVE_ORDER))
                .map(ClassStats::toChartMap)
                .toList());

        Map<String, Object> response = new HashMap<>();
        response.put("teacherId", teacher.getId());
        response.put("teacherName", teacher.getFullName());
        response.put("generatedAt", LocalDateTime.now());
        response.put("summary", summary);
        response.put("examPerformance", examPerformance);
        response.put("classComparison", classComparison);
        response.put("chartData", chartData);
        return response;
    }

    private Teacher resolveTeacher(String currentUsername, Role role, String teacherId) {
        if (role == Role.ADMIN) {
            if (teacherId == null || teacherId.isBlank()) {
                throw new IllegalArgumentException("teacherId is required for admin analytics view");
            }
            return teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
        }

        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String email = user.getEmail();
        if (email != null && !email.isBlank()) {
            return teacherRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Teacher profile is not linked to this account"));
        }

        return teacherRepository.findByEmail(currentUsername)
                .orElseThrow(() -> new IllegalArgumentException("Teacher profile is not linked to this account"));
    }

    private List<ExamResult> latestResultsForTeacherExams(Map<String, Exam> examById) {
        if (examById.isEmpty()) {
            return List.of();
        }

        Map<String, ExamResult> latestByExamStudent = new HashMap<>();
        for (ExamResult result : examResultRepository.findAll()) {
            if (result.getExam() == null || result.getExam().getId() == null) {
                continue;
            }
            if (!examById.containsKey(result.getExam().getId())) {
                continue;
            }
            String studentId = result.getStudent() != null && result.getStudent().getId() != null
                    ? result.getStudent().getId()
                    : "UNKNOWN";
            String key = result.getExam().getId() + "::" + studentId;
            ExamResult existing = latestByExamStudent.get(key);
            if (existing == null || compareSubmittedAt(result, existing) > 0) {
                latestByExamStudent.put(key, result);
            }
        }
        return new ArrayList<>(latestByExamStudent.values());
    }

    private int compareSubmittedAt(ExamResult left, ExamResult right) {
        LocalDateTime l = left.getSubmittedAt();
        LocalDateTime r = right.getSubmittedAt();
        if (l == null && r == null) return 0;
        if (l == null) return -1;
        if (r == null) return 1;
        return l.compareTo(r);
    }

    private Totals calculateTotals(Iterable<ExamStats> examStats, Iterable<ClassStats> classStats) {
        int totalSubmissions = 0;
        int totalPasses = 0;
        double totalScoreSum = 0;
        double totalMarksSum = 0;

        for (ExamStats stat : examStats) {
            totalSubmissions += stat.submissionCount;
            totalPasses += stat.passCount;
            totalScoreSum += stat.scoreSum;
            totalMarksSum += stat.totalMarksSum;
        }

        double avgMarks = totalSubmissions == 0 ? 0 : totalScoreSum / totalSubmissions;
        double avgPercentage = totalMarksSum <= 0 ? 0 : (totalScoreSum * 100.0) / totalMarksSum;
        double passPercentage = totalSubmissions == 0 ? 0 : (totalPasses * 100.0) / totalSubmissions;

        int classCount = 0;
        for (ClassStats ignored : classStats) {
            classCount++;
        }

        return new Totals(avgMarks, avgPercentage, passPercentage, totalSubmissions, classCount);
    }

    private static double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private static class Totals {
        private final double overallAverageMarks;
        private final double overallAveragePercentage;
        private final double passStudentPercentage;
        private final int totalSubmissions;
        private final int totalClasses;

        private Totals(double overallAverageMarks,
                       double overallAveragePercentage,
                       double passStudentPercentage,
                       int totalSubmissions,
                       int totalClasses) {
            this.overallAverageMarks = overallAverageMarks;
            this.overallAveragePercentage = overallAveragePercentage;
            this.passStudentPercentage = passStudentPercentage;
            this.totalSubmissions = totalSubmissions;
            this.totalClasses = totalClasses;
        }
    }

    private static class ExamStats {
        private final Exam exam;
        private final String classId;
        private final String className;
        private int submissionCount;
        private int passCount;
        private double scoreSum;
        private double totalMarksSum;

        private ExamStats(Exam exam, String classId, String className) {
            this.exam = exam;
            this.classId = classId;
            this.className = className;
        }

        private void add(int score, int totalMarks, double passMarkPercentage) {
            submissionCount++;
            scoreSum += score;
            totalMarksSum += totalMarks;
            double percentage = totalMarks <= 0 ? 0 : (score * 100.0) / totalMarks;
            if (percentage >= passMarkPercentage) {
                passCount++;
            }
        }

        private LocalDateTime getScheduledAtSafe() {
            return exam.getScheduledAt() == null ? LocalDateTime.MIN : exam.getScheduledAt();
        }

        private Map<String, Object> toMap() {
            Map<String, Object> row = new HashMap<>();
            row.put("examId", exam.getId());
            row.put("examTitle", exam.getTitle());
            row.put("examCode", exam.getExamCode());
            row.put("scheduledAt", exam.getScheduledAt());
            row.put("classId", classId);
            row.put("className", className);
            row.put("submissionCount", submissionCount);
            row.put("averageMarks", round2(submissionCount == 0 ? 0 : scoreSum / submissionCount));
            row.put("averagePercentage", round2(totalMarksSum <= 0 ? 0 : (scoreSum * 100.0) / totalMarksSum));
            row.put("passStudentPercentage", round2(submissionCount == 0 ? 0 : (passCount * 100.0) / submissionCount));
            return row;
        }

        private Map<String, Object> toChartMap() {
            Map<String, Object> row = new HashMap<>();
            String title = Objects.toString(exam.getTitle(), "Untitled Exam");
            row.put("label", title.length() > 24 ? title.substring(0, 24) + "..." : title);
            row.put("fullLabel", title);
            row.put("className", className);
            row.put("averagePercentage", round2(totalMarksSum <= 0 ? 0 : (scoreSum * 100.0) / totalMarksSum));
            row.put("passStudentPercentage", round2(submissionCount == 0 ? 0 : (passCount * 100.0) / submissionCount));
            row.put("submissionCount", submissionCount);
            return row;
        }
    }

    private static class ClassStats {
        private final String classId;
        private final String className;
        private int submissionCount;
        private int passCount;
        private double scoreSum;
        private double totalMarksSum;
        private final Map<String, Boolean> examIds = new HashMap<>();

        private ClassStats(String classId, String className) {
            this.classId = classId;
            this.className = className;
        }

        private void add(int score, int totalMarks, double passMarkPercentage, String examId) {
            submissionCount++;
            scoreSum += score;
            totalMarksSum += totalMarks;
            double percentage = totalMarks <= 0 ? 0 : (score * 100.0) / totalMarks;
            if (percentage >= passMarkPercentage) {
                passCount++;
            }
            if (examId != null) {
                examIds.put(examId, true);
            }
        }

        private String getClassName() {
            return className;
        }

        private Map<String, Object> toMap() {
            Map<String, Object> row = new HashMap<>();
            row.put("classId", classId);
            row.put("className", className);
            row.put("examCount", examIds.size());
            row.put("submissionCount", submissionCount);
            row.put("averageMarks", round2(submissionCount == 0 ? 0 : scoreSum / submissionCount));
            row.put("averagePercentage", round2(totalMarksSum <= 0 ? 0 : (scoreSum * 100.0) / totalMarksSum));
            row.put("passStudentPercentage", round2(submissionCount == 0 ? 0 : (passCount * 100.0) / submissionCount));
            return row;
        }

        private Map<String, Object> toChartMap() {
            Map<String, Object> row = new HashMap<>();
            row.put("className", className);
            row.put("averagePercentage", round2(totalMarksSum <= 0 ? 0 : (scoreSum * 100.0) / totalMarksSum));
            row.put("passStudentPercentage", round2(submissionCount == 0 ? 0 : (passCount * 100.0) / submissionCount));
            row.put("submissionCount", submissionCount);
            return row;
        }
    }
}
