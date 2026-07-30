package com.tactio.mdm.application.mapper;

import com.tactio.mdm.application.dto.inventory.DeviceMetricResponse;
import com.tactio.mdm.application.dto.inventory.InstalledAppResponse;
import com.tactio.mdm.domain.entity.DeviceMetric;
import com.tactio.mdm.domain.entity.InstalledApp;

public final class InventoryMapper {

    private InventoryMapper() {
    }

    public static InstalledAppResponse toResponse(InstalledApp app) {
        if (app == null) {
            return null;
        }
        return new InstalledAppResponse(
                app.getId(),
                app.getPackageName(),
                app.getAppName(),
                app.getVersionName(),
                app.getVersionCode(),
                app.getSizeBytes(),
                app.isSystemApp()
        );
    }

    public static DeviceMetricResponse toResponse(DeviceMetric metric) {
        if (metric == null) {
            return null;
        }
        return new DeviceMetricResponse(
                metric.getBatteryLevel(),
                metric.getCharging(),
                metric.getStorageUsedBytes(),
                metric.getStorageTotalBytes(),
                metric.getMemoryUsedBytes(),
                metric.getMemoryTotalBytes(),
                metric.getCpuUsagePercent(),
                metric.getWifiConnected(),
                metric.getWifiSsid(),
                metric.getBluetoothEnabled(),
                metric.getNetworkOperator(),
                metric.getCapturedAt()
        );
    }
}
