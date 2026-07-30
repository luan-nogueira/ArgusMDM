package com.tactio.mdm.application.dto.location;

import java.time.Instant;
import java.util.UUID;

public record LocationHistoryResponse(
        UUID id,
        UUID deviceId,
        String deviceName,
        Double latitude,
        Double longitude,
        Double accuracy,
        Double altitude,
        Double speed,
        Instant capturedAt
) {
}
