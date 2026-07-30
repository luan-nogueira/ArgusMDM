package com.tactio.mdm.application.usecase;

import com.tactio.mdm.api.exception.ResourceNotFoundException;
import com.tactio.mdm.application.dto.common.PageResponse;
import com.tactio.mdm.application.dto.geofence.GeofenceEventResponse;
import com.tactio.mdm.application.dto.geofence.GeofenceRequest;
import com.tactio.mdm.application.dto.geofence.GeofenceResponse;
import com.tactio.mdm.application.mapper.GeofenceMapper;
import com.tactio.mdm.domain.entity.Device;
import com.tactio.mdm.domain.entity.Geofence;
import com.tactio.mdm.domain.entity.GeofenceEvent;
import com.tactio.mdm.domain.enums.AlertType;
import com.tactio.mdm.domain.enums.GeofenceEventType;
import com.tactio.mdm.domain.repository.DeviceRepository;
import com.tactio.mdm.domain.repository.GeofenceEventRepository;
import com.tactio.mdm.domain.repository.GeofenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GeofenceUseCase {

    private static final double EARTH_RADIUS_METERS = 6_371_000;

    private final GeofenceRepository geofenceRepository;
    private final GeofenceEventRepository geofenceEventRepository;
    private final DeviceRepository deviceRepository;
    private final AlertUseCase alertUseCase;

    @Transactional(readOnly = true)
    public List<GeofenceResponse> list() {
        return geofenceRepository.findAll().stream().map(GeofenceMapper::toResponse).toList();
    }

    @Transactional
    public GeofenceResponse create(GeofenceRequest request) {
        Geofence geofence = new Geofence();
        applyRequest(geofence, request);
        geofenceRepository.save(geofence);
        return GeofenceMapper.toResponse(geofence);
    }

    @Transactional
    public GeofenceResponse update(UUID id, GeofenceRequest request) {
        Geofence geofence = geofenceRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Geofence", id));
        applyRequest(geofence, request);
        geofenceRepository.save(geofence);
        return GeofenceMapper.toResponse(geofence);
    }

    @Transactional
    public void delete(UUID id) {
        if (!geofenceRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Geofence", id);
        }
        geofenceRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public PageResponse<GeofenceEventResponse> events(UUID deviceId, Pageable pageable) {
        var page = geofenceEventRepository.findByDeviceIdOrderByOccurredAtDesc(deviceId, pageable)
                .map(GeofenceMapper::toResponse);
        return PageResponse.from(page);
    }

    @Transactional
    public void evaluateDeviceLocation(Device device, double latitude, double longitude) {
        for (Geofence geofence : geofenceRepository.findByDevices_Id(device.getId())) {
            if (!geofence.isActive()) {
                continue;
            }
            boolean isInside = distanceMeters(
                    latitude, longitude, geofence.getCenterLatitude(), geofence.getCenterLongitude()
            ) <= geofence.getRadiusMeters();

            var lastEvents = geofenceEventRepository
                    .findTop1ByGeofenceIdAndDeviceIdOrderByOccurredAtDesc(geofence.getId(), device.getId());
            boolean wasInside = !lastEvents.isEmpty() && lastEvents.get(0).getType() == GeofenceEventType.ENTER;

            if (isInside != wasInside) {
                GeofenceEvent event = new GeofenceEvent();
                event.setGeofence(geofence);
                event.setDevice(device);
                event.setType(isInside ? GeofenceEventType.ENTER : GeofenceEventType.EXIT);
                event.setOccurredAt(Instant.now());
                geofenceEventRepository.save(event);

                String action = isInside ? "entrou em" : "saiu de";
                alertUseCase.raise(AlertType.GEOFENCE_BREACH, device,
                        device.getName() + " " + action + " a área \"" + geofence.getName() + "\"");
            }
        }
    }

    private void applyRequest(Geofence geofence, GeofenceRequest request) {
        geofence.setName(request.name());
        geofence.setCenterLatitude(request.centerLatitude());
        geofence.setCenterLongitude(request.centerLongitude());
        geofence.setRadiusMeters(request.radiusMeters());
        geofence.setActive(request.active());
        if (request.deviceIds() != null) {
            Set<Device> devices = new HashSet<>(deviceRepository.findAllById(request.deviceIds()));
            geofence.setDevices(devices);
        }
    }

    private double distanceMeters(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS_METERS * c;
    }
}
