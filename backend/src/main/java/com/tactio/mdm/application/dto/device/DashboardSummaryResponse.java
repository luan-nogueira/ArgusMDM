package com.tactio.mdm.application.dto.device;

import com.tactio.mdm.application.dto.alert.AlertResponse;
import com.tactio.mdm.application.dto.location.LocationHistoryResponse;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record DashboardSummaryResponse(
        long totalDevices,
        long onlineDevices,
        long offlineDevices,
        long lowBatteryDevices,
        long unreadAlerts,
        List<AlertResponse> recentAlerts,
        Map<UUID, LocationHistoryResponse> recentLocationsByDevice
) {
}
