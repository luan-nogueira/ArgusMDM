package com.argusmdm.agent.data.remote.dto

import kotlinx.serialization.Serializable

@Serializable
data class LocationPingRequest(
    val latitude: Double,
    val longitude: Double,
    val accuracy: Double? = null,
    val altitude: Double? = null,
    val speed: Double? = null,
    val capturedAt: String,
)

@Serializable
data class LocationHistoryResponse(
    val id: String,
    val deviceId: String,
    val deviceName: String,
    val latitude: Double,
    val longitude: Double,
    val accuracy: Double? = null,
    val altitude: Double? = null,
    val speed: Double? = null,
    val capturedAt: String,
)
