package com.nanasa.nanasa_lms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter
@Setter
public class TuitionClassRequest {

    @NotBlank
    @Size(max = 120)
    private String name;

    @NotBlank
    @Size(max = 30)
    private String grade;

    @NotBlank
    @Size(max = 80)
    private String subjectId;

    @NotBlank
    @Pattern(regexp = "THEORY|REVISION|PAPER", message = "must be THEORY, REVISION, or PAPER")
    private String type;

    @NotNull
    private DayOfWeek dayOfWeek;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;
}
