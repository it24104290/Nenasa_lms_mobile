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

@Document(collection = "lessons")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {

    @Id
    
    private String id;

    private String title;

    private String description;

    // URLs or file paths for content
    private String pdfUrl;
    private String videoUrl;
    private String notesUrl;

    @DBRef
    private TuitionClass tuitionClass;

    private LocalDateTime createdAt;
}

