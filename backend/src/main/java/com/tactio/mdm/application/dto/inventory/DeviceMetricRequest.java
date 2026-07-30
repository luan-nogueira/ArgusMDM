package com.tactio.mdm.application.dto.inventory;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record DeviceMetricRequest(
        Integer batteryLevel,
        Boolean charging,
        Long storageUsedBytes,
        Long storageTotalBytes,
        Long memoryUsedBytes,
        Long memoryTotalBytes,
        Double cpuUsagePercent,
        Boolean wifiConnected,
        String wifiSsid,
        Boolean bluetoothEnabled,
        String networkOperator,
        @NotNull Instant capturedAt
) {
}
