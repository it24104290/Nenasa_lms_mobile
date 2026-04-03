package com.nanasa.nanasa_lms.service;

import com.nanasa.nanasa_lms.model.Module;
import com.nanasa.nanasa_lms.model.ModuleApplication;
import com.nanasa.nanasa_lms.model.Teacher;
import com.nanasa.nanasa_lms.repository.ModuleApplicationRepository;
import com.nanasa.nanasa_lms.repository.ModuleRepository;
import com.nanasa.nanasa_lms.repository.TeacherRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ModuleApplicationService {

    private final ModuleApplicationRepository applicationRepository;
    private final ModuleRepository moduleRepository;
    private final TeacherRepository teacherRepository;

    public ModuleApplicationService(ModuleApplicationRepository applicationRepository,
                                    ModuleRepository moduleRepository,
                                    TeacherRepository teacherRepository) {
        this.applicationRepository = applicationRepository;
        this.moduleRepository = moduleRepository;
        this.teacherRepository = teacherRepository;
    }

    public ModuleApplication applyModule(String studentName, Integer age, String grade, String moduleId, String teacherId) {
        Module module = null;
        if (moduleId != null && !moduleId.isBlank()) {
            module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found"));
        }
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));

        ModuleApplication application = ModuleApplication.builder()
                .studentName(studentName)
                .age(age)
                .grade(grade)
                .module(module)
                .teacher(teacher)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();

        return applicationRepository.save(application);
    }

    public List<ModuleApplication> getAllApplications() {
        return applicationRepository.findAll();
    }

    public List<ModuleApplication> getApplicationsByStudentName(String studentName) {
        return applicationRepository.findByStudentName(studentName);
    }
}
