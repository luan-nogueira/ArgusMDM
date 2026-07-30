package com.tactio.mdm.application.mapper;

import com.tactio.mdm.application.dto.policy.PolicyAssignmentResponse;
import com.tactio.mdm.application.dto.policy.PolicyResponse;
import com.tactio.mdm.domain.entity.Policy;
import com.tactio.mdm.domain.entity.PolicyAssignment;

public final class PolicyMapper {

    private PolicyMapper() {
    }

    public static PolicyResponse toResponse(Policy policy) {
        if (policy == null) {
            return null;
        }
        return new PolicyResponse(
                policy.getId(),
                policy.getName(),
                policy.getDescription(),
                policy.isPasswordRequired(),
                policy.getMinPasswordLength(),
                policy.getMaxInactivityLockMs(),
                policy.getUpdatePolicy(),
                policy.isCameraDisabled(),
                policy.isScreenCaptureDisabled(),
                policy.isFactoryResetDisabled(),
                policy.isInstallAppsDisabled(),
                policy.isUsbFileTransferDisabled(),
                policy.getRestrictionsJson(),
                policy.isActive()
        );
    }

    public static PolicyAssignmentResponse toResponse(PolicyAssignment assignment) {
        if (assignment == null) {
            return null;
        }
        return new PolicyAssignmentResponse(
                assignment.getId(),
                assignment.getPolicy().getId(),
                assignment.getPolicy().getName(),
                assignment.getTargetType(),
                assignment.getDevice() != null ? assignment.getDevice().getId() : null,
                assignment.getDepartment() != null ? assignment.getDepartment().getId() : null,
                assignment.getTag() != null ? assignment.getTag().getId() : null
        );
    }
}
