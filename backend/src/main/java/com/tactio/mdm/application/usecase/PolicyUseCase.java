package com.tactio.mdm.application.usecase;

import com.tactio.mdm.api.exception.BadRequestException;
import com.tactio.mdm.api.exception.ResourceNotFoundException;
import com.tactio.mdm.application.dto.policy.PolicyAssignmentRequest;
import com.tactio.mdm.application.dto.policy.PolicyAssignmentResponse;
import com.tactio.mdm.application.dto.policy.PolicyRequest;
import com.tactio.mdm.application.dto.policy.PolicyResponse;
import com.tactio.mdm.application.mapper.PolicyMapper;
import com.tactio.mdm.domain.entity.Device;
import com.tactio.mdm.domain.entity.Policy;
import com.tactio.mdm.domain.entity.PolicyAssignment;
import com.tactio.mdm.domain.repository.DepartmentRepository;
import com.tactio.mdm.domain.repository.DeviceRepository;
import com.tactio.mdm.domain.repository.PolicyAssignmentRepository;
import com.tactio.mdm.domain.repository.PolicyRepository;
import com.tactio.mdm.domain.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PolicyUseCase {

    private final PolicyRepository policyRepository;
    private final PolicyAssignmentRepository policyAssignmentRepository;
    private final DeviceRepository deviceRepository;
    private final DepartmentRepository departmentRepository;
    private final TagRepository tagRepository;

    @Transactional(readOnly = true)
    public List<PolicyResponse> list() {
        return policyRepository.findAll().stream().map(PolicyMapper::toResponse).toList();
    }

    @Transactional
    public PolicyResponse create(PolicyRequest request) {
        Policy policy = new Policy();
        applyRequest(policy, request);
        policyRepository.save(policy);
        return PolicyMapper.toResponse(policy);
    }

    @Transactional
    public PolicyResponse update(UUID id, PolicyRequest request) {
        Policy policy = policyRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Política", id));
        applyRequest(policy, request);
        policyRepository.save(policy);
        return PolicyMapper.toResponse(policy);
    }

    @Transactional
    public void delete(UUID id) {
        if (!policyRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Política", id);
        }
        policyRepository.deleteById(id);
    }

    @Transactional
    public PolicyAssignmentResponse assign(PolicyAssignmentRequest request) {
        Policy policy = policyRepository.findById(request.policyId())
                .orElseThrow(() -> ResourceNotFoundException.of("Política", request.policyId()));

        PolicyAssignment assignment = new PolicyAssignment();
        assignment.setPolicy(policy);
        assignment.setTargetType(request.targetType());

        switch (request.targetType()) {
            case DEVICE -> assignment.setDevice(deviceRepository.findById(request.targetId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Dispositivo", request.targetId())));
            case DEPARTMENT -> assignment.setDepartment(departmentRepository.findById(request.targetId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Departamento", request.targetId())));
            case TAG -> assignment.setTag(tagRepository.findById(request.targetId())
                    .orElseThrow(() -> ResourceNotFoundException.of("Tag", request.targetId())));
            default -> throw new BadRequestException("Tipo de alvo inválido");
        }

        policyAssignmentRepository.save(assignment);
        return PolicyMapper.toResponse(assignment);
    }

    @Transactional
    public void unassign(UUID assignmentId) {
        if (!policyAssignmentRepository.existsById(assignmentId)) {
            throw ResourceNotFoundException.of("Atribuição de política", assignmentId);
        }
        policyAssignmentRepository.deleteById(assignmentId);
    }

    @Transactional(readOnly = true)
    public PolicyResponse effectivePolicyForDevice(UUID deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> ResourceNotFoundException.of("Dispositivo", deviceId));

        Optional<PolicyAssignment> deviceLevel = policyAssignmentRepository.findByDeviceId(deviceId).stream().findFirst();
        if (deviceLevel.isPresent()) {
            return PolicyMapper.toResponse(deviceLevel.get().getPolicy());
        }

        if (device.getDepartment() != null) {
            var departmentLevel = policyAssignmentRepository
                    .findByDepartmentId(device.getDepartment().getId()).stream().findFirst();
            if (departmentLevel.isPresent()) {
                return PolicyMapper.toResponse(departmentLevel.get().getPolicy());
            }
        }

        for (var tag : device.getTags()) {
            var tagLevel = policyAssignmentRepository.findByTag_Id(tag.getId()).stream().findFirst();
            if (tagLevel.isPresent()) {
                return PolicyMapper.toResponse(tagLevel.get().getPolicy());
            }
        }

        return null;
    }

    private void applyRequest(Policy policy, PolicyRequest request) {
        policy.setName(request.name());
        policy.setDescription(request.description());
        policy.setPasswordRequired(request.passwordRequired());
        policy.setMinPasswordLength(request.minPasswordLength());
        policy.setMaxInactivityLockMs(request.maxInactivityLockMs());
        policy.setUpdatePolicy(request.updatePolicy());
        policy.setCameraDisabled(request.cameraDisabled());
        policy.setScreenCaptureDisabled(request.screenCaptureDisabled());
        policy.setFactoryResetDisabled(request.factoryResetDisabled());
        policy.setInstallAppsDisabled(request.installAppsDisabled());
        policy.setUsbFileTransferDisabled(request.usbFileTransferDisabled());
        policy.setRestrictionsJson(request.restrictionsJson());
        policy.setActive(request.active());
    }
}
