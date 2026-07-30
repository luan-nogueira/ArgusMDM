package com.tactio.mdm.application.dto.user;

import com.tactio.mdm.domain.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @NotBlank @Size(max = 150) String name,
        @NotNull UserRole role,
        boolean active
) {
}
