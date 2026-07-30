package com.tactio.mdm.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "device_metrics", indexes = {
        @Index(name = "idx_metric_device_captured", columnList = "device_id, captured_at")
})
public class DeviceMetric extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    private Integer batteryLevel;

    private Boolean charging;

    private Long storageUsedBytes;

    private Long storageTotalBytes;

    private Long memoryUsedBytes;

    private Long memoryTotalBytes;

    private Double cpuUsagePercent;

    private Boolean wifiConnected;

    private String wifiSsid;

    private Boolean bluetoothEnabled;

    private String networkOperator;

    @Column(name = "captured_at", nullable = false)
    private Instant capturedAt;
}
