package com.nanasa.nanasa_lms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "exams")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam {

    @Id
    
    private String id;

    private String title;

    private String examCode;

    private String description;

    private LocalDateTime scheduledAt;

    private LocalDateTime endAt;

    private String examType;

    private Boolean active;

    private Integer examPaperEditCount;

    private LocalDateTime createdAt;

    private Integer durationMinutes;

    private String examPaperUrl;

    @DBRef
    private TuitionClass tuitionClass;

    @DBRef
    private Teacher teacher;

    @DBRef
    private Module module;

    @Builder.Default
    private Set<Question> questions = new HashSet<>();

    @Builder.Default
    private Set<String> enrolledStudentIds = new HashSet<>();
}

