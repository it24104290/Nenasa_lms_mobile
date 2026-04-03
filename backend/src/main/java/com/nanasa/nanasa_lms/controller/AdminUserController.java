package com.nanasa.nanasa_lms.controller;

import com.nanasa.nanasa_lms.dto.RegisterRequest;
import com.nanasa.nanasa_lms.model.Role;
import com.nanasa.nanasa_lms.model.User;
import com.nanasa.nanasa_lms.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin
public class AdminUserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/seed-admin")
    public ResponseEntity<?> seedAdmin() {
        userRepository.findByUsername("admin").ifPresent(userRepository::delete);

        User admin = User.builder()
                .username("admin")
                .email("admin@nanasa.com")
                .password(passwordEncoder.encode("admin1234"))
                .role(Role.ADMIN)
                .enabled(true)
                .build();

        userRepository.save(admin);

        return ResponseEntity.ok("Admin seeded successfully");
    }

    @PostMapping("/payment-officer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createPaymentOfficer(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.PAYMENT_OFFICER)
                .enabled(true)
                .build();

        userRepository.save(user);

        return ResponseEntity.ok("Payment officer created successfully");
    }

    @GetMapping("/payment-officers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPaymentOfficers() {
        return ResponseEntity.ok(userRepository.findAllByRole(Role.PAYMENT_OFFICER));
    }

    @DeleteMapping("/payment-officer/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePaymentOfficer(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> {
                    if (user.getRole() != Role.PAYMENT_OFFICER) {
                        return ResponseEntity.badRequest().body("User is not a payment officer");
                    }
                    userRepository.deleteById(id);
                    return ResponseEntity.ok("Payment officer removed successfully");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}