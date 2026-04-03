package com.nanasa.nanasa_lms.service;

import com.nanasa.nanasa_lms.model.Exam;
import com.nanasa.nanasa_lms.model.Question;
import com.nanasa.nanasa_lms.model.ExamResult;
import com.nanasa.nanasa_lms.model.Role;
import com.nanasa.nanasa_lms.model.Student;
import com.nanasa.nanasa_lms.model.Teacher;
import com.nanasa.nanasa_lms.model.TuitionClass;
import com.nanasa.nanasa_lms.model.User;
import com.nanasa.nanasa_lms.model.Module;
import com.nanasa.nanasa_lms.repository.ExamRepository;
import com.nanasa.nanasa_lms.repository.ExamResultRepository;
import com.nanasa.nanasa_lms.repository.StudentRepository;
import com.nanasa.nanasa_lms.repository.TeacherRepository;
import com.nanasa.nanasa_lms.repository.TuitionClassRepository;
import com.nanasa.nanasa_lms.repository.UserRepository;
import com.nanasa.nanasa_lms.repository.ModuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final ExamResultRepository resultRepository;
    private final StudentRepository studentRepository;
    private final TuitionClassRepository classRepository;
    private final TeacherRepository teacherRepository;
    private final ModuleRepository moduleRepository;
    private final UserRepository userRepository;

    public ExamService(ExamRepository examRepository, ExamResultRepository resultRepository,
            StudentRepository studentRepository, TuitionClassRepository classRepository,
            TeacherRepository teacherRepository, ModuleRepository moduleRepository,
            UserRepository userRepository) {
        this.examRepository = examRepository;
        this.resultRepository = resultRepository;
        this.studentRepository = studentRepository;
        this.classRepository = classRepository;
        this.teacherRepository = teacherRepository;
        this.moduleRepository = moduleRepository;
        this.userRepository = userRepository;
    }

    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    public ExamResult submitAndMarkExam(String examId, String studentId, Map<String, String> studentAnswers) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        int score = 0;
        int size = exam.getQuestions().size();

        for (Question q : exam.getQuestions()) {
            String selected = studentAnswers.get(q.getId());
            if (selected != null && selected.equals(q.getCorrectOption())) {
                score++;
            }
        }

        ExamResult result = ExamResult.builder()
                .exam(exam)
                .student(student)
                .score(score)
                .totalMarks(size)
                .submittedAt(LocalDateTime.now())
                .build();

        return resultRepository.save(result);
    }

    public ExamResult submitMcqAsStudent(String examId, Map<String, String> studentAnswers, String currentUsername) {
        Exam exam = findExam(examId);
        Student student = resolveStudentByUsername(currentUsername);

        if (!"MCQ".equalsIgnoreCase(String.valueOf(exam.getExamType()))) {
            throw new IllegalArgumentException("Only MCQ exams support answer sheet submission");
        }
        ensureSubmittableForStudent(exam, student);

        int score = 0;
        int totalMarks = 0;
        if (exam.getQuestions() != null) {
            for (Question q : exam.getQuestions()) {
                int marks = q.getMarks() != null && q.getMarks() > 0 ? q.getMarks() : 1;
                totalMarks += marks;
                String selected = studentAnswers.get(q.getId());
                if (selected != null && selected.trim().equalsIgnoreCase(String.valueOf(q.getCorrectOption()))) {
                    score += marks;
                }
            }
        }

        int nextAttempt = (int) resultRepository.countByExamIdAndStudentId(examId, student.getId()) + 1;
        LocalDateTime submittedAt = LocalDateTime.now();
        ExamResult result = ExamResult.builder()
                .exam(exam)
                .student(student)
                .score(score)
                .totalMarks(totalMarks)
                .attemptNumber(nextAttempt)
                .submissionType("MCQ")
            .status("AUTO_GRADED")
            .gradedAt(submittedAt)
                .answers(studentAnswers == null ? new HashMap<>() : new HashMap<>(studentAnswers))
            .submittedAt(submittedAt)
                .build();

        return resultRepository.save(result);
    }

    public ExamResult uploadEssayAnswerAsStudent(String examId, MultipartFile file, String currentUsername) {
        try {
            Exam exam = findExam(examId);
            Student student = resolveStudentByUsername(currentUsername);

            if (!"ESSAY".equalsIgnoreCase(String.valueOf(exam.getExamType()))) {
                throw new IllegalArgumentException("Only essay exams allow file answer upload");
            }
            ensureSubmittableForStudent(exam, student);

            String filename = file.getOriginalFilename();
            if (filename == null || !filename.contains(".")) {
                throw new IllegalArgumentException("Invalid file");
            }
            String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
            if (!("pdf".equals(extension) || "doc".equals(extension) || "docx".equals(extension))) {
                throw new IllegalArgumentException("Essay answer must be PDF, DOC, or DOCX");
            }

            Path uploadDir = Paths.get("uploads", "essay-answers");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String uniqueFilename = examId + "_" + student.getId() + "_" + UUID.randomUUID() + "." + extension;
            Path filePath = uploadDir.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath);

            int nextAttempt = (int) resultRepository.countByExamIdAndStudentId(examId, student.getId()) + 1;
            ExamResult result = ExamResult.builder()
                    .exam(exam)
                    .student(student)
                    .attemptNumber(nextAttempt)
                    .submissionType("ESSAY")
                    .status("SUBMITTED")
                    .essayAnswerUrl("/uploads/essay-answers/" + uniqueFilename)
                    .submittedAt(LocalDateTime.now())
                    .build();
            return resultRepository.save(result);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload essay answer", e);
        }
    }

    public Map<String, Object> getStudentExamStatus(String examId, String currentUsername) {
        Exam exam = findExam(examId);
        Student student = resolveStudentByUsername(currentUsername);
        boolean enrolled = isStudentEnrolled(exam, student.getId());

        long attempts = resultRepository.countByExamIdAndStudentId(examId, student.getId());
        ExamResult latest = resultRepository
                .findTopByExamIdAndStudentIdOrderBySubmittedAtDesc(examId, student.getId())
                .orElse(null);

        Map<String, Object> status = new HashMap<>();
        status.put("examId", examId);
        status.put("attemptCount", attempts);
        status.put("examType", exam.getExamType());
        status.put("active", exam.getActive() == null || exam.getActive());
        status.put("ongoing", isOngoing(exam));
        status.put("enrolled", enrolled);
        status.put("canSubmit", enrolled && (exam.getActive() == null || exam.getActive()) && isOngoing(exam));

        if (latest != null) {
            status.put("latestStatus", latest.getStatus());
            status.put("latestScore", latest.getScore());
            status.put("latestTotalMarks", latest.getTotalMarks());
            status.put("latestSubmittedAt", latest.getSubmittedAt());
            status.put("latestSubmissionType", latest.getSubmissionType());
            status.put("latestEssayAnswerUrl", latest.getEssayAnswerUrl());
        }

        return status;
    }

    public Map<String, Object> enrollStudentForExam(String examId, String currentUsername) {
        Exam exam = findExam(examId);
        Student student = resolveStudentByUsername(currentUsername);

        if (exam.getEnrolledStudentIds() == null) {
            exam.setEnrolledStudentIds(new java.util.HashSet<>());
        }
        boolean added = exam.getEnrolledStudentIds().add(student.getId());
        if (added) {
            examRepository.save(exam);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("examId", examId);
        response.put("studentId", student.getId());
        response.put("enrolled", true);
        response.put("message", added ? "Enrolled successfully" : "Already enrolled");
        return response;
    }

    public List<Map<String, Object>> getEssaySubmissionsForExam(String examId, String currentUsername, Role role) {
        return getSubmissionsForExam(examId, currentUsername, role).stream()
                .filter(r -> r.get("essayAnswerUrl") != null)
                .toList();
    }

    public List<Map<String, Object>> getSubmissionsForExam(String examId, String currentUsername, Role role) {
        Exam exam = findExam(examId);

        if (role == Role.TEACHER) {
            Teacher teacher = resolveTeacherByUsername(currentUsername);
            ensureOwner(exam, teacher);
        }

        List<ExamResult> allResults = resultRepository.findByExamIdOrderBySubmittedAtDesc(examId);
        return allResults.stream()
                .map(this::toResultSheetRow)
                .toList();
    }

    public Map<String, Object> publishResultSheet(String examId,
                                                  String resultId,
                                                  Integer score,
                                                  Integer totalMarks,
                                                  String teacherRemark,
                                                  String currentUsername,
                                                  Role role) {
        Exam exam = findExam(examId);
        if (role == Role.TEACHER) {
            Teacher teacher = resolveTeacherByUsername(currentUsername);
            ensureOwner(exam, teacher);
        }

        ExamResult result = resultRepository.findById(resultId)
                .orElseThrow(() -> new IllegalArgumentException("Submission not found"));

        if (result.getExam() == null || result.getExam().getId() == null || !examId.equals(result.getExam().getId())) {
            throw new IllegalArgumentException("Submission does not belong to this exam");
        }

        int resolvedTotal = totalMarks != null
                ? totalMarks
                : (result.getTotalMarks() != null ? result.getTotalMarks() : ("ESSAY".equalsIgnoreCase(String.valueOf(exam.getExamType())) ? 100 : 0));
        if (resolvedTotal < 0) {
            throw new IllegalArgumentException("Total marks must be 0 or more");
        }

        if (score == null) {
            throw new IllegalArgumentException("Score is required");
        }
        if (score < 0 || score > resolvedTotal) {
            throw new IllegalArgumentException("Score must be between 0 and total marks");
        }

        result.setScore(score);
        result.setTotalMarks(resolvedTotal);
        result.setTeacherRemark(teacherRemark);
        result.setStatus("GRADED");
        result.setGradedAt(LocalDateTime.now());
        resultRepository.save(result);

        return toResultSheetRow(result);
    }

    public Map<String, Object> getDailySubjectLeaderboard(String currentUsername, Role role) {
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        LocalDateTime previousWindowStart = start.minusDays(7);

        List<ExamResult> results = resultRepository.findBySubmittedAtBetween(start, end);
        List<ExamResult> previousResults = resultRepository.findBySubmittedAtBetween(previousWindowStart, start);
        if (role == Role.TEACHER) {
            Teacher teacher = resolveTeacherByUsername(currentUsername);
            results = results.stream()
                    .filter(r -> r.getExam() != null
                            && r.getExam().getTeacher() != null
                            && teacher.getId().equals(r.getExam().getTeacher().getId()))
                    .toList();
            previousResults = previousResults.stream()
                .filter(r -> r.getExam() != null
                    && r.getExam().getTeacher() != null
                    && teacher.getId().equals(r.getExam().getTeacher().getId()))
                .toList();
        }

        Map<String, Map<String, StudentAggregate>> grouped = new HashMap<>();
        Map<String, Map<String, StudentAggregate>> groupedPrevious = new HashMap<>();

        for (ExamResult result : results) {
            if (result.getStudent() == null || result.getExam() == null) {
                continue;
            }
            if (result.getScore() == null || result.getTotalMarks() == null || result.getTotalMarks() <= 0) {
                continue;
            }

            String subject = resolveSubjectLabel(result.getExam());
            String studentId = result.getStudent().getId() != null ? result.getStudent().getId() : "UNKNOWN";

            grouped.putIfAbsent(subject, new HashMap<>());
            Map<String, StudentAggregate> studentMap = grouped.get(subject);
            StudentAggregate agg = studentMap.get(studentId);
            if (agg == null) {
                agg = new StudentAggregate();
                agg.studentId = studentId;
                agg.studentName = result.getStudent().getFullName() == null ? "-" : result.getStudent().getFullName();
                agg.studentEmail = result.getStudent().getEmail();
                studentMap.put(studentId, agg);
            }

            agg.totalScore += result.getScore();
            agg.totalMarks += result.getTotalMarks();
            agg.submissionCount += 1;
        }

        for (ExamResult result : previousResults) {
            if (result.getStudent() == null || result.getExam() == null) {
                continue;
            }
            if (result.getScore() == null || result.getTotalMarks() == null || result.getTotalMarks() <= 0) {
                continue;
            }

            String subject = resolveSubjectLabel(result.getExam());
            String studentId = result.getStudent().getId() != null ? result.getStudent().getId() : "UNKNOWN";

            groupedPrevious.putIfAbsent(subject, new HashMap<>());
            Map<String, StudentAggregate> studentMap = groupedPrevious.get(subject);
            StudentAggregate agg = studentMap.get(studentId);
            if (agg == null) {
                agg = new StudentAggregate();
                agg.studentId = studentId;
                agg.studentName = result.getStudent().getFullName() == null ? "-" : result.getStudent().getFullName();
                studentMap.put(studentId, agg);
            }

            agg.totalScore += result.getScore();
            agg.totalMarks += result.getTotalMarks();
            agg.submissionCount += 1;
        }

        List<Map<String, Object>> subjects = new ArrayList<>();
        List<String> subjectNames = new ArrayList<>(grouped.keySet());
        subjectNames.sort(String::compareToIgnoreCase);

        for (String subject : subjectNames) {
            List<StudentAggregate> ranked = new ArrayList<>(grouped.get(subject).values());
            ranked.sort((a, b) -> {
                double pa = a.percentage();
                double pb = b.percentage();
                int byPercentage = Double.compare(pb, pa);
                if (byPercentage != 0) return byPercentage;
                int byScore = Integer.compare(b.totalScore, a.totalScore);
                if (byScore != 0) return byScore;
                return a.studentName.compareToIgnoreCase(b.studentName);
            });

            List<Map<String, Object>> rankings = new ArrayList<>();
            int rank = 1;
            for (StudentAggregate agg : ranked) {
                StudentAggregate previousAgg = groupedPrevious.getOrDefault(subject, new HashMap<>()).get(agg.studentId);
                double previousPercentage = previousAgg == null ? -1 : previousAgg.percentage();
                double currentPercentage = agg.percentage();
                String trend;
                if (previousPercentage < 0) {
                    trend = "new";
                } else {
                    double delta = currentPercentage - previousPercentage;
                    if (delta > 0.5) {
                        trend = "up";
                    } else if (delta < -0.5) {
                        trend = "down";
                    } else {
                        trend = "same";
                    }
                }

                Map<String, Object> row = new HashMap<>();
                row.put("rank", rank++);
                row.put("studentId", agg.studentId);
                row.put("studentName", agg.studentName);
                row.put("studentEmail", agg.studentEmail);
                row.put("score", agg.totalScore);
                row.put("totalMarks", agg.totalMarks);
                row.put("averagePercentage", Math.round(currentPercentage * 100.0) / 100.0);
                row.put("submissionCount", agg.submissionCount);
                row.put("trend", trend);
                row.put("previousAveragePercentage", previousPercentage < 0 ? null : Math.round(previousPercentage * 100.0) / 100.0);
                rankings.add(row);
            }

            Map<String, Object> subjectEntry = new HashMap<>();
            subjectEntry.put("subject", subject);
            subjectEntry.put("rankings", rankings);
            subjects.add(subjectEntry);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("date", today.toString());
        response.put("lastUpdatedAt", LocalDateTime.now());
        response.put("subjects", subjects);
        response.put("totalSubjects", subjects.size());
        return response;
    }

    public List<Exam> findAll(String currentUsername, Role role) {
        if (role == Role.TEACHER) {
            Teacher teacher = resolveTeacherByUsername(currentUsername);
            return examRepository.findByTeacherId(teacher.getId());
        }
        return examRepository.findAll();
    }

    public Exam createByAdmin(Exam exam, String classId, String teacherId, String moduleId) {
        if (teacherId == null || teacherId.isBlank()) {
            throw new IllegalArgumentException("Teacher is required");
        }
        if (moduleId == null || moduleId.isBlank()) {
            throw new IllegalArgumentException("Module is required");
        }

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found"));

        if (module.getTeacher() == null || module.getTeacher().getId() == null
                || !module.getTeacher().getId().equals(teacher.getId())) {
            throw new IllegalArgumentException("Selected teacher and module do not match");
        }

        if (classId != null && !classId.isBlank()) {
            TuitionClass clazz = classRepository.findById(classId)
                    .orElseThrow(() -> new IllegalArgumentException("Class not found"));
            exam.setTuitionClass(clazz);
        }

        return finalizeCreation(exam, teacher, module);
    }

    public Exam createByTeacher(Exam exam, String classId, String moduleId, String currentUsername) {
        Teacher teacher = resolveTeacherByUsername(currentUsername);

        if (classId != null && !classId.isBlank()) {
            TuitionClass clazz = classRepository.findById(classId)
                    .orElseThrow(() -> new IllegalArgumentException("Class not found"));
            if (clazz.getTeacher() == null || clazz.getTeacher().getId() == null
                    || !clazz.getTeacher().getId().equals(teacher.getId())) {
                throw new IllegalArgumentException("You can only select your own class");
            }
            exam.setTuitionClass(clazz);
        }

        return finalizeCreation(exam, teacher, null);
    }

    public Exam updateByAdmin(String examId, Exam updated, String classId, String teacherId, String moduleId) {
        Exam existing = findExam(examId);
        if (isOngoing(existing)) {
            throw new IllegalArgumentException("Cannot edit ongoing exam");
        }

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found"));

        if (module.getTeacher() == null || module.getTeacher().getId() == null
                || !module.getTeacher().getId().equals(teacher.getId())) {
            throw new IllegalArgumentException("Selected teacher and module do not match");
        }

        validateExamTime(updated.getScheduledAt(), updated.getEndAt());

        existing.setTitle(updated.getTitle());
        existing.setExamCode(updated.getExamCode());
        existing.setDescription(updated.getDescription());
        existing.setScheduledAt(updated.getScheduledAt());
        existing.setEndAt(updated.getEndAt());
        existing.setExamType(updated.getExamType());
        existing.setTeacher(teacher);
        existing.setModule(module);

        if (classId != null && !classId.isBlank()) {
            TuitionClass clazz = classRepository.findById(classId)
                    .orElseThrow(() -> new IllegalArgumentException("Class not found"));
            existing.setTuitionClass(clazz);
        } else {
            existing.setTuitionClass(null);
        }

        normalizeExamType(existing);
        recalculateDuration(existing);
        return examRepository.save(existing);
    }

    public Exam updateByTeacher(String examId, Exam updated, String currentUsername) {
        Exam existing = findExam(examId);
        Teacher teacher = resolveTeacherByUsername(currentUsername);
        ensureOwner(existing, teacher);

        validateExamTime(updated.getScheduledAt(), updated.getEndAt());

        existing.setScheduledAt(updated.getScheduledAt());
        existing.setEndAt(updated.getEndAt());
        existing.setExamType(updated.getExamType());
        normalizeExamType(existing);
        recalculateDuration(existing);
        return examRepository.save(existing);
    }

    public void deleteByAdmin(String examId) {
        Exam exam = findExam(examId);
        if (isOngoing(exam)) {
            throw new IllegalArgumentException("Cannot delete ongoing exam");
        }
        examRepository.deleteById(examId);
    }

    public Exam setActive(String examId, boolean active, String currentUsername, Role role) {
        Exam exam = findExam(examId);
        if (role == Role.TEACHER) {
            Teacher teacher = resolveTeacherByUsername(currentUsername);
            ensureOwner(exam, teacher);
        }
        exam.setActive(active);
        return examRepository.save(exam);
    }

    public String uploadExamPaperByTeacher(String examId, MultipartFile file, String currentUsername) {
        try {
            Exam exam = findExam(examId);
            Teacher teacher = resolveTeacherByUsername(currentUsername);
            ensureOwner(exam, teacher);

            if (!"ESSAY".equalsIgnoreCase(String.valueOf(exam.getExamType()))) {
                throw new IllegalArgumentException("Only essay exams can have attachment uploads");
            }

            // Validate file extension
            String filename = file.getOriginalFilename();
            if (filename == null) throw new IllegalArgumentException("Invalid file");

            String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
            if (!"pdf".equals(extension)) {
                throw new IllegalArgumentException("Only PDF files allowed for exam papers");
            }

            // Create upload directory if it doesn't exist
            Path uploadDir = Paths.get("uploads", "exam-papers");
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // Generate unique filename
            String uniqueFilename = examId + "_" + UUID.randomUUID() + "." + extension;
            Path filePath = uploadDir.resolve(uniqueFilename);

            // Save file
            Files.copy(file.getInputStream(), filePath);

            // Return URL (assuming served from /uploads/)
            String url = "/uploads/exam-papers/" + uniqueFilename;
            exam.setExamPaperUrl(url);
            exam.setExamPaperEditCount((exam.getExamPaperEditCount() == null ? 0 : exam.getExamPaperEditCount()) + 1);
            examRepository.save(exam);
            return url;

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload exam paper", e);
        }
    }

    private Teacher resolveTeacherByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String email = user.getEmail();
        if (email != null && !email.isBlank()) {
            return teacherRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Teacher profile is not linked to this account"));
        }
        return teacherRepository.findByEmail(username)
                .orElseThrow(() -> new IllegalArgumentException("Teacher profile is not linked to this account"));
    }

    private Student resolveStudentByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() != Role.STUDENT) {
            throw new IllegalArgumentException("Only student accounts can enroll and submit exams");
        }

        String email = user.getEmail();
        if (email != null && !email.isBlank()) {
            Student byEmail = studentRepository.findByEmail(email).orElse(null);
            if (byEmail != null) {
                return byEmail;
            }
        }

        Student byUsernameEmail = studentRepository.findByEmail(username).orElse(null);
        if (byUsernameEmail != null) {
            return byUsernameEmail;
        }

        Student byFullName = studentRepository.findByFullName(username).orElse(null);
        if (byFullName != null) {
            return byFullName;
        }

        Student byAdmission = studentRepository.findByAdmissionNumber(username).orElse(null);
        if (byAdmission != null) {
            return byAdmission;
        }

        Student autoCreated = Student.builder()
                .fullName(username)
                .email(email)
                .admissionNumber("AUTO-" + user.getId().substring(0, Math.min(8, user.getId().length())).toUpperCase())
                .status("ACTIVE")
                .build();
        return studentRepository.save(autoCreated);
    }

    private void ensureOwner(Exam exam, Teacher teacher) {
        if (exam.getTeacher() == null || exam.getTeacher().getId() == null || !exam.getTeacher().getId().equals(teacher.getId())) {
            throw new IllegalArgumentException("You can only access your own exams");
        }
    }

    private Exam findExam(String examId) {
        return examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
    }

    private boolean isOngoing(Exam exam) {
        if (exam.getScheduledAt() == null || exam.getEndAt() == null) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        return (now.isEqual(exam.getScheduledAt()) || now.isAfter(exam.getScheduledAt())) && now.isBefore(exam.getEndAt());
    }

    private void ensureSubmittableForStudent(Exam exam, Student student) {
        if (!isStudentEnrolled(exam, student.getId())) {
            throw new IllegalArgumentException("Please enroll in this exam before submitting answers");
        }
        if (exam.getActive() != null && !exam.getActive()) {
            throw new IllegalArgumentException("Exam is currently inactive");
        }
        if (!isOngoing(exam)) {
            throw new IllegalArgumentException("Exam submissions are only allowed during the exam time");
        }
    }

    private boolean isStudentEnrolled(Exam exam, String studentId) {
        return exam.getEnrolledStudentIds() != null && exam.getEnrolledStudentIds().contains(studentId);
    }

    private void validateExamTime(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            throw new IllegalArgumentException("Exam start and end time are required");
        }
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("Exam end time must be after start time");
        }
    }

    private void normalizeExamType(Exam exam) {
        String type = String.valueOf(exam.getExamType() == null ? "" : exam.getExamType()).trim().toUpperCase();
        if (!"MCQ".equals(type) && !"ESSAY".equals(type)) {
            throw new IllegalArgumentException("Exam type must be MCQ or ESSAY");
        }
        exam.setExamType(type);
    }

    private void recalculateDuration(Exam exam) {
        if (exam.getScheduledAt() == null || exam.getEndAt() == null) {
            return;
        }
        long minutes = Duration.between(exam.getScheduledAt(), exam.getEndAt()).toMinutes();
        if (minutes <= 0) {
            throw new IllegalArgumentException("Exam duration must be greater than 0 minutes");
        }
        exam.setDurationMinutes((int) minutes);
    }

    private Exam finalizeCreation(Exam exam, Teacher teacher, Module module) {
        validateExamTime(exam.getScheduledAt(), exam.getEndAt());
        normalizeExamType(exam);
        prepareQuestionsForCreate(exam);
        if (exam.getExamCode() == null || exam.getExamCode().isBlank()) {
            exam.setExamCode("EX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        exam.setTeacher(teacher);
        if (module != null) {
            exam.setModule(module);
        } else {
            exam.setModule(null);
        }
        exam.setActive(exam.getActive() == null || exam.getActive());
        exam.setCreatedAt(LocalDateTime.now());
        exam.setExamPaperEditCount(exam.getExamPaperEditCount() == null ? 0 : exam.getExamPaperEditCount());
        recalculateDuration(exam);
        return examRepository.save(exam);
    }

    private void prepareQuestionsForCreate(Exam exam) {
        String type = String.valueOf(exam.getExamType()).toUpperCase();
        Set<Question> questions = exam.getQuestions();

        if (!"MCQ".equals(type)) {
            exam.setQuestions(new LinkedHashSet<>());
            return;
        }

        if (questions == null || questions.isEmpty()) {
            throw new IllegalArgumentException("MCQ exam requires at least one question");
        }

        Set<Question> normalized = new LinkedHashSet<>();
        for (Question q : questions) {
            if (q == null || q.getText() == null || q.getText().isBlank()) {
                throw new IllegalArgumentException("Each MCQ question must have text");
            }
            if (q.getOptionA() == null || q.getOptionA().isBlank()
                    || q.getOptionB() == null || q.getOptionB().isBlank()
                    || q.getOptionC() == null || q.getOptionC().isBlank()
                    || q.getOptionD() == null || q.getOptionD().isBlank()) {
                throw new IllegalArgumentException("Each MCQ question must include options A, B, C, and D");
            }

            String correct = String.valueOf(q.getCorrectOption() == null ? "" : q.getCorrectOption()).trim().toUpperCase();
            if (!("A".equals(correct) || "B".equals(correct) || "C".equals(correct) || "D".equals(correct) || "E".equals(correct))) {
                throw new IllegalArgumentException("Correct option must be A, B, C, D, or E");
            }
            if ("E".equals(correct) && (q.getOptionE() == null || q.getOptionE().isBlank())) {
                throw new IllegalArgumentException("Option E is required when correct option is E");
            }

            if (q.getId() == null || q.getId().isBlank()) {
                q.setId(UUID.randomUUID().toString());
            }
            q.setCorrectOption(correct);
            q.setMarks(q.getMarks() == null || q.getMarks() <= 0 ? 1 : q.getMarks());
            q.setExam(null);
            normalized.add(q);
        }
        exam.setQuestions(normalized);
    }

    private Map<String, Object> toResultSheetRow(ExamResult r) {
        Map<String, Object> row = new HashMap<>();
        row.put("resultId", r.getId());
        row.put("studentId", r.getStudent() != null ? r.getStudent().getId() : null);
        row.put("studentName", r.getStudent() != null ? r.getStudent().getFullName() : "-");
        row.put("studentEmail", r.getStudent() != null ? r.getStudent().getEmail() : null);
        row.put("attemptNumber", r.getAttemptNumber());
        row.put("submissionType", r.getSubmissionType());
        row.put("status", r.getStatus());
        row.put("submittedAt", r.getSubmittedAt());
        row.put("gradedAt", r.getGradedAt());
        row.put("score", r.getScore());
        row.put("totalMarks", r.getTotalMarks());
        row.put("teacherRemark", r.getTeacherRemark());
        row.put("essayAnswerUrl", r.getEssayAnswerUrl());
        row.put("answers", r.getAnswers() == null ? new HashMap<>() : r.getAnswers());
        return row;
    }

    private String resolveSubjectLabel(Exam exam) {
        if (exam.getModule() != null) {
            if (exam.getModule().getName() != null && !exam.getModule().getName().isBlank()) {
                return exam.getModule().getName().trim();
            }
            if (exam.getModule().getSubjectId() != null && !exam.getModule().getSubjectId().isBlank()) {
                return exam.getModule().getSubjectId().trim();
            }
        }
        return "General";
    }

    private static class StudentAggregate {
        private String studentId;
        private String studentName;
        private String studentEmail;
        private int totalScore;
        private int totalMarks;
        private int submissionCount;

        private double percentage() {
            if (totalMarks <= 0) {
                return 0;
            }
            return (totalScore * 100.0) / totalMarks;
        }
    }
}
