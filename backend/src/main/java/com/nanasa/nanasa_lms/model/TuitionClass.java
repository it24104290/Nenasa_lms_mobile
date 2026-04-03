package com.nanasa.nanasa_lms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "tuitionclasss")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TuitionClass {

    @Id
    
    private String id;

    private String name;

    private String grade;

    private String subjectId;

    private String type; // e.g., PAPER, REVISION, THEORY

    private DayOfWeek dayOfWeek;

    private LocalTime startTime;

    private LocalTime endTime;

    @DBRef
    private Teacher teacher;

    @Builder.Default
    @DBRef
    @JsonIgnore
    private Set<Student> students = new HashSet<>();
}
