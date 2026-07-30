package com.tactio.mdm.application.dto.user;

import com.tactio.mdm.domain.enums.UserRole;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        UserRole role,
        boolean active,
        boolean twoFaEnabled,
        Instant createdAt
) {
}
