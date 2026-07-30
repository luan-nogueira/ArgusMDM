package com.argusmdm.agent.data.remote.dto

import kotlinx.serialization.Serializable

@Serializable
enum class UpdatePolicyType {
    AUTOMATIC,
    WINDOWED,
    POSTPONE,
}

@Serializable
data class PolicyResponse(
    val id: String,
    val name: String,
    val description: String? = null,
    val passwordRequired: Boolean,
    val minPasswordLength: Int,
    val maxInactivityLockMs: Long,
    val updatePolicy: UpdatePolicyType,
    val cameraDisabled: Boolean,
    val screenCaptureDisabled: Boolean,
    val factoryResetDisabled: Boolean,
    val installAppsDisabled: Boolean,
    val usbFileTransferDisabled: Boolean,
    val restrictionsJson: String? = null,
    val active: Boolean,
)
