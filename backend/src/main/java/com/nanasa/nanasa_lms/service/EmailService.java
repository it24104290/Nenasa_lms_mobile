package com.nanasa.nanasa_lms.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {
    public void sendSuccessMail(String toEmail) {
        // Dummy implementation for JavaMailSender
        System.out.println("Sending Success Email to " + toEmail + " -> Payment Successful.");
    }

    public void sendFailureMail(String toEmail) {
        // Dummy implementation for JavaMailSender
        System.out.println("Sending Failure Email to " + toEmail + " -> Payment Unsuccessful.");
    }
}
