package com.tactio.mdm.application.mapper;

import com.tactio.mdm.application.dto.alert.AlertResponse;
import com.tactio.mdm.domain.entity.Alert;

public final class AlertMapper {

    private AlertMapper() {
    }

    public static AlertResponse toResponse(Alert alert) {
        if (alert == null) {
            return null;
        }
        return new AlertResponse(
                alert.getId(),
                alert.getType(),
                alert.getDevice() != null ? alert.getDevice().getId() : null,
                alert.getDevice() != null ? alert.getDevice().getName() : null,
                alert.getMessage(),
                alert.isRead(),
                alert.getCreatedAt()
        );
    }
}
