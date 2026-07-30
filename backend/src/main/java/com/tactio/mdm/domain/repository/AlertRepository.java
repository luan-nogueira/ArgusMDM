package com.tactio.mdm.domain.repository;

import com.tactio.mdm.domain.entity.Alert;
import com.tactio.mdm.domain.enums.AlertType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AlertRepository extends JpaRepository<Alert, UUID> {

    Page<Alert> findByReadFalseOrderByCreatedAtDesc(Pageable pageable);

    Page<Alert> findAllByOrderByCreatedAtDesc(Pageable pageable);

    boolean existsByDeviceIdAndTypeAndReadFalse(UUID deviceId, AlertType type);

    long countByReadFalse();
}
