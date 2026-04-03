package com.nanasa.nanasa_lms.dto;

import com.nanasa.nanasa_lms.model.Role;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponse {
    private String token;
    private String username;
    private Role role;
    private String teacherId;

    public AuthResponse(String token, String username, Role role, String teacherId) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.teacherId = teacherId;
    }
}
