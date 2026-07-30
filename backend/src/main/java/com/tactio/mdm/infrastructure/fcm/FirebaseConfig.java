package com.tactio.mdm.infrastructure.fcm;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.messaging.FirebaseMessaging;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

/**
 * Só é ativado quando mdm.firebase.enabled=true e um arquivo de credenciais de
 * service account válido é fornecido (ver docs/api.md sobre como gerar o seu).
 */
@Slf4j
@Configuration
@ConditionalOnProperty(prefix = "mdm.firebase", name = "enabled", havingValue = "true")
@RequiredArgsConstructor
public class FirebaseConfig {

    @Value("${mdm.firebase.credentials-path}")
    private String credentialsPath;

    @Bean
    public FirebaseMessaging firebaseMessaging() throws IOException {
        Resource resource = new DefaultResourceLoader().getResource(credentialsPath);
        try (InputStream serviceAccount = resource.getInputStream()) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount)
                            .createScoped(List.of("https://www.googleapis.com/auth/firebase.messaging")))
                    .build();
            FirebaseApp app = FirebaseApp.getApps().isEmpty()
                    ? FirebaseApp.initializeApp(options)
                    : FirebaseApp.getInstance();
            log.info("Firebase Admin SDK inicializado com sucesso");
            return FirebaseMessaging.getInstance(app);
        }
    }
}
