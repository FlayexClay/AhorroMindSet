package com.ahorrosMindset.mindset.Controller;

import com.ahorrosMindset.mindset.Dto.request.PlanAhorroRequest;
import com.ahorrosMindset.mindset.Dto.response.ApiResponse;
import com.ahorrosMindset.mindset.Dto.response.PlanAhorroResponse;
import com.ahorrosMindset.mindset.Entity.User;
import com.ahorrosMindset.mindset.Service.Interfaces.PlanAhorroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planes")
@RequiredArgsConstructor
public class PlanAhorroController {

    private final PlanAhorroService planAhorroService;

    @PostMapping
    public ResponseEntity<ApiResponse<PlanAhorroResponse>> crearPlan(
            @Valid @RequestBody PlanAhorroRequest request,
            @AuthenticationPrincipal User usuario
    ){
        PlanAhorroResponse response = planAhorroService.crearPlan(request, usuario.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Plan de ahorro creado exitosamente", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PlanAhorroResponse>>> obtenerMisPlanes(
            @AuthenticationPrincipal User usuario
    ) {
        List<PlanAhorroResponse> planes = planAhorroService.obtenerPlanesPorUsuario(usuario.getId());
        return ResponseEntity.ok(ApiResponse.ok("Planes de ahorro obtenidos", planes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PlanAhorroResponse>> obtenerPlan(
            @PathVariable Long id,
            @AuthenticationPrincipal User usuario
    ) {
        PlanAhorroResponse plan = planAhorroService.obtenerPlanPorId(id, usuario.getId());
        return ResponseEntity.ok(ApiResponse.ok("Plan de ahorro obtenido", plan));
    }
}
