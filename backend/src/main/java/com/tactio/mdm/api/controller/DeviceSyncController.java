package com.tactio.mdm.api.controller;

import com.tactio.mdm.application.dto.inventory.DeviceMetricRequest;
import com.tactio.mdm.application.dto.inventory.InstalledAppSyncRequest;
import com.tactio.mdm.application.dto.location.LocationHistoryResponse;
import com.tactio.mdm.application.dto.location.LocationPingRequest;
import com.tactio.mdm.application.dto.policy.PolicyResponse;
import com.tactio.mdm.application.usecase.InventoryUseCase;
import com.tactio.mdm.application.usecase.LocationUseCase;
import com.tactio.mdm.application.usecase.PolicyUseCase;
import com.tactio.mdm.security.CurrentDeviceProvider;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints consumidos exclusivamente pelo app Android via par (X-Device-Id, X-Device-Key),
 * autenticado por {@link com.tactio.mdm.security.DeviceApiKeyAuthFilter}. Não usam JWT de usuário.
 */
@Tag(name = "Sincronização de Dispositivo (Android)")
@RestController
@RequestMapping("/api/v1/sync")
@RequiredArgsConstructor
public class DeviceSyncController {

    private final LocationUseCase locationUseCase;
    private final InventoryUseCase inventoryUseCase;
    private final PolicyUseCase policyUseCase;
    private final CurrentDeviceProvider currentDeviceProvider;

    @PostMapping("/location")
    public ResponseEntity<LocationHistoryResponse> pingLocation(@Valid @RequestBody LocationPingRequest request) {
        var deviceId = currentDeviceProvider.requireCurrentDeviceId();
        return ResponseEntity.ok(locationUseCase.recordPing(deviceId, request));
    }

    @PostMapping("/apps")
    public ResponseEntity<Void> syncApps(@Valid @RequestBody InstalledAppSyncRequest request) {
        var deviceId = currentDeviceProvider.requireCurrentDeviceId();
        inventoryUseCase.syncInstalledApps(deviceId, request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/metrics")
    public ResponseEntity<Void> syncMetrics(@Valid @RequestBody DeviceMetricRequest request) {
        var deviceId = currentDeviceProvider.requireCurrentDeviceId();
        inventoryUseCase.syncMetrics(deviceId, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/policy")
    public ResponseEntity<PolicyResponse> policy() {
        var deviceId = currentDeviceProvider.requireCurrentDeviceId();
        return ResponseEntity.ok(policyUseCase.effectivePolicyForDevice(deviceId));
    }
}
