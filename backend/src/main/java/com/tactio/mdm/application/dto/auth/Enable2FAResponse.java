package com.tactio.mdm.application.dto.auth;

public record Enable2FAResponse(
        String secret,
        String qrCodeImageBase64
) {
}
