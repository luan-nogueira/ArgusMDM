package com.tactio.mdm.application.dto.device;

import java.util.UUID;

/**
 * Retornado apenas uma vez, na criação do dispositivo: a chave em texto puro
 * não é persistida (apenas seu hash), então não pode ser recuperada depois.
 */
public record DeviceProvisionResponse(
        UUID deviceId,
        String apiKey
) {
}
