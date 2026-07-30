package com.tactio.mdm.application.dto.inventory;

import java.time.Instant;

public record DeviceMetricResponse(
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
        Instant capturedAt
) {
}
