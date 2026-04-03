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
import java.util.HashMap;
import java.util.Map;

@Document(collection = "examresults")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamResult {

    @Id
    
    private String id;

    @DBRef
    private Exam exam;

    @DBRef
    private Student student;

    private Integer score;

    private Integer totalMarks;

    private Integer attemptNumber;

    private String submissionType;

    private String status;

    private String essayAnswerUrl;

    private String teacherRemark;

    private LocalDateTime gradedAt;

    @Builder.Default
    private Map<String, String> answers = new HashMap<>();

    private LocalDateTime submittedAt;
}

