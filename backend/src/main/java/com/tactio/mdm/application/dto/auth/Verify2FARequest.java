package com.tactio.mdm.application.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record Verify2FARequest(
        @NotBlank String code
) {
}
