package com.tactio.mdm.domain.repository;

import com.tactio.mdm.domain.entity.DeviceMetric;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DeviceMetricRepository extends JpaRepository<DeviceMetric, UUID> {

    Page<DeviceMetric> findByDeviceIdOrderByCapturedAtDesc(UUID deviceId, Pageable pageable);

    List<DeviceMetric> findTop1ByDeviceIdOrderByCapturedAtDesc(UUID deviceId);

    List<DeviceMetric> findByBatteryLevelLessThanEqual(int threshold);
}
