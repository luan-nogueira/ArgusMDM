package com.tactio.mdm.api.controller;

import com.tactio.mdm.application.dto.policy.PolicyAssignmentRequest;
import com.tactio.mdm.application.dto.policy.PolicyAssignmentResponse;
import com.tactio.mdm.application.dto.policy.PolicyRequest;
import com.tactio.mdm.application.dto.policy.PolicyResponse;
import com.tactio.mdm.application.usecase.PolicyUseCase;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Políticas")
@RestController
@RequestMapping("/api/v1/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyUseCase policyUseCase;

    @GetMapping
    public ResponseEntity<List<PolicyResponse>> list() {
        return ResponseEntity.ok(policyUseCase.list());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR')")
    public ResponseEntity<PolicyResponse> create(@Valid @RequestBody PolicyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(policyUseCase.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR')")
    public ResponseEntity<PolicyResponse> update(@PathVariable UUID id, @Valid @RequestBody PolicyRequest request) {
        return ResponseEntity.ok(policyUseCase.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        policyUseCase.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/assignments")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR')")
    public ResponseEntity<PolicyAssignmentResponse> assign(@Valid @RequestBody PolicyAssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(policyUseCase.assign(request));
    }

    @DeleteMapping("/assignments/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERVISOR')")
    public ResponseEntity<Void> unassign(@PathVariable UUID id) {
        policyUseCase.unassign(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/effective/{deviceId}")
    public ResponseEntity<PolicyResponse> effectiveForDevice(@PathVariable UUID deviceId) {
        return ResponseEntity.ok(policyUseCase.effectivePolicyForDevice(deviceId));
    }
}
