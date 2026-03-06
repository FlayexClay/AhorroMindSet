package com.ahorrosMindset.mindset.Service.Interfaces;

import com.ahorrosMindset.mindset.Dto.request.LoginRequest;
import com.ahorrosMindset.mindset.Dto.request.RegisterRequest;
import com.ahorrosMindset.mindset.Dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
