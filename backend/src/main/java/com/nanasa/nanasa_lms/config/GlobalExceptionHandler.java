package com.nanasa.nanasa_lms.config;

import com.mongodb.DuplicateKeyException;
import com.mongodb.MongoSecurityException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.data.mongodb.UncategorizedMongoDbException;
import org.springframework.validation.FieldError;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("message", ex.getMessage() != null ? ex.getMessage() : "Invalid request");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> body = new HashMap<>();

        FieldError firstError = ex.getBindingResult().getFieldErrors().stream().findFirst().orElse(null);
        if (firstError != null) {
            body.put("message", firstError.getField() + ": " + firstError.getDefaultMessage());
        } else {
            body.put("message", "Validation failed");
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleUnreadable(HttpMessageNotReadableException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("message", "Invalid request format. Check role and input values.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler({DataIntegrityViolationException.class, DuplicateKeyException.class})
    public ResponseEntity<Map<String, String>> handleDataConflict(Exception ex) {
        Map<String, String> body = new HashMap<>();
        body.put("message", "Username or email already exists");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuthentication(AuthenticationException ex) {
        Map<String, String> body = new HashMap<>();

        if (isMongoAuthFailure(ex)) {
            body.put("message", "Database authentication failed. Verify MongoDB username/password and database permissions.");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
        }

        body.put("message", "Invalid username or password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    @ExceptionHandler({MongoSecurityException.class, UncategorizedMongoDbException.class})
    public ResponseEntity<Map<String, String>> handleMongoAuth(Exception ex) {
        Map<String, String> body = new HashMap<>();
        if (isMongoAuthFailure(ex)) {
            body.put("message", "Database authentication failed. Verify MongoDB username/password and database permissions.");
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
        }

        body.put("message", "Database connection failed. Please try again later.");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("message", "Access denied");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(NoResourceFoundException ex) {
        Map<String, String> body = new HashMap<>();
        body.put("message", "Resource not found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneral(Exception ex) {
        log.error("Unhandled server error", ex);
        Map<String, String> body = new HashMap<>();
        String message = ex.getMessage();
        body.put("message", (message != null && !message.isBlank()) ? message : "Unexpected server error");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    private boolean isMongoAuthFailure(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof MongoSecurityException) {
                return true;
            }

            String message = current.getMessage();
            if (message != null) {
                String normalized = message.toLowerCase();
                if (normalized.contains("authentication failed") || normalized.contains("bad auth")) {
                    return true;
                }
            }

            current = current.getCause();
        }
        return false;
    }
}