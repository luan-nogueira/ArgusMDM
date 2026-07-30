package com.tactio.mdm.application.usecase;

import com.tactio.mdm.application.dto.audit.AuditLogResponse;
import com.tactio.mdm.application.dto.common.PageResponse;
import com.tactio.mdm.application.mapper.AuditLogMapper;
import com.tactio.mdm.domain.enums.AuditAction;
import com.tactio.mdm.domain.repository.AuditLogRepository;
import com.tactio.mdm.domain.repository.spec.AuditLogSpecifications;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogUseCase {

    private final AuditLogRepository auditLogRepository;

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> list(AuditAction action, String entityType, UUID userId,
                                                Instant from, Instant to, Pageable pageable) {
        Specification<com.tactio.mdm.domain.entity.AuditLog> spec = Specification
                .where(AuditLogSpecifications.actionEquals(action))
                .and(AuditLogSpecifications.entityTypeEquals(entityType))
                .and(AuditLogSpecifications.userEquals(userId))
                .and(AuditLogSpecifications.createdBetween(from, to));

        return PageResponse.from(auditLogRepository.findAll(spec, pageable).map(AuditLogMapper::toResponse));
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponse> listForExport(AuditAction action, String entityType, UUID userId,
                                                 Instant from, Instant to) {
        Specification<com.tactio.mdm.domain.entity.AuditLog> spec = Specification
                .where(AuditLogSpecifications.actionEquals(action))
                .and(AuditLogSpecifications.entityTypeEquals(entityType))
                .and(AuditLogSpecifications.userEquals(userId))
                .and(AuditLogSpecifications.createdBetween(from, to));

        return auditLogRepository.findAll(spec).stream().map(AuditLogMapper::toResponse).toList();
    }
}
