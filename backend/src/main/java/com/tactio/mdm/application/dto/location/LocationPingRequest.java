package com.tactio.mdm.application.dto.location;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record LocationPingRequest(
        @NotNull Double latitude,
        @NotNull Double longitude,
        Double accuracy,
        Double altitude,
        Double speed,
        @NotNull Instant capturedAt
) {
}
