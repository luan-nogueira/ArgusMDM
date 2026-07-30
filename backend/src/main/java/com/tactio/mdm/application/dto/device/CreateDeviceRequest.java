package com.tactio.mdm.application.dto.device;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;
import java.util.UUID;

public record CreateDeviceRequest(
        @NotBlank @Size(max = 150) String name,
        @Size(max = 100) String model,
        @Size(max = 100) String manufacturer,
        @Size(max = 20) String androidVersion,
        @Size(max = 30) String imei,
        @Size(max = 60) String serialNumber,
        UUID departmentId,
        UUID responsibleUserId,
        Set<UUID> tagIds
) {
}
