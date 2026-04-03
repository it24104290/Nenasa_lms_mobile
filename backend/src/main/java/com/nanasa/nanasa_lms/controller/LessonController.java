package com.nanasa.nanasa_lms.controller;

import com.nanasa.nanasa_lms.model.Lesson;
import com.nanasa.nanasa_lms.service.LessonService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
@CrossOrigin
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public List<Lesson> getAll() {
        return lessonService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER','STUDENT')")
    public Lesson getById(@PathVariable String id) {
        return lessonService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public Lesson create(@RequestParam(required = false) String classId,
                         @RequestBody Lesson lesson) {
        return lessonService.create(lesson, classId);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public Lesson update(@PathVariable String id,
                         @RequestParam(required = false) String classId,
                         @RequestBody Lesson lesson) {
        return lessonService.update(id, lesson, classId);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public void delete(@PathVariable String id) {
        lessonService.delete(id);
    }

    @PostMapping("/{id}/upload/video")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<String> uploadVideo(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        String url = lessonService.uploadVideo(id, file);
        return ResponseEntity.ok(url);
    }

    @PostMapping("/{id}/upload/pdf")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<String> uploadPdf(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        String url = lessonService.uploadPdf(id, file);
        return ResponseEntity.ok(url);
    }

    @PostMapping("/{id}/upload/notes")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<String> uploadNotes(@PathVariable String id, @RequestParam("file") MultipartFile file) {
        String url = lessonService.uploadNotes(id, file);
        return ResponseEntity.ok(url);
    }
}

