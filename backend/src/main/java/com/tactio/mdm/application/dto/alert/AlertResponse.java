package com.tactio.mdm.application.dto.alert;

import com.tactio.mdm.domain.enums.AlertType;

import java.time.Instant;
import java.util.UUID;

public record AlertResponse(
        UUID id,
        AlertType type,
        UUID deviceId,
        String deviceName,
        String message,
        boolean read,
        Instant createdAt
) {
}
