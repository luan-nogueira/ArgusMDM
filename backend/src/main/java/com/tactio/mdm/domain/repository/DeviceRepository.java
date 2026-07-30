package com.tactio.mdm.domain.repository;

import com.tactio.mdm.domain.entity.Device;
import com.tactio.mdm.domain.enums.DeviceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeviceRepository extends JpaRepository<Device, UUID>, JpaSpecificationExecutor<Device> {

    Optional<Device> findByImei(String imei);

    Optional<Device> findBySerialNumber(String serialNumber);

    long countByStatus(DeviceStatus status);

    List<Device> findByStatusAndLastSyncAtBefore(DeviceStatus status, Instant threshold);
}
