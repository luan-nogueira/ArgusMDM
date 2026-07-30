package com.tactio.mdm.application.dto.org;

import java.util.UUID;

public record TagResponse(
        UUID id,
        String name,
        String color
) {
}
