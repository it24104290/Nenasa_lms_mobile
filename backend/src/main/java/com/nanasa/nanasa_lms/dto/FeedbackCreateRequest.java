package com.nanasa.nanasa_lms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackCreateRequest {
    private String teacherId;
    private String moduleId;
    private Integer rating;
    private String comment;
    private Boolean isAnonymous;
}