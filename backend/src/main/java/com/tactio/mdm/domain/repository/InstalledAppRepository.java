package com.tactio.mdm.domain.repository;

import com.tactio.mdm.domain.entity.InstalledApp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InstalledAppRepository extends JpaRepository<InstalledApp, UUID> {

    List<InstalledApp> findByDeviceId(UUID deviceId);

    Optional<InstalledApp> findByDeviceIdAndPackageName(UUID deviceId, String packageName);

    @Modifying
    @Query("delete from InstalledApp a where a.device.id = :deviceId")
    void deleteAllByDeviceId(UUID deviceId);
}
