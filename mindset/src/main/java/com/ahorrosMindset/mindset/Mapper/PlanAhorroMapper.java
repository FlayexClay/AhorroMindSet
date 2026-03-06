package com.ahorrosMindset.mindset.Mapper;

import com.ahorrosMindset.mindset.Dto.request.PlanAhorroRequest;
import com.ahorrosMindset.mindset.Dto.response.PlanAhorroResponse;
import com.ahorrosMindset.mindset.Entity.PlanAhorro;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PlanAhorroMapper {

    @Mapping(target = "usuarioId", source = "usuario.id")
    @Mapping(target = "metaRestante", expression = "java(plan.getMetaRestante())")
    @Mapping(target = "metaAlcanzada", expression = "java(plan.isMetaAlcanzada())")
    PlanAhorroResponse toResponse(PlanAhorro plan);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "montoRecibido", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "ahorros", ignore = true)
    PlanAhorro toEntity(PlanAhorroRequest request);
}
