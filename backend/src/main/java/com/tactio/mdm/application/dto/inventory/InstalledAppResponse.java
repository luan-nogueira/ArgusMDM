package com.tactio.mdm.application.dto.inventory;

import java.util.UUID;

public record InstalledAppResponse(
        UUID id,
        String packageName,
        String appName,
        String versionName,
        Long versionCode,
        Long sizeBytes,
        boolean systemApp
) {
}
