package com.nanasa.nanasa_lms.controller;

import com.nanasa.nanasa_lms.dto.ModuleApplicationRequest;
import com.nanasa.nanasa_lms.model.ModuleApplication;
import com.nanasa.nanasa_lms.service.ModuleApplicationService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/module-applications")
@CrossOrigin
public class ModuleApplicationController {

    private final ModuleApplicationService applicationService;

    public ModuleApplicationController(ModuleApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN','TEACHER')")
    public ModuleApplication apply(@RequestBody ModuleApplicationRequest request) {
        return applicationService.applyModule(
                request.getStudentName(),
                request.getAge(),
                request.getGrade(),
                request.getModuleId(),
                request.getTeacherId()
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN','TEACHER')")
    public List<ModuleApplication> getAll() {
        return applicationService.getAllApplications();
    }

    @GetMapping("/student")
    @PreAuthorize("hasAnyRole('STUDENT','ADMIN','TEACHER')")
    public List<ModuleApplication> getByStudent(@RequestParam String studentName) {
        return applicationService.getApplicationsByStudentName(studentName);
    }
}
