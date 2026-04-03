package com.nanasa.nanasa_lms.repository;

import com.nanasa.nanasa_lms.model.TuitionClass;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TuitionClassRepository extends MongoRepository<TuitionClass, String> {
    List<TuitionClass> findBySubjectIdAndTeacher_IdAndTypeIn(String subjectId, String teacherId, List<String> types);
}
