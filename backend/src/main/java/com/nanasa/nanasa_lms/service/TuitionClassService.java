package com.nanasa.nanasa_lms.service;

import com.nanasa.nanasa_lms.model.Teacher;
import com.nanasa.nanasa_lms.model.TuitionClass;
import com.nanasa.nanasa_lms.repository.TeacherRepository;
import com.nanasa.nanasa_lms.repository.TuitionClassRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TuitionClassService {

    private final TuitionClassRepository classRepository;
    private final TeacherRepository teacherRepository;

    public TuitionClassService(TuitionClassRepository classRepository, TeacherRepository teacherRepository) {
        this.classRepository = classRepository;
        this.teacherRepository = teacherRepository;
    }

    public List<TuitionClass> findAll() {
        return classRepository.findAll();
    }

    public TuitionClass findById(String id) {
        return classRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));
    }

    public TuitionClass create(TuitionClass clazz, String teacherId) {
        if (teacherId != null) {
            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
            clazz.setTeacher(teacher);
        }
        return classRepository.save(clazz);
    }

    public TuitionClass update(String id, TuitionClass updated, String teacherId) {
        TuitionClass existing = findById(id);
        existing.setName(updated.getName());
        existing.setGrade(updated.getGrade());
        existing.setDayOfWeek(updated.getDayOfWeek());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        if (teacherId != null) {
            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
            existing.setTeacher(teacher);
        }
        return classRepository.save(existing);
    }

    public void delete(String id) {
        classRepository.deleteById(id);
    }
}

