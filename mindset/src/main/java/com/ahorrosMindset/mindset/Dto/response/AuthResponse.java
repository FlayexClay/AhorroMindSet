package com.ahorrosMindset.mindset.Dto.response;

import com.ahorrosMindset.mindset.common.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String correo;
    private String nombre;
    private String apellidos;
    private Role rol;
}
