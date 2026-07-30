package com.tactio.mdm.application.mapper;

import com.tactio.mdm.application.dto.location.LocationHistoryResponse;
import com.tactio.mdm.domain.entity.LocationHistory;

public final class LocationMapper {

    private LocationMapper() {
    }

    public static LocationHistoryResponse toResponse(LocationHistory location) {
        if (location == null) {
            return null;
        }
        return new LocationHistoryResponse(
                location.getId(),
                location.getDevice().getId(),
                location.getDevice().getName(),
                location.getLatitude(),
                location.getLongitude(),
                location.getAccuracy(),
                location.getAltitude(),
                location.getSpeed(),
                location.getCapturedAt()
        );
    }
}
