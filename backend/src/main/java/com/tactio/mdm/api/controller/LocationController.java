package com.tactio.mdm.api.controller;

import com.tactio.mdm.application.dto.common.PageResponse;
import com.tactio.mdm.application.dto.location.LocationHistoryResponse;
import com.tactio.mdm.application.usecase.LocationUseCase;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.UUID;

@Tag(name = "Localização")
@RestController
@RequestMapping("/api/v1/devices/{deviceId}/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationUseCase locationUseCase;

    @GetMapping
    public ResponseEntity<PageResponse<LocationHistoryResponse>> history(
            @PathVariable UUID deviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to,
            Pageable pageable) {
        return ResponseEntity.ok(locationUseCase.history(deviceId, from, to, pageable));
    }

    @GetMapping("/latest")
    public ResponseEntity<LocationHistoryResponse> latest(@PathVariable UUID deviceId) {
        return ResponseEntity.ok(locationUseCase.latest(deviceId));
    }
}
