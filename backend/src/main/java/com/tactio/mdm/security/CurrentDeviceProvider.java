package com.tactio.mdm.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CurrentDeviceProvider {

    public UUID requireCurrentDeviceId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UUID deviceId)) {
            throw new IllegalStateException("Nenhum dispositivo autenticado no contexto de segurança");
        }
        return deviceId;
    }
}
