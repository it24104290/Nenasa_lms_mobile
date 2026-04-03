package com.nanasa.nanasa_lms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "questions")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    
    private String id;

    @DBRef
    private Exam exam;

    private String text;

    private String optionA;

    private String optionB;

    private String optionC;

    private String optionD;

    private String optionE;

    private String correctOption; // A/B/C/D/E

    private Integer marks;
}

