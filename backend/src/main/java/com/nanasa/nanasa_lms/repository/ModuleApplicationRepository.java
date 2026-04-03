package com.nanasa.nanasa_lms.repository;

import com.nanasa.nanasa_lms.model.ModuleApplication;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ModuleApplicationRepository extends MongoRepository<ModuleApplication, String> {
    List<ModuleApplication> findByStudentName(String studentName);
}
