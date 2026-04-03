package com.nanasa.nanasa_lms.service;

import com.nanasa.nanasa_lms.model.TuitionClass;
import com.nanasa.nanasa_lms.repository.TuitionClassRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClassRecommendationService {

    private final TuitionClassRepository classRepository;

    public ClassRecommendationService(TuitionClassRepository classRepository) {
        this.classRepository = classRepository;
    }

    public List<TuitionClass> recommendClasses(String subjectId, String teacherId) {
        return classRepository.findBySubjectIdAndTeacher_IdAndTypeIn(
                subjectId,
                teacherId,
                List.of("PAPER", "REVISION"));
    }
}
