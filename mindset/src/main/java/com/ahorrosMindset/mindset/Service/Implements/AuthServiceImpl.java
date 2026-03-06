package com.ahorrosMindset.mindset.Service.Implements;

import com.ahorrosMindset.mindset.Dto.request.LoginRequest;
import com.ahorrosMindset.mindset.Dto.request.RegisterRequest;
import com.ahorrosMindset.mindset.Dto.response.AuthResponse;
import com.ahorrosMindset.mindset.Entity.User;
import com.ahorrosMindset.mindset.Exception.BadRequestException;
import com.ahorrosMindset.mindset.Repository.UserRepository;
import com.ahorrosMindset.mindset.Service.Interfaces.AuthService;
import com.ahorrosMindset.mindset.common.Role;
import com.ahorrosMindset.mindset.security.jwt.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;


    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByCorreo(request.getCorreo())) {
            throw new BadRequestException("Ya existe un usuario registrado con este correo" + request.getCorreo());
        }

        User user = User.builder()
                .nombre(request.getNombre())
                .apellidos(request.getApellidos())
                .correo(request.getCorreo())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(Role.ROLE_USER)
                .build();

        userRepository.save(user);
        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .correo(user.getCorreo())
                .nombre(user.getNombre())
                .apellidos(user.getApellidos())
                .rol(user.getRol())
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getCorreo(), request.getPassword())
        );

        User user = userRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new BadRequestException("Credenciales invalidas"));

        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .correo(user.getCorreo())
                .nombre(user.getNombre())
                .apellidos(user.getApellidos())
                .rol(user.getRol())
                .build();
    }
}
