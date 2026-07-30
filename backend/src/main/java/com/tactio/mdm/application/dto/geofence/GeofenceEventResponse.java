package com.tactio.mdm.application.dto.geofence;

import com.tactio.mdm.domain.enums.GeofenceEventType;

import java.time.Instant;
import java.util.UUID;

public record GeofenceEventResponse(
        UUID id,
        UUID geofenceId,
        String geofenceName,
        UUID deviceId,
        String deviceName,
        GeofenceEventType type,
        Instant occurredAt
) {
}
