package com.ahorrosMindset.mindset.Mapper;

import com.ahorrosMindset.mindset.Dto.response.UserResponse;
import com.ahorrosMindset.mindset.Entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
}
