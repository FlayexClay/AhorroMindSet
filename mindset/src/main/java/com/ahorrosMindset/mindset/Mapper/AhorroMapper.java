package com.ahorrosMindset.mindset.Mapper;

import com.ahorrosMindset.mindset.Dto.request.AhorroRequest;
import com.ahorrosMindset.mindset.Dto.response.AhorroResponse;
import com.ahorrosMindset.mindset.Entity.Ahorro;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AhorroMapper {

    @Mapping(target = "planAhorroId", source = "planAhorro.id")
    AhorroResponse toResponse(Ahorro ahorro);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "planAhorro", ignore = true)
    Ahorro toEntity(AhorroRequest request);
}
