package com.nanasa.nanasa_lms.service;

import com.nanasa.nanasa_lms.model.Teacher;
import com.nanasa.nanasa_lms.repository.TeacherRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;

    public TeacherService(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    public List<Teacher> findAll() {
        return teacherRepository.findAll();
    }

    public Teacher findById(String id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
    }

    public Teacher create(Teacher teacher) {
        return teacherRepository.save(teacher);
    }

    public Teacher update(String id, Teacher updated) {
        Teacher existing = findById(id);
        existing.setFullName(updated.getFullName());
        existing.setEmail(updated.getEmail());
        existing.setSubject(updated.getSubject());
        existing.setContactNumber(updated.getContactNumber());
        return teacherRepository.save(existing);
    }

    public void delete(String id) {
        teacherRepository.deleteById(id);
    }
}

