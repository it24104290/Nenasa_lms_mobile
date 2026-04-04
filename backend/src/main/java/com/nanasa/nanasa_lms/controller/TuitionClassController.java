package com.nanasa.nanasa_lms.controller;

import com.nanasa.nanasa_lms.dto.TuitionClassRequest;
import com.nanasa.nanasa_lms.model.TuitionClass;
import com.nanasa.nanasa_lms.service.TuitionClassService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@CrossOrigin
public class TuitionClassController {

    private final TuitionClassService classService;

    public TuitionClassController(TuitionClassService classService) {
        this.classService = classService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public List<TuitionClass> getAll() {
        return classService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public TuitionClass getById(@PathVariable String id) {
        return classService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public TuitionClass create(@RequestParam(required = false) String teacherId,
                               @Valid @RequestBody TuitionClassRequest request) {
        return classService.create(request, teacherId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public TuitionClass update(@PathVariable String id,
                               @RequestParam(required = false) String teacherId,
                               @Valid @RequestBody TuitionClassRequest request) {
        return classService.update(id, request, teacherId);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        classService.delete(id);
    }
}

