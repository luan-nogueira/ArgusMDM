package com.tactio.mdm.domain.entity;

import com.tactio.mdm.domain.enums.UpdatePolicyType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "policies")
public class Policy extends BaseEntity {

    @Column(nullable = false, unique = true, length = 120)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private boolean passwordRequired = true;

    @Column(nullable = false)
    private int minPasswordLength = 6;

    @Column(nullable = false)
    private long maxInactivityLockMs = 60_000;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UpdatePolicyType updatePolicy = UpdatePolicyType.WINDOWED;

    @Column(nullable = false)
    private boolean cameraDisabled = false;

    @Column(nullable = false)
    private boolean screenCaptureDisabled = false;

    @Column(nullable = false)
    private boolean factoryResetDisabled = true;

    @Column(nullable = false)
    private boolean installAppsDisabled = false;

    @Column(nullable = false)
    private boolean usbFileTransferDisabled = false;

    @Column(columnDefinition = "TEXT")
    private String restrictionsJson;

    @Column(nullable = false)
    private boolean active = true;
}
