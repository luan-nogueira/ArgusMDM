package com.tactio.mdm.application.dto.geofence;

import java.util.Set;
import java.util.UUID;

public record GeofenceResponse(
        UUID id,
        String name,
        Double centerLatitude,
        Double centerLongitude,
        Double radiusMeters,
        boolean active,
        Set<UUID> deviceIds
) {
}
