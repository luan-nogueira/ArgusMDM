package com.tactio.mdm.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "mdm.admin")
public class AdminSeedProperties {

    private boolean seedEnabled;
    private String name;
    private String email;
    private String password;
}
