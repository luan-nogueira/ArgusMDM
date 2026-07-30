package com.tactio.mdm.application.dto.geofence;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.Set;
import java.util.UUID;

public record GeofenceRequest(
        @NotBlank @Size(max = 120) String name,
        @NotNull Double centerLatitude,
        @NotNull Double centerLongitude,
        @NotNull @Positive Double radiusMeters,
        boolean active,
        Set<UUID> deviceIds
) {
}
