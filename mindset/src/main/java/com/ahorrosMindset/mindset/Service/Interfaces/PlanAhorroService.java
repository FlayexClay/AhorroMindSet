package com.ahorrosMindset.mindset.Service.Interfaces;

import com.ahorrosMindset.mindset.Dto.request.PlanAhorroRequest;
import com.ahorrosMindset.mindset.Dto.response.PlanAhorroResponse;

import java.util.List;

public interface PlanAhorroService {
    PlanAhorroResponse crearPlan(PlanAhorroRequest request, Long usuarioId);
    List<PlanAhorroResponse> obtenerPlanesPorUsuario(Long usuarioId);
    PlanAhorroResponse obtenerPlanPorId(Long planId, Long usuarioId);
}
