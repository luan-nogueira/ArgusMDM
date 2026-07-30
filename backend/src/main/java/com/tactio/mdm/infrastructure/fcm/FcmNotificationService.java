package com.tactio.mdm.infrastructure.fcm;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Envio de push via FCM. Quando o Firebase não está configurado (mdm.firebase.enabled=false,
 * padrão em desenvolvimento), as chamadas viram no-op registrado em log em vez de falhar.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FcmNotificationService {

    private static final String ADMIN_TOPIC = "mdm-admins";

    private final ObjectProvider<FirebaseMessaging> firebaseMessagingProvider;

    public void sendToDevice(String fcmToken, String title, String body, Map<String, String> data) {
        FirebaseMessaging messaging = firebaseMessagingProvider.getIfAvailable();
        if (messaging == null || fcmToken == null || fcmToken.isBlank()) {
            log.debug("FCM desabilitado ou token ausente; push não enviado (título={})", title);
            return;
        }
        try {
            Message message = Message.builder()
                    .setToken(fcmToken)
                    .setNotification(Notification.builder().setTitle(title).setBody(body).build())
                    .putAllData(data == null ? Map.of() : data)
                    .build();
            messaging.send(message);
        } catch (FirebaseMessagingException e) {
            log.warn("Falha ao enviar push FCM para dispositivo: {}", e.getMessage());
        }
    }

    public void notifyAdmins(String title, String body) {
        FirebaseMessaging messaging = firebaseMessagingProvider.getIfAvailable();
        if (messaging == null) {
            log.debug("FCM desabilitado; alerta administrativo não enviado por push (título={})", title);
            return;
        }
        try {
            Message message = Message.builder()
                    .setTopic(ADMIN_TOPIC)
                    .setNotification(Notification.builder().setTitle(title).setBody(body).build())
                    .build();
            messaging.send(message);
        } catch (FirebaseMessagingException e) {
            log.warn("Falha ao enviar push FCM para administradores: {}", e.getMessage());
        }
    }
}
