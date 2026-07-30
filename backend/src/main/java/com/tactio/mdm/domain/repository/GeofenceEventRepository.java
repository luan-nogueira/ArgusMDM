package com.tactio.mdm.domain.repository;

import com.tactio.mdm.domain.entity.GeofenceEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GeofenceEventRepository extends JpaRepository<GeofenceEvent, UUID> {

    Page<GeofenceEvent> findByDeviceIdOrderByOccurredAtDesc(UUID deviceId, Pageable pageable);

    List<GeofenceEvent> findTop1ByGeofenceIdAndDeviceIdOrderByOccurredAtDesc(UUID geofenceId, UUID deviceId);
}
