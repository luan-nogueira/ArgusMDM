package com.tactio.mdm.application.dto.policy;

import com.tactio.mdm.domain.enums.PolicyTargetType;

import java.util.UUID;

public record PolicyAssignmentResponse(
        UUID id,
        UUID policyId,
        String policyName,
        PolicyTargetType targetType,
        UUID deviceId,
        UUID departmentId,
        UUID tagId
) {
}
