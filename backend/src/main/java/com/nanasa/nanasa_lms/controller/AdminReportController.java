package com.nanasa.nanasa_lms.controller;

import com.nanasa.nanasa_lms.repository.PaymentRepository;
import com.nanasa.nanasa_lms.repository.StudentRepository;
import com.nanasa.nanasa_lms.repository.TeacherRepository;
import com.nanasa.nanasa_lms.repository.TuitionClassRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
public class AdminReportController {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final TuitionClassRepository classRepository;
    private final PaymentRepository paymentRepository;

    public AdminReportController(StudentRepository studentRepository,
                                 TeacherRepository teacherRepository,
                                 TuitionClassRepository classRepository,
                                 PaymentRepository paymentRepository) {
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.classRepository = classRepository;
        this.paymentRepository = paymentRepository;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> summary() {
        Map<String, Object> map = new HashMap<>();
        map.put("studentCount", studentRepository.count());
        map.put("teacherCount", teacherRepository.count());
        map.put("classCount", classRepository.count());

        BigDecimal totalPaid = paymentRepository.findAll().stream()
                .filter(p -> "PAID".equalsIgnoreCase(p.getStatus()))
                .map(p -> p.getAmount() == null ? BigDecimal.ZERO : p.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        map.put("totalPaid", totalPaid);
        return map;
    }
}

