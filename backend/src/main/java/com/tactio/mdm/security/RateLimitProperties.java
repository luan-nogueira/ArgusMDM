package com.tactio.mdm.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "mdm.rate-limit.login")
public class RateLimitProperties {

    private int capacity = 10;
    private int refillTokens = 10;
    private int refillDurationSeconds = 60;
}
