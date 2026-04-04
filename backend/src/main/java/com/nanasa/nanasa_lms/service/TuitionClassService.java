package com.nanasa.nanasa_lms.service;

import com.nanasa.nanasa_lms.dto.TuitionClassRequest;
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

    public TuitionClass create(TuitionClassRequest request, String teacherId) {
        validateSchedule(request.getStartTime(), request.getEndTime());

        TuitionClass clazz = TuitionClass.builder()
                .name(request.getName().trim())
                .grade(request.getGrade().trim())
                .subjectId(request.getSubjectId().trim())
                .type(request.getType().trim().toUpperCase())
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();

        if (teacherId != null) {
            Teacher teacher = teacherRepository.findById(teacherId)
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
            clazz.setTeacher(teacher);
        }
        return classRepository.save(clazz);
    }

    public TuitionClass update(String id, TuitionClassRequest updated, String teacherId) {
        validateSchedule(updated.getStartTime(), updated.getEndTime());

        TuitionClass existing = findById(id);
        existing.setName(updated.getName().trim());
        existing.setGrade(updated.getGrade().trim());
        existing.setSubjectId(updated.getSubjectId().trim());
        existing.setType(updated.getType().trim().toUpperCase());
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

    private void validateSchedule(java.time.LocalTime startTime, java.time.LocalTime endTime) {
        if (startTime == null || endTime == null) {
            throw new IllegalArgumentException("Start time and end time are required");
        }
        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
    }
}

