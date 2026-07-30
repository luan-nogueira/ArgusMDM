package com.tactio.mdm.scheduler;

import com.tactio.mdm.application.usecase.AlertUseCase;
import com.tactio.mdm.domain.entity.Device;
import com.tactio.mdm.domain.enums.AlertType;
import com.tactio.mdm.domain.enums.DeviceStatus;
import com.tactio.mdm.domain.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Detecta dispositivos que pararam de sincronizar (possível falha de conectividade,
 * bateria esgotada ou app removido) e os marca como OFFLINE, gerando um alerta.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DeviceHealthScheduler {

    private final DeviceRepository deviceRepository;
    private final AlertUseCase alertUseCase;

    @Value("${mdm.device.offline-threshold-minutes:15}")
    private int offlineThresholdMinutes;

    @Scheduled(fixedDelay = 5 * 60 * 1000, initialDelay = 60 * 1000)
    @Transactional
    public void detectOfflineDevices() {
        Instant threshold = Instant.now().minus(offlineThresholdMinutes, ChronoUnit.MINUTES);
        var staleDevices = deviceRepository.findByStatusAndLastSyncAtBefore(DeviceStatus.ONLINE, threshold);

        for (Device device : staleDevices) {
            device.setStatus(DeviceStatus.OFFLINE);
            deviceRepository.save(device);
            alertUseCase.raise(AlertType.DEVICE_OFFLINE, device,
                    device.getName() + " está offline há mais de " + offlineThresholdMinutes + " minutos");
        }

        if (!staleDevices.isEmpty()) {
            log.info("{} dispositivo(s) marcado(s) como offline", staleDevices.size());
        }
    }
}
