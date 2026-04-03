package com.nanasa.nanasa_lms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Document(collection = "leaderboards")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Leaderboard {

    @Id
    
    private String id;

    @DBRef
    private Student student;

    private String subjectId;

    private Double averageScore;

    private Integer rankPosition;

    private LocalDate date;
}
