package com.nanasa.nanasa_lms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StudentProfileRequest {
    @NotBlank
    private String fullName;
    
    private Integer age;
    
    @NotBlank
    private String grade;
    
    private String stream; // BIO, MATHS, ART, TEC, COMMERCE (Only when grade is A/L)
}
