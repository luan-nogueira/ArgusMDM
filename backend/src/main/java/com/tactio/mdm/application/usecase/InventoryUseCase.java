package com.tactio.mdm.application.usecase;

import com.tactio.mdm.api.exception.ResourceNotFoundException;
import com.tactio.mdm.application.dto.inventory.DeviceMetricRequest;
import com.tactio.mdm.application.dto.inventory.DeviceMetricResponse;
import com.tactio.mdm.application.dto.inventory.InstalledAppResponse;
import com.tactio.mdm.application.dto.inventory.InstalledAppSyncRequest;
import com.tactio.mdm.application.mapper.InventoryMapper;
import com.tactio.mdm.domain.entity.Device;
import com.tactio.mdm.domain.entity.DeviceMetric;
import com.tactio.mdm.domain.entity.InstalledApp;
import com.tactio.mdm.domain.enums.AlertType;
import com.tactio.mdm.domain.repository.DeviceMetricRepository;
import com.tactio.mdm.domain.repository.DeviceRepository;
import com.tactio.mdm.domain.repository.InstalledAppRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InventoryUseCase {

    private final InstalledAppRepository installedAppRepository;
    private final DeviceMetricRepository deviceMetricRepository;
    private final DeviceRepository deviceRepository;
    private final DeviceUseCase deviceUseCase;
    private final AlertUseCase alertUseCase;

    @Value("${mdm.device.low-battery-threshold-percent:15}")
    private int lowBatteryThresholdPercent;

    @Transactional
    public void syncInstalledApps(UUID deviceId, InstalledAppSyncRequest request) {
        Device device = findDevice(deviceId);
        installedAppRepository.deleteAllByDeviceId(deviceId);

        for (var entry : request.apps()) {
            InstalledApp app = new InstalledApp();
            app.setDevice(device);
            app.setPackageName(entry.packageName());
            app.setAppName(entry.appName());
            app.setVersionName(entry.versionName());
            app.setVersionCode(entry.versionCode());
            app.setSizeBytes(entry.sizeBytes());
            app.setSystemApp(entry.systemApp());
            installedAppRepository.save(app);
        }

        deviceUseCase.markSynced(deviceId);
    }

    @Transactional(readOnly = true)
    public List<InstalledAppResponse> listInstalledApps(UUID deviceId) {
        return installedAppRepository.findByDeviceId(deviceId).stream()
                .map(InventoryMapper::toResponse)
                .toList();
    }

    @Transactional
    public void syncMetrics(UUID deviceId, DeviceMetricRequest request) {
        Device device = findDevice(deviceId);

        DeviceMetric metric = new DeviceMetric();
        metric.setDevice(device);
        metric.setBatteryLevel(request.batteryLevel());
        metric.setCharging(request.charging());
        metric.setStorageUsedBytes(request.storageUsedBytes());
        metric.setStorageTotalBytes(request.storageTotalBytes());
        metric.setMemoryUsedBytes(request.memoryUsedBytes());
        metric.setMemoryTotalBytes(request.memoryTotalBytes());
        metric.setCpuUsagePercent(request.cpuUsagePercent());
        metric.setWifiConnected(request.wifiConnected());
        metric.setWifiSsid(request.wifiSsid());
        metric.setBluetoothEnabled(request.bluetoothEnabled());
        metric.setNetworkOperator(request.networkOperator());
        metric.setCapturedAt(request.capturedAt());
        deviceMetricRepository.save(metric);

        if (request.batteryLevel() != null && request.batteryLevel() <= lowBatteryThresholdPercent) {
            alertUseCase.raise(AlertType.LOW_BATTERY, device,
                    device.getName() + " está com bateria baixa (" + request.batteryLevel() + "%)");
        }

        deviceUseCase.markSynced(deviceId);
    }

    @Transactional(readOnly = true)
    public DeviceMetricResponse latestMetric(UUID deviceId) {
        return deviceMetricRepository.findTop1ByDeviceIdOrderByCapturedAtDesc(deviceId).stream()
                .findFirst()
                .map(InventoryMapper::toResponse)
                .orElse(null);
    }

    private Device findDevice(UUID deviceId) {
        return deviceRepository.findById(deviceId)
                .orElseThrow(() -> ResourceNotFoundException.of("Dispositivo", deviceId));
    }
}
