package com.ahorrosMindset.mindset.Service.Interfaces;

import com.ahorrosMindset.mindset.Dto.request.AhorroRequest;
import com.ahorrosMindset.mindset.Dto.response.AhorroResponse;

import java.util.List;

public interface AhorroService {
    AhorroResponse registrarAhorro(Long planId, AhorroRequest request, Long usuarioId);
    List<AhorroResponse> obtenerAhorrosPorPlan(Long planId, Long usuarioId);
}
