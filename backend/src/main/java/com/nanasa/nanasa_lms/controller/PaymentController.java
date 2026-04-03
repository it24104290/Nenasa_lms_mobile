package com.nanasa.nanasa_lms.controller;

import com.nanasa.nanasa_lms.model.Payment;
import com.nanasa.nanasa_lms.service.PaymentService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STUDENT','PAYMENT_OFFICER')")
    public List<Payment> getAll() {
        return paymentService.findAll();
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('PAYMENT_OFFICER','ADMIN')")
    public List<Payment> getPending() {
        return paymentService.findPendingPayments();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STUDENT','PAYMENT_OFFICER')")
    public Payment getById(@PathVariable String id) {
        return paymentService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STUDENT')")
    public Payment create(@RequestParam String studentId,
                          @RequestParam String classId,
                          @RequestBody Payment payment) {
        return paymentService.create(payment, studentId, classId);
    }

    @PostMapping("/admission")
    @PreAuthorize("hasAnyRole('ADMIN','STUDENT')")
    public Payment createAdmission(@RequestParam String studentName,
                                   @RequestParam(required = false) String moduleId,
                                   @RequestBody Payment payment) {
        return paymentService.createAdmissionPayment(payment, studentName, moduleId);
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('PAYMENT_OFFICER','ADMIN')")
    public Payment approve(@PathVariable String id) {
        return paymentService.approvePayment(id);
    }

    @PostMapping("/{id}/decline")
    @PreAuthorize("hasAnyRole('PAYMENT_OFFICER','ADMIN')")
    public Payment decline(@PathVariable String id) {
        return paymentService.declinePayment(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable String id) {
        paymentService.delete(id);
    }
}

