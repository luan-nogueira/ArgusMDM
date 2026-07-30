package com.tactio.mdm.application.dto.org;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TagRequest(
        @NotBlank @Size(max = 60) String name,
        @Size(max = 20) String color
) {
}
