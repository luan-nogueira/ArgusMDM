package com.argusmdm.agent.data.remote.dto

import kotlinx.serialization.Serializable

@Serializable
data class InstalledAppSyncRequest(
    val apps: List<AppEntry>,
) {
    @Serializable
    data class AppEntry(
        val packageName: String,
        val appName: String? = null,
        val versionName: String? = null,
        val versionCode: Long? = null,
        val sizeBytes: Long? = null,
        val systemApp: Boolean = false,
    )
}

@Serializable
data class DeviceMetricRequest(
    val batteryLevel: Int? = null,
    val charging: Boolean? = null,
    val storageUsedBytes: Long? = null,
    val storageTotalBytes: Long? = null,
    val memoryUsedBytes: Long? = null,
    val memoryTotalBytes: Long? = null,
    val cpuUsagePercent: Double? = null,
    val wifiConnected: Boolean? = null,
    val wifiSsid: String? = null,
    val bluetoothEnabled: Boolean? = null,
    val networkOperator: String? = null,
    val capturedAt: String,
)
