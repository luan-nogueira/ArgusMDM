package com.tactio.mdm.api.controller;

import com.tactio.mdm.application.dto.common.PageResponse;
import com.tactio.mdm.application.dto.geofence.GeofenceEventResponse;
import com.tactio.mdm.application.dto.geofence.GeofenceRequest;
import com.tactio.mdm.application.dto.geofence.GeofenceResponse;
import com.tactio.mdm.application.usecase.GeofenceUseCase;
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

import java.util.List;
import java.util.UUID;

@Tag(name = "Geofencing")
@RestController
@RequestMapping("/api/v1/geofences")
@RequiredArgsConstructor
public class GeofenceController {

    private final GeofenceUseCase geofenceUseCase;

    @GetMapping
    public ResponseEntity<List<GeofenceResponse>> list() {
        return ResponseEntity.ok(geofenceUseCase.list());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR')")
    public ResponseEntity<GeofenceResponse> create(@Valid @RequestBody GeofenceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(geofenceUseCase.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR')")
    public ResponseEntity<GeofenceResponse> update(@PathVariable UUID id, @Valid @RequestBody GeofenceRequest request) {
        return ResponseEntity.ok(geofenceUseCase.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        geofenceUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/events")
    public ResponseEntity<PageResponse<GeofenceEventResponse>> events(
            @RequestParam UUID deviceId, Pageable pageable) {
        return ResponseEntity.ok(geofenceUseCase.events(deviceId, pageable));
    }
}
