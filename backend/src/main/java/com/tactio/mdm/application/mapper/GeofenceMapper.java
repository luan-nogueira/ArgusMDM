package com.tactio.mdm.application.mapper;

import com.tactio.mdm.application.dto.geofence.GeofenceEventResponse;
import com.tactio.mdm.application.dto.geofence.GeofenceResponse;
import com.tactio.mdm.domain.entity.Device;
import com.tactio.mdm.domain.entity.Geofence;
import com.tactio.mdm.domain.entity.GeofenceEvent;

import java.util.stream.Collectors;

public final class GeofenceMapper {

    private GeofenceMapper() {
    }

    public static GeofenceResponse toResponse(Geofence geofence) {
        if (geofence == null) {
            return null;
        }
        return new GeofenceResponse(
                geofence.getId(),
                geofence.getName(),
                geofence.getCenterLatitude(),
                geofence.getCenterLongitude(),
                geofence.getRadiusMeters(),
                geofence.isActive(),
                geofence.getDevices().stream().map(Device::getId).collect(Collectors.toSet())
        );
    }

    public static GeofenceEventResponse toResponse(GeofenceEvent event) {
        if (event == null) {
            return null;
        }
        return new GeofenceEventResponse(
                event.getId(),
                event.getGeofence().getId(),
                event.getGeofence().getName(),
                event.getDevice().getId(),
                event.getDevice().getName(),
                event.getType(),
                event.getOccurredAt()
        );
    }
}
