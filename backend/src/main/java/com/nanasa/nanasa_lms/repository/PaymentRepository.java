package com.nanasa.nanasa_lms.repository;

import com.nanasa.nanasa_lms.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PaymentRepository extends MongoRepository<Payment, String> {
}

