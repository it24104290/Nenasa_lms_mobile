package com.nanasa.nanasa_lms.controller;

import com.nanasa.nanasa_lms.model.Teacher;
import com.nanasa.nanasa_lms.service.TeacherService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@CrossOrigin
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STUDENT','TEACHER')")
    public List<Teacher> getAll() {
        return teacherService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public Teacher getById(@PathVariable String id) {
        return teacherService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Teacher create(@RequestBody Teacher teacher) {
        return teacherService.create(teacher);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Teacher update(@PathVariable String id, @RequestBody Teacher teacher) {
        return teacherService.update(id, teacher);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        teacherService.delete(id);
    }
}

