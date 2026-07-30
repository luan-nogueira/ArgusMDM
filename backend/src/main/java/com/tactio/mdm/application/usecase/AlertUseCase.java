package com.tactio.mdm.application.usecase;

import com.tactio.mdm.api.exception.ResourceNotFoundException;
import com.tactio.mdm.api.websocket.DeviceEventsPublisher;
import com.tactio.mdm.application.dto.alert.AlertResponse;
import com.tactio.mdm.application.dto.common.PageResponse;
import com.tactio.mdm.application.mapper.AlertMapper;
import com.tactio.mdm.domain.entity.Alert;
import com.tactio.mdm.domain.entity.Device;
import com.tactio.mdm.domain.enums.AlertType;
import com.tactio.mdm.domain.repository.AlertRepository;
import com.tactio.mdm.infrastructure.fcm.FcmNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AlertUseCase {

    private final AlertRepository alertRepository;
    private final FcmNotificationService fcmNotificationService;
    private final DeviceEventsPublisher deviceEventsPublisher;

    @Transactional
    public Alert raise(AlertType type, Device device, String message) {
        if (device != null && alertRepository.existsByDeviceIdAndTypeAndReadFalse(device.getId(), type)) {
            return null;
        }
        Alert alert = new Alert();
        alert.setType(type);
        alert.setDevice(device);
        alert.setMessage(message);
        alert.setRead(false);
        alertRepository.save(alert);

        fcmNotificationService.notifyAdmins("Alerta MDM: " + type.name(), message);
        deviceEventsPublisher.publishAlert(AlertMapper.toResponse(alert));

        return alert;
    }

    @Transactional(readOnly = true)
    public PageResponse<AlertResponse> list(boolean onlyUnread, Pageable pageable) {
        var page = onlyUnread
                ? alertRepository.findByReadFalseOrderByCreatedAtDesc(pageable)
                : alertRepository.findAllByOrderByCreatedAtDesc(pageable);
        return PageResponse.from(page.map(AlertMapper::toResponse));
    }

    @Transactional
    public void markRead(UUID id) {
        Alert alert = alertRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Alerta", id));
        alert.setRead(true);
        alertRepository.save(alert);
    }
}
