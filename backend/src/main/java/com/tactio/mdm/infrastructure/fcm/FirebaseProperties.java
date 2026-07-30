package com.tactio.mdm.infrastructure.fcm;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "mdm.firebase")
public class FirebaseProperties {

    private String credentialsPath;
    private boolean enabled;
}
