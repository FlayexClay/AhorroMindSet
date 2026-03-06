package com.ahorrosMindset.mindset.Dto.response;

import com.ahorrosMindset.mindset.common.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String nombre;
    private String apellidos;
    private String correo;
    private Role rol;
}
