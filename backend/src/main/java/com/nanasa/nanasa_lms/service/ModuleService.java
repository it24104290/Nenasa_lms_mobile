package com.nanasa.nanasa_lms.service;

import com.nanasa.nanasa_lms.model.Module;
import com.nanasa.nanasa_lms.model.Teacher;
import com.nanasa.nanasa_lms.repository.ModuleRepository;
import com.nanasa.nanasa_lms.repository.TeacherRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ModuleService {

    private final ModuleRepository moduleRepository;
    private final TeacherRepository teacherRepository;

    public ModuleService(ModuleRepository moduleRepository, TeacherRepository teacherRepository) {
        this.moduleRepository = moduleRepository;
        this.teacherRepository = teacherRepository;
    }

    public Module autoAssignModule(String subjectId, String teacherId, String moduleName) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));

        Module module = Module.builder()
                .name(moduleName)
                .subjectId(subjectId)
                .teacher(teacher)
                .build();

        return moduleRepository.save(module);
    }

    public List<Module> getAllModules() {
        return moduleRepository.findAll();
    }

    public Module getModuleById(String moduleId) {
        return moduleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found"));
    }
}
