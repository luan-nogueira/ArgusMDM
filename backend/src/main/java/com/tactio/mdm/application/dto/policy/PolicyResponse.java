package com.tactio.mdm.application.dto.policy;

import com.tactio.mdm.domain.enums.UpdatePolicyType;

import java.util.UUID;

public record PolicyResponse(
        UUID id,
        String name,
        String description,
        boolean passwordRequired,
        int minPasswordLength,
        long maxInactivityLockMs,
        UpdatePolicyType updatePolicy,
        boolean cameraDisabled,
        boolean screenCaptureDisabled,
        boolean factoryResetDisabled,
        boolean installAppsDisabled,
        boolean usbFileTransferDisabled,
        String restrictionsJson,
        boolean active
) {
}
