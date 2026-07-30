package com.tactio.mdm.application.dto.policy;

import com.tactio.mdm.domain.enums.PolicyTargetType;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record PolicyAssignmentRequest(
        @NotNull UUID policyId,
        @NotNull PolicyTargetType targetType,
        @NotNull UUID targetId
) {
}
