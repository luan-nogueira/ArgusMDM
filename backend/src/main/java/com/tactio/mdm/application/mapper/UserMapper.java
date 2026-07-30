package com.tactio.mdm.application.mapper;

import com.tactio.mdm.application.dto.user.UserResponse;
import com.tactio.mdm.domain.entity.User;

public final class UserMapper {

    private UserMapper() {
    }

    public static UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isActive(),
                user.isTwoFaEnabled(),
                user.getCreatedAt()
        );
    }
}
