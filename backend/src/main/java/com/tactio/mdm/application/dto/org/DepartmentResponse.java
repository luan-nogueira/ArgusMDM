package com.tactio.mdm.application.dto.org;

import java.util.UUID;

public record DepartmentResponse(
        UUID id,
        String name,
        String description
) {
}
