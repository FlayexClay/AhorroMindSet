package com.ahorrosMindset.mindset.Controller;

import com.ahorrosMindset.mindset.Dto.request.AhorroRequest;
import com.ahorrosMindset.mindset.Dto.response.AhorroResponse;
import com.ahorrosMindset.mindset.Dto.response.ApiResponse;
import com.ahorrosMindset.mindset.Entity.User;
import com.ahorrosMindset.mindset.Service.Interfaces.AhorroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planes/{planId}/ahorros")
@RequiredArgsConstructor
public class AhorroController {

    private final AhorroService ahorroService;

    @PostMapping
    public ResponseEntity<ApiResponse<AhorroResponse>> registarAhorro(
            @PathVariable Long planId,
            @Valid @RequestBody AhorroRequest request,
            @AuthenticationPrincipal User usuario
    ){
        AhorroResponse response = ahorroService.registrarAhorro(planId,request, usuario.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Ahorro registrado exitosamente", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AhorroResponse>>> obtenerAhorros(
            @PathVariable Long planId,
            @AuthenticationPrincipal User usuario
    ) {
        List<AhorroResponse> ahorros = ahorroService.obtenerAhorrosPorPlan(planId, usuario.getId());
        return ResponseEntity.ok(ApiResponse.ok("Ahorros obtenidos", ahorros));
    }
}
