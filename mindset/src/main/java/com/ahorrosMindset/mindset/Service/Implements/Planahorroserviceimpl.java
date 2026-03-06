package com.ahorrosMindset.mindset.Service.Implements;

import com.ahorrosMindset.mindset.Dto.request.PlanAhorroRequest;
import com.ahorrosMindset.mindset.Dto.response.PlanAhorroResponse;
import com.ahorrosMindset.mindset.Entity.PlanAhorro;
import com.ahorrosMindset.mindset.Entity.User;
import com.ahorrosMindset.mindset.Exception.BadRequestException;
import com.ahorrosMindset.mindset.Exception.ResourceNotFoundException;
import com.ahorrosMindset.mindset.Mapper.PlanAhorroMapper;
import com.ahorrosMindset.mindset.Repository.PlanAhorroRepository;
import com.ahorrosMindset.mindset.Repository.UserRepository;
import com.ahorrosMindset.mindset.Service.Interfaces.PlanAhorroService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class Planahorroserviceimpl implements PlanAhorroService {

    private final PlanAhorroRepository planAhorroRepository;
    private final UserRepository userRepository;
    private final PlanAhorroMapper planAhorroMapper;

    @Override
    @Transactional
    public PlanAhorroResponse crearPlan(PlanAhorroRequest request, Long usuarioId) {
        if (planAhorroRepository.existsByUsuarioIdAndMes(usuarioId, request.getMes())) {
            throw new BadRequestException("Ya tienes un plan de ahorro para el mes" + request.getMes());
        }

        User usuario = userRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        PlanAhorro plan = planAhorroMapper.toEntity(request);
        plan.setUsuario(usuario);

        PlanAhorro saved = planAhorroRepository.save(plan);
        return planAhorroMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlanAhorroResponse> obtenerPlanesPorUsuario(Long usuarioId) {
        return planAhorroRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(planAhorroMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PlanAhorroResponse obtenerPlanPorId(Long planId, Long usuarioId) {
        PlanAhorro plan = planAhorroRepository.findByIdAndUsuarioId(planId, usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan de ahorro no encontrado" + planId));
        return planAhorroMapper.toResponse(plan);
    }
}
