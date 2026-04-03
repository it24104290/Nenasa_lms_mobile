package com.nanasa.nanasa_lms.dto;

import lombok.Data;

@Data
public class ModuleApplicationRequest {
    private String studentName;
    private Integer age;
    private String grade;
    private String moduleId;
    private String teacherId;
}
