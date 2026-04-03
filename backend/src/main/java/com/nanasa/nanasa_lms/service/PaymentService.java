package com.nanasa.nanasa_lms.service;

import com.nanasa.nanasa_lms.model.Payment;
import com.nanasa.nanasa_lms.model.Student;
import com.nanasa.nanasa_lms.model.TuitionClass;
import com.nanasa.nanasa_lms.repository.PaymentRepository;
import com.nanasa.nanasa_lms.repository.StudentRepository;
import com.nanasa.nanasa_lms.repository.TuitionClassRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final TuitionClassRepository classRepository;
    private final EmailService emailService;
    private final SmsService smsService;
    private final StudentService studentService;

    public PaymentService(PaymentRepository paymentRepository,
            StudentRepository studentRepository,
            TuitionClassRepository classRepository,
            EmailService emailService,
            SmsService smsService,
            StudentService studentService) {
        this.paymentRepository = paymentRepository;
        this.studentRepository = studentRepository;
        this.classRepository = classRepository;
        this.emailService = emailService;
        this.smsService = smsService;
        this.studentService = studentService;
    }

    public List<Payment> findAll() {
        return paymentRepository.findAll();
    }

    public Payment findById(String id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found"));
    }

    public Payment create(Payment payment, String studentId, String classId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        TuitionClass clazz = classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found"));

        payment.setStudent(student);
        payment.setTuitionClass(clazz);
        payment.setType("CLASS_FEE");
        payment.setStatus("PENDING");
        payment.setPaidAt(null);

        return paymentRepository.save(payment);
    }

    public Payment createAdmissionPayment(Payment payment, String studentName, String moduleId) {
        Student student = studentRepository.findByFullName(studentName)
            .orElseGet(() -> studentRepository.save(Student.builder()
                .fullName(studentName)
                .status("PENDING")
                .build()));

        payment.setStudent(student);
        payment.setTuitionClass(null);
        payment.setType("ADMISSION");
        payment.setStatus("PENDING");
        payment.setPaidAt(null);

        return paymentRepository.save(payment);
    }

    public List<Payment> findPendingPayments() {
        return paymentRepository.findAll().stream()
                .filter(payment -> "PENDING".equals(payment.getStatus()))
                .toList();
    }

    public Payment approvePayment(String id) {
        Payment payment = findById(id);
        if (!"PENDING".equals(payment.getStatus())) {
            throw new IllegalStateException("Only pending payments can be approved");
        }

        payment.setStatus("PAID");
        payment.setPaidAt(LocalDateTime.now());

        Student student = payment.getStudent();
        student.setStatus("ACTIVE");

        if (payment.getTuitionClass() != null) {
            studentService.enrollStudentInClass(student.getId(), payment.getTuitionClass().getId());
        } else {
            studentRepository.save(student);
        }

        if (student.getEmail() != null && !student.getEmail().isBlank()) {
            emailService.sendSuccessMail(student.getEmail());
        }
        if (student.getContactNumber() != null && !student.getContactNumber().isBlank()) {
            smsService.sendSuccessSMS(student.getContactNumber());
        }

        return paymentRepository.save(payment);
    }

    public Payment declinePayment(String id) {
        Payment payment = findById(id);
        if (!"PENDING".equals(payment.getStatus())) {
            throw new IllegalStateException("Only pending payments can be declined");
        }

        payment.setStatus("DECLINED");
        Student student = payment.getStudent();
        if (student != null) {
            if (student.getEmail() != null && !student.getEmail().isBlank()) {
                emailService.sendFailureMail(student.getEmail());
            }
            if (student.getContactNumber() != null && !student.getContactNumber().isBlank()) {
                smsService.sendFailureSMS(student.getContactNumber());
            }
        }
        return paymentRepository.save(payment);
    }

    public void delete(String id) {        paymentRepository.deleteById(id);
    }
}
