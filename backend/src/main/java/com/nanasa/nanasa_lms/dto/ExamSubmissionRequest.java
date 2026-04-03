package com.nanasa.nanasa_lms.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class ExamSubmissionRequest {
    private Long studentId;
    // key: questionId, value: selected option (A/B/C/D)
    private Map<Long, String> answers;
}
