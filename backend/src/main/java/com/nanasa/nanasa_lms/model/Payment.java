package com.nanasa.nanasa_lms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "payments")

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    
    private String id;

    @DBRef
    private Student student;

    @DBRef
    private TuitionClass tuitionClass;

    private BigDecimal amount;

    private String type; // ADMISSION, MONTHLY

    private String status; // PENDING, PAID, FAILED

    private String transactionId;

    private LocalDateTime paidAt;
}

