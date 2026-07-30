package com.tactio.mdm.domain.repository.spec;

import com.tactio.mdm.domain.entity.AuditLog;
import com.tactio.mdm.domain.enums.AuditAction;
import org.springframework.data.jpa.domain.Specification;

import java.time.Instant;
import java.util.UUID;

public final class AuditLogSpecifications {

    private AuditLogSpecifications() {
    }

    public static Specification<AuditLog> actionEquals(AuditAction action) {
        return (root, query, cb) -> action == null ? null : cb.equal(root.get("action"), action);
    }

    public static Specification<AuditLog> entityTypeEquals(String entityType) {
        return (root, query, cb) -> entityType == null || entityType.isBlank()
                ? null
                : cb.equal(root.get("entityType"), entityType);
    }

    public static Specification<AuditLog> userEquals(UUID userId) {
        return (root, query, cb) -> userId == null ? null : cb.equal(root.get("user").get("id"), userId);
    }

    public static Specification<AuditLog> createdBetween(Instant from, Instant to) {
        return (root, query, cb) -> {
            if (from == null && to == null) {
                return null;
            }
            if (from != null && to != null) {
                return cb.between(root.get("createdAt"), from, to);
            }
            return from != null
                    ? cb.greaterThanOrEqualTo(root.get("createdAt"), from)
                    : cb.lessThanOrEqualTo(root.get("createdAt"), to);
        };
    }
}
