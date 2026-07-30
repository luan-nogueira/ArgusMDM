package com.tactio.mdm.api.controller;

import com.tactio.mdm.application.dto.common.PageResponse;
import com.tactio.mdm.application.dto.device.CreateDeviceRequest;
import com.tactio.mdm.application.dto.device.DashboardSummaryResponse;
import com.tactio.mdm.application.dto.device.DeviceProvisionResponse;
import com.tactio.mdm.application.dto.device.DeviceResponse;
import com.tactio.mdm.application.dto.device.UpdateDeviceRequest;
import com.tactio.mdm.application.usecase.DeviceUseCase;
import com.tactio.mdm.domain.enums.DeviceStatus;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Tag(name = "Dispositivos")
@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceUseCase deviceUseCase;

    @GetMapping
    public ResponseEntity<PageResponse<DeviceResponse>> list(
            @RequestParam(required = false) DeviceStatus status,
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) UUID tagId,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(PageResponse.from(
                deviceUseCase.list(status, departmentId, tagId, search, pageable)));
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<DashboardSummaryResponse> dashboardSummary() {
        return ResponseEntity.ok(deviceUseCase.dashboardSummary());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeviceResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(deviceUseCase.get(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR')")
    public ResponseEntity<DeviceProvisionResponse> create(@Valid @RequestBody CreateDeviceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(deviceUseCase.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR')")
    public ResponseEntity<DeviceResponse> update(@PathVariable UUID id, @Valid @RequestBody UpdateDeviceRequest request) {
        return ResponseEntity.ok(deviceUseCase.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        deviceUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/api-key/regenerate")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR')")
    public ResponseEntity<DeviceProvisionResponse> regenerateApiKey(@PathVariable UUID id) {
        return ResponseEntity.ok(deviceUseCase.regenerateApiKey(id));
    }

    @PostMapping("/{id}/lock")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR')")
    public ResponseEntity<Void> lock(@PathVariable UUID id) {
        deviceUseCase.lock(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/unlock")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR')")
    public ResponseEntity<Void> unlock(@PathVariable UUID id) {
        deviceUseCase.unlock(id);
        return ResponseEntity.noContent().build();
    }
}
