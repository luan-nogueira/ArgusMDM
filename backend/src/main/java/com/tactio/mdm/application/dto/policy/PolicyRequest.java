package com.tactio.mdm.application.dto.policy;

import com.tactio.mdm.domain.enums.UpdatePolicyType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PolicyRequest(
        @NotBlank @Size(max = 120) String name,
        @Size(max = 500) String description,
        boolean passwordRequired,
        @Min(4) int minPasswordLength,
        @Min(0) long maxInactivityLockMs,
        @NotNull UpdatePolicyType updatePolicy,
        boolean cameraDisabled,
        boolean screenCaptureDisabled,
        boolean factoryResetDisabled,
        boolean installAppsDisabled,
        boolean usbFileTransferDisabled,
        String restrictionsJson,
        boolean active
) {
}
