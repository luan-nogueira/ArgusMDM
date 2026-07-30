package com.tactio.mdm.application.dto.device;

import com.tactio.mdm.application.dto.org.DepartmentResponse;
import com.tactio.mdm.application.dto.org.TagResponse;
import com.tactio.mdm.application.dto.user.UserResponse;
import com.tactio.mdm.domain.enums.DeviceStatus;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record DeviceResponse(
        UUID id,
        String name,
        String model,
        String manufacturer,
        String androidVersion,
        String imei,
        String serialNumber,
        DeviceStatus status,
        Instant lastSyncAt,
        boolean deviceOwnerActive,
        DepartmentResponse department,
        UserResponse responsibleUser,
        Set<TagResponse> tags,
        Instant createdAt
) {
}
