package com.tactio.mdm.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "installed_apps", uniqueConstraints = {
        @UniqueConstraint(name = "uk_device_package", columnNames = {"device_id", "package_name"})
})
public class InstalledApp extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @Column(name = "package_name", nullable = false, length = 200)
    private String packageName;

    @Column(name = "app_name", length = 200)
    private String appName;

    @Column(name = "version_name", length = 60)
    private String versionName;

    @Column(name = "version_code")
    private Long versionCode;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(nullable = false)
    private boolean systemApp = false;
}
