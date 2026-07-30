package com.tactio.mdm.application.mapper;

import com.tactio.mdm.application.dto.device.DeviceResponse;
import com.tactio.mdm.domain.entity.Device;

import java.util.stream.Collectors;

public final class DeviceMapper {

    private DeviceMapper() {
    }

    public static DeviceResponse toResponse(Device device) {
        if (device == null) {
            return null;
        }
        return new DeviceResponse(
                device.getId(),
                device.getName(),
                device.getModel(),
                device.getManufacturer(),
                device.getAndroidVersion(),
                device.getImei(),
                device.getSerialNumber(),
                device.getStatus(),
                device.getLastSyncAt(),
                device.isDeviceOwnerActive(),
                OrgMapper.toResponse(device.getDepartment()),
                UserMapper.toResponse(device.getResponsibleUser()),
                device.getTags().stream().map(OrgMapper::toResponse).collect(Collectors.toSet()),
                device.getCreatedAt()
        );
    }
}
