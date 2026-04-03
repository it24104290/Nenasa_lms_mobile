package com.nanasa.nanasa_lms.repository;

import com.nanasa.nanasa_lms.model.Module;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ModuleRepository extends MongoRepository<Module, String> {
	List<Module> findByTeacherId(String teacherId);
}
