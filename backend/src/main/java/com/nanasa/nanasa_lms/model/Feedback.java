package com.nanasa.nanasa_lms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.nanasa.nanasa_lms.model.StudentProfile;

import java.time.LocalDateTime;

@Document(collection = "feedbacks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    private String id;

    @DBRef
    private StudentProfile student;

    private Boolean isAnonymous;

    @DBRef
    private Teacher teacher;

    @DBRef
    private Module module;

    private Integer rating; // 1-5

    private String comment;

    private LocalDateTime createdAt;
}