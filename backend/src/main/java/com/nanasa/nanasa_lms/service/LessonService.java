package com.nanasa.nanasa_lms.service;

import com.nanasa.nanasa_lms.model.Lesson;
import com.nanasa.nanasa_lms.model.TuitionClass;
import com.nanasa.nanasa_lms.repository.LessonRepository;
import com.nanasa.nanasa_lms.repository.TuitionClassRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;
    private final TuitionClassRepository classRepository;

    public LessonService(LessonRepository lessonRepository, TuitionClassRepository classRepository) {
        this.lessonRepository = lessonRepository;
        this.classRepository = classRepository;
    }

    public List<Lesson> findAll() {
        return lessonRepository.findAll();
    }

    public Lesson findById(String id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Lesson not found"));
    }

    public Lesson create(Lesson lesson, String classId) {
        if (classId != null) {
            TuitionClass clazz = classRepository.findById(classId)
                    .orElseThrow(() -> new IllegalArgumentException("Class not found"));
            lesson.setTuitionClass(clazz);
        }
        lesson.setCreatedAt(LocalDateTime.now());
        return lessonRepository.save(lesson);
    }

    public Lesson update(String id, Lesson updated, String classId) {
        Lesson existing = findById(id);
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setPdfUrl(updated.getPdfUrl());
        existing.setVideoUrl(updated.getVideoUrl());
        existing.setNotesUrl(updated.getNotesUrl());
        if (classId != null) {
            TuitionClass clazz = classRepository.findById(classId)
                    .orElseThrow(() -> new IllegalArgumentException("Class not found"));
            existing.setTuitionClass(clazz);
        }
        return lessonRepository.save(existing);
    }

    public void delete(String id) {
        lessonRepository.deleteById(id);
    }

    public String uploadVideo(String lessonId, MultipartFile file) {
        String url = uploadFile(lessonId, file, "videos", "mp4,avi,mov,mkv");
        Lesson lesson = findById(lessonId);
        lesson.setVideoUrl(url);
        lessonRepository.save(lesson);
        return url;
    }

    public String uploadPdf(String lessonId, MultipartFile file) {
        String url = uploadFile(lessonId, file, "pdfs", "pdf");
        Lesson lesson = findById(lessonId);
        lesson.setPdfUrl(url);
        lessonRepository.save(lesson);
        return url;
    }

    public String uploadNotes(String lessonId, MultipartFile file) {
        String url = uploadFile(lessonId, file, "notes", "txt,doc,docx,pdf");
        Lesson lesson = findById(lessonId);
        lesson.setNotesUrl(url);
        lessonRepository.save(lesson);
        return url;
    }

    private String uploadFile(String lessonId, MultipartFile file, String folder, String allowedExtensions) {
        try {
            // Validate file extension
            String filename = file.getOriginalFilename();
            if (filename == null) throw new IllegalArgumentException("Invalid file");

            String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
            if (!allowedExtensions.contains(extension)) {
                throw new IllegalArgumentException("File type not allowed");
            }

            // Create upload directory if it doesn't exist
            Path uploadDir = Paths.get("uploads", folder);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            // Generate unique filename
            String uniqueFilename = lessonId + "_" + UUID.randomUUID() + "." + extension;
            Path filePath = uploadDir.resolve(uniqueFilename);

            // Save file
            Files.copy(file.getInputStream(), filePath);

            // Return URL (assuming served from /uploads/)
            return "/uploads/" + folder + "/" + uniqueFilename;

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload file", e);
        }
    }
}

