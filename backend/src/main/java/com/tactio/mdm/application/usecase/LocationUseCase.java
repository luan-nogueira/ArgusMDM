package com.tactio.mdm.application.usecase;

import com.tactio.mdm.api.exception.ResourceNotFoundException;
import com.tactio.mdm.api.websocket.DeviceEventsPublisher;
import com.tactio.mdm.application.dto.common.PageResponse;
import com.tactio.mdm.application.dto.location.LocationHistoryResponse;
import com.tactio.mdm.application.dto.location.LocationPingRequest;
import com.tactio.mdm.application.mapper.LocationMapper;
import com.tactio.mdm.domain.entity.Device;
import com.tactio.mdm.domain.entity.LocationHistory;
import com.tactio.mdm.domain.repository.DeviceRepository;
import com.tactio.mdm.domain.repository.LocationHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LocationUseCase {

    private final LocationHistoryRepository locationHistoryRepository;
    private final DeviceRepository deviceRepository;
    private final DeviceUseCase deviceUseCase;
    private final GeofenceUseCase geofenceUseCase;
    private final DeviceEventsPublisher deviceEventsPublisher;

    @Transactional
    public LocationHistoryResponse recordPing(UUID deviceId, LocationPingRequest request) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> ResourceNotFoundException.of("Dispositivo", deviceId));

        LocationHistory location = new LocationHistory();
        location.setDevice(device);
        location.setLatitude(request.latitude());
        location.setLongitude(request.longitude());
        location.setAccuracy(request.accuracy());
        location.setAltitude(request.altitude());
        location.setSpeed(request.speed());
        location.setCapturedAt(request.capturedAt());
        locationHistoryRepository.save(location);

        deviceUseCase.markSynced(deviceId);
        geofenceUseCase.evaluateDeviceLocation(device, request.latitude(), request.longitude());

        LocationHistoryResponse response = LocationMapper.toResponse(location);
        deviceEventsPublisher.publishLocation(response);
        return response;
    }

    @Transactional(readOnly = true)
    public PageResponse<LocationHistoryResponse> history(UUID deviceId, Instant from, Instant to, Pageable pageable) {
        var page = locationHistoryRepository
                .findByDeviceIdAndCapturedAtBetweenOrderByCapturedAtDesc(deviceId, from, to, pageable)
                .map(LocationMapper::toResponse);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public LocationHistoryResponse latest(UUID deviceId) {
        return locationHistoryRepository.findTop1ByDeviceIdOrderByCapturedAtDesc(deviceId).stream()
                .findFirst()
                .map(LocationMapper::toResponse)
                .orElse(null);
    }
}
