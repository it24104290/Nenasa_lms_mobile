package com.nanasa.nanasa_lms.service;

import com.nanasa.nanasa_lms.model.Student;
import com.nanasa.nanasa_lms.model.TuitionClass;
import com.nanasa.nanasa_lms.repository.StudentRepository;
import com.nanasa.nanasa_lms.repository.TuitionClassRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final TuitionClassRepository classRepository;

    public StudentService(StudentRepository studentRepository, TuitionClassRepository classRepository) {
        this.studentRepository = studentRepository;
        this.classRepository = classRepository;
    }

    public List<Student> findAll() {
        return studentRepository.findAll();
    }

    public Student enrollStudentInClass(String studentId, String classId) {
        Student student = findById(studentId);
        TuitionClass tuitionClass = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        tuitionClass.getStudents().add(student);
        classRepository.save(tuitionClass);
        return student;
    }

    public Student findById(String id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
    }

    public Student create(Student student) {
        return studentRepository.save(student);
    }

    public Student update(String id, Student updated) {
        Student existing = findById(id);
        existing.setFullName(updated.getFullName());
        existing.setAdmissionNumber(updated.getAdmissionNumber());
        existing.setDateOfBirth(updated.getDateOfBirth());
        existing.setContactNumber(updated.getContactNumber());
        existing.setEmail(updated.getEmail());
        return studentRepository.save(existing);
    }

    public void delete(String id) {
        studentRepository.deleteById(id);
    }
}

