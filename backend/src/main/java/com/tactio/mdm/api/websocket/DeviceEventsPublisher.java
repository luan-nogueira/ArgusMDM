package com.tactio.mdm.api.websocket;

import com.tactio.mdm.application.dto.alert.AlertResponse;
import com.tactio.mdm.application.dto.device.DeviceResponse;
import com.tactio.mdm.application.dto.location.LocationHistoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Publica eventos em tempo real para o painel web via STOMP/WebSocket (/ws).
 * Tópicos: /topic/locations, /topic/devices, /topic/alerts.
 */
@Component
@RequiredArgsConstructor
public class DeviceEventsPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishLocation(LocationHistoryResponse location) {
        messagingTemplate.convertAndSend("/topic/locations", location);
    }

    public void publishDeviceUpdate(DeviceResponse device) {
        messagingTemplate.convertAndSend("/topic/devices", device);
    }

    public void publishAlert(AlertResponse alert) {
        messagingTemplate.convertAndSend("/topic/alerts", alert);
    }
}
