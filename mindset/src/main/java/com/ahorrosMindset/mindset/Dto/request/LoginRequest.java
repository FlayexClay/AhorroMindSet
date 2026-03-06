package com.ahorrosMindset.mindset.Dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "El correo es requerido")
    @Email(message = "El correo no tiene un formato valido")
    private String correo;

    @NotBlank(message = "La contraseña es requerida")
    private String password;
}
