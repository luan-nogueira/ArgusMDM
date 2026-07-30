package com.tactio.mdm.domain.repository.spec;

import com.tactio.mdm.domain.entity.Device;
import com.tactio.mdm.domain.entity.Tag;
import com.tactio.mdm.domain.enums.DeviceStatus;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public final class DeviceSpecifications {

    private DeviceSpecifications() {
    }

    public static Specification<Device> statusEquals(DeviceStatus status) {
        return (root, query, cb) -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Device> departmentEquals(UUID departmentId) {
        return (root, query, cb) -> departmentId == null
                ? null
                : cb.equal(root.get("department").get("id"), departmentId);
    }

    public static Specification<Device> tagEquals(UUID tagId) {
        return (root, query, cb) -> {
            if (tagId == null) {
                return null;
            }
            Join<Device, Tag> tags = root.join("tags");
            return cb.equal(tags.get("id"), tagId);
        };
    }

    public static Specification<Device> searchTerm(String term) {
        return (root, query, cb) -> {
            if (term == null || term.isBlank()) {
                return null;
            }
            String like = "%" + term.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(cb.coalesce(root.get("model"), "")), like),
                    cb.like(cb.lower(cb.coalesce(root.get("serialNumber"), "")), like),
                    cb.like(cb.lower(cb.coalesce(root.get("imei"), "")), like)
            );
        };
    }
}
