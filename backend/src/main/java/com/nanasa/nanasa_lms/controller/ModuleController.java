package com.nanasa.nanasa_lms.controller;

import com.nanasa.nanasa_lms.model.Module;
import com.nanasa.nanasa_lms.service.ModuleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
@CrossOrigin
public class ModuleController {

    private final ModuleService moduleService;

    public ModuleController(ModuleService moduleService) {
        this.moduleService = moduleService;
    }

    @PostMapping("/auto-assign")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public ResponseEntity<Module> autoAssignModule(@RequestParam String subjectId, @RequestParam String teacherId,
            @RequestParam String moduleName) {
        return ResponseEntity.ok(moduleService.autoAssignModule(subjectId, teacherId, moduleName));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public List<Module> getAllModules() {
        return moduleService.getAllModules();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public ResponseEntity<Module> getModuleById(@PathVariable String id) {
        return ResponseEntity.ok(moduleService.getModuleById(id));
    }
}
