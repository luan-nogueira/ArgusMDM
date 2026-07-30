package com.tactio.mdm.application.dto.audit;

import com.tactio.mdm.domain.enums.AuditAction;

import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(
        UUID id,
        UUID userId,
        String userName,
        AuditAction action,
        String entityType,
        String entityId,
        String details,
        String ipAddress,
        Instant createdAt
) {
}
