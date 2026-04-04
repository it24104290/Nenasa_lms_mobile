package com.nanasa.nanasa_lms.service;

import com.nanasa.nanasa_lms.model.TuitionClass;
import com.nanasa.nanasa_lms.repository.TuitionClassRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ClassRecommendationService {

    private final TuitionClassRepository classRepository;

    public ClassRecommendationService(TuitionClassRepository classRepository) {
        this.classRepository = classRepository;
    }

    public Map<String, Object> recommendClasses(String subjectId, String teacherId) {
        String normalizedSubjectId = normalize(subjectId);

        List<TuitionClass> matches = new ArrayList<>();
        for (TuitionClass clazz : classRepository.findAll()) {
            if (clazz == null) {
                continue;
            }

            String clazzSubjectId = normalize(clazz.getSubjectId());
            String clazzType = normalize(clazz.getType());

            if (!normalizedSubjectId.equals(clazzSubjectId)) {
                continue;
            }
            if (!"paper".equals(clazzType) && !"revision".equals(clazzType)) {
                continue;
            }

            matches.add(clazz);
        }

        List<TuitionClass> paperClasses = matches.stream()
                .filter(clazz -> "PAPER".equalsIgnoreCase(clazz.getType()))
                .toList();

        List<TuitionClass> revisionClasses = matches.stream()
                .filter(clazz -> "REVISION".equalsIgnoreCase(clazz.getType()))
                .toList();

        List<TuitionClass> combined = matches.stream()
                .sorted((left, right) -> {
                    int byType = String.valueOf(left.getType()).compareToIgnoreCase(String.valueOf(right.getType()));
                    if (byType != 0) return byType;
                    String leftName = left.getName() == null ? "" : left.getName();
                    String rightName = right.getName() == null ? "" : right.getName();
                    return leftName.compareToIgnoreCase(rightName);
                })
                .toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("subjectId", subjectId);
        response.put("teacherId", teacherId);
        response.put("paperClasses", paperClasses);
        response.put("revisionClasses", revisionClasses);
        response.put("combinedClasses", combined);
        response.put("totalMatches", combined.size());
        return response;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }
}
