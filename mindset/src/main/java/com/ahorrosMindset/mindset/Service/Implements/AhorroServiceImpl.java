package com.ahorrosMindset.mindset.Service.Implements;

import com.ahorrosMindset.mindset.Dto.request.AhorroRequest;
import com.ahorrosMindset.mindset.Dto.response.AhorroResponse;
import com.ahorrosMindset.mindset.Entity.Ahorro;
import com.ahorrosMindset.mindset.Entity.PlanAhorro;
import com.ahorrosMindset.mindset.Entity.User;
import com.ahorrosMindset.mindset.Exception.ResourceNotFoundException;
import com.ahorrosMindset.mindset.Mapper.AhorroMapper;
import com.ahorrosMindset.mindset.Repository.AhorroRepository;
import com.ahorrosMindset.mindset.Repository.PlanAhorroRepository;
import com.ahorrosMindset.mindset.Repository.UserRepository;
import com.ahorrosMindset.mindset.Service.Interfaces.AhorroService;
import com.ahorrosMindset.mindset.Service.email.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AhorroServiceImpl implements AhorroService {

    private final AhorroRepository ahorroRepository;
    private final PlanAhorroRepository planAhorroRepository;
    private final AhorroMapper ahorroMapper;
    private final UserRepository userRepository;
    private final EmailService emailService;


    @Override
    @Transactional
    public AhorroResponse registrarAhorro(Long planId, AhorroRequest request, Long usuarioId) {
        PlanAhorro plan = planAhorroRepository.findByIdAndUsuarioId(planId, usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan de ahorro no encontrado" + planId));

        Ahorro ahorro = ahorroMapper.toEntity(request);
        ahorro.setPlanAhorro(plan);

        plan.setMontoRecibido(plan.getMontoRecibido().add(request.getMonto()));
        planAhorroRepository.save(plan);

        Ahorro saved = ahorroRepository.save(ahorro);

        User usuario = userRepository.findById(usuarioId).orElse(null);
        if (usuario != null){
            emailService.enviarConfirmacionAhorro(usuario, saved, plan);
        }

        return ahorroMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public List<AhorroResponse> obtenerAhorrosPorPlan(Long planId, Long usuarioId) {
       planAhorroRepository.findByIdAndUsuarioId(planId, usuarioId)
               .orElseThrow(() -> new ResourceNotFoundException("Plan de ahorro no encontrado" + planId));

       return ahorroRepository.findByPlanAhorroId(planId)
               .stream()
               .map(ahorroMapper::toResponse)
               .toList();
    }
}
