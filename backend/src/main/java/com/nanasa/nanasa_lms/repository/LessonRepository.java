package com.nanasa.nanasa_lms.repository;

import com.nanasa.nanasa_lms.model.Lesson;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface LessonRepository extends MongoRepository<Lesson, String> {
}

