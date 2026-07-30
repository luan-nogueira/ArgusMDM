package com.tactio.mdm.application.dto.inventory;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record InstalledAppSyncRequest(
        @NotNull @Valid List<AppEntry> apps
) {
    public record AppEntry(
            @NotBlank String packageName,
            String appName,
            String versionName,
            Long versionCode,
            Long sizeBytes,
            boolean systemApp
    ) {
    }
}
