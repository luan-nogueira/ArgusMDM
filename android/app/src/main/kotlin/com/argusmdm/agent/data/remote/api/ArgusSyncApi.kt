package com.argusmdm.agent.data.remote.api

import com.argusmdm.agent.data.remote.dto.DeviceMetricRequest
import com.argusmdm.agent.data.remote.dto.InstalledAppSyncRequest
import com.argusmdm.agent.data.remote.dto.LocationHistoryResponse
import com.argusmdm.agent.data.remote.dto.LocationPingRequest
import com.argusmdm.agent.data.remote.dto.PolicyResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

/**
 * Endpoints consumidos pelo dispositivo, autenticados via cabeçalhos
 * X-Device-Id / X-Device-Key (ver [com.argusmdm.agent.data.remote.AuthInterceptor]),
 * espelhando com.tactio.mdm.api.controller.DeviceSyncController no backend.
 */
interface ArgusSyncApi {

    @POST("api/v1/sync/location")
    suspend fun pingLocation(@Body body: LocationPingRequest): LocationHistoryResponse

    @POST("api/v1/sync/apps")
    suspend fun syncApps(@Body body: InstalledAppSyncRequest): Response<Unit>

    @POST("api/v1/sync/metrics")
    suspend fun syncMetrics(@Body body: DeviceMetricRequest): Response<Unit>

    @GET("api/v1/sync/policy")
    suspend fun getPolicy(): PolicyResponse?
}
