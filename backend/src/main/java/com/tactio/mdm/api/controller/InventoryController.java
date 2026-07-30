package com.tactio.mdm.api.controller;

import com.tactio.mdm.application.dto.inventory.DeviceMetricResponse;
import com.tactio.mdm.application.dto.inventory.InstalledAppResponse;
import com.tactio.mdm.application.usecase.InventoryUseCase;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Inventário")
@RestController
@RequestMapping("/api/v1/devices/{deviceId}/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryUseCase inventoryUseCase;

    @GetMapping("/apps")
    public ResponseEntity<List<InstalledAppResponse>> apps(@PathVariable UUID deviceId) {
        return ResponseEntity.ok(inventoryUseCase.listInstalledApps(deviceId));
    }

    @GetMapping("/metrics/latest")
    public ResponseEntity<DeviceMetricResponse> latestMetrics(@PathVariable UUID deviceId) {
        return ResponseEntity.ok(inventoryUseCase.latestMetric(deviceId));
    }
}
