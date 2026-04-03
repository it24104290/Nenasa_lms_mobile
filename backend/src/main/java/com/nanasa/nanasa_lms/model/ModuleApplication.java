package com.nanasa.nanasa_lms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Document(collection = "moduleApplications")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleApplication {

    @Id
    private String id;

    private String studentName;

    private Integer age;

    private String grade;

    @DBRef
    private Module module;

    @DBRef
    private Teacher teacher;

    private String status; // e.g. PENDING, APPROVED

    private LocalDateTime createdAt;
}
