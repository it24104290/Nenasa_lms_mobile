package com.nanasa.nanasa_lms.repository;

import com.nanasa.nanasa_lms.model.Role;
import com.nanasa.nanasa_lms.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.List;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    java.util.List<User> findAllByRole(Role role);
}

