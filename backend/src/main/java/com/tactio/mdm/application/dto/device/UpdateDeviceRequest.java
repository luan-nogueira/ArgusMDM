package com.tactio.mdm.application.dto.device;

import com.tactio.mdm.domain.enums.DeviceStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Set;
import java.util.UUID;

public record UpdateDeviceRequest(
        @NotBlank @Size(max = 150) String name,
        @Size(max = 100) String model,
        @Size(max = 100) String manufacturer,
        @NotNull DeviceStatus status,
        UUID departmentId,
        UUID responsibleUserId,
        Set<UUID> tagIds
) {
}
