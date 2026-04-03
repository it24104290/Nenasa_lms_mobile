package com.nanasa.nanasa_lms.repository;

import com.nanasa.nanasa_lms.model.Question;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface QuestionRepository extends MongoRepository<Question, String> {
}

