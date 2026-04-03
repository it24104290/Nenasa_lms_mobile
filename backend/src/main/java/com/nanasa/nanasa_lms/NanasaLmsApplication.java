package com.nanasa.nanasa_lms;

import com.nanasa.nanasa_lms.model.Role;
import com.nanasa.nanasa_lms.model.User;
import com.nanasa.nanasa_lms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class NanasaLmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(NanasaLmsApplication.class, args);
    }

    @Bean
    public CommandLineRunner dataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            System.out.println("DataSeeder running...");
            try {
                if (userRepository.findByUsername("admin").isEmpty()) {
                    User admin = User.builder()
                            .username("admin")
                            .email("admin@nanasa.com")
                            .password(passwordEncoder.encode("admin1234"))
                            .role(Role.ADMIN)
                            .enabled(true)
                            .build();
                    userRepository.save(admin);
                    System.out.println("Default admin user created: username=admin, password=admin1234");
                } else {
                    System.out.println("Admin user already exists");
                }
            } catch (Exception e) {
                System.out.println("Error in DataSeeder: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }
}

