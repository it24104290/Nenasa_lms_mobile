package com.nanasa.nanasa_lms.controller;

import com.nanasa.nanasa_lms.model.Student;
import com.nanasa.nanasa_lms.service.StudentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public List<Student> getAll() {
        return studentService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public Student getById(@PathVariable String id) {
        return studentService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Student create(@RequestBody Student student) {
        return studentService.create(student);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Student update(@PathVariable String id, @RequestBody Student student) {
        return studentService.update(id, student);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        studentService.delete(id);
    }

    @PostMapping("/{studentId}/enroll/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public Student enrollClass(@PathVariable String studentId, @PathVariable String classId) {
        return studentService.enrollStudentInClass(studentId, classId);
    }
}

