package com.tactio.mdm.domain.repository;

import com.tactio.mdm.domain.entity.Geofence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface GeofenceRepository extends JpaRepository<Geofence, UUID> {

    List<Geofence> findByActiveTrue();

    List<Geofence> findByDevices_Id(UUID deviceId);
}
