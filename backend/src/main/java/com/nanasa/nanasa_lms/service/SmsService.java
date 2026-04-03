package com.nanasa.nanasa_lms.service;

import org.springframework.stereotype.Service;

@Service
public class SmsService {
    public void sendSuccessSMS(String phoneNumber) {
        // Dummy implementation for Twilio
        System.out.println("Sending Success SMS to " + phoneNumber + " -> Payment Successful.");
    }

    public void sendFailureSMS(String phoneNumber) {
        // Dummy implementation for Twilio
        System.out.println("Sending Failure SMS to " + phoneNumber + " -> Payment Unsuccessful.");
    }
}
