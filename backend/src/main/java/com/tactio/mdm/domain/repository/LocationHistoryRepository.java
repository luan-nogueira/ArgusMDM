package com.tactio.mdm.domain.repository;

import com.tactio.mdm.domain.entity.LocationHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface LocationHistoryRepository extends JpaRepository<LocationHistory, UUID> {

    Page<LocationHistory> findByDeviceIdAndCapturedAtBetweenOrderByCapturedAtDesc(
            UUID deviceId, Instant from, Instant to, Pageable pageable);

    List<LocationHistory> findTop1ByDeviceIdOrderByCapturedAtDesc(UUID deviceId);
}
