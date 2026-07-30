package com.argusmdm.agent.data.repository

import com.argusmdm.agent.data.local.dao.PendingLocationDao
import com.argusmdm.agent.data.local.entity.PendingLocationEntity
import com.argusmdm.agent.data.remote.api.ArgusSyncApi
import com.argusmdm.agent.data.remote.dto.LocationPingRequest
import timber.log.Timber
import java.time.Instant
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LocationRepository @Inject constructor(
    private val api: ArgusSyncApi,
    private val dao: PendingLocationDao,
) {

    suspend fun enqueue(
        latitude: Double,
        longitude: Double,
        accuracy: Float?,
        altitude: Double?,
        speed: Float?,
        capturedAtEpochMillis: Long = System.currentTimeMillis(),
    ) {
        dao.insert(
            PendingLocationEntity(
                latitude = latitude,
                longitude = longitude,
                accuracy = accuracy,
                altitude = altitude,
                speed = speed,
                capturedAtEpochMillis = capturedAtEpochMillis,
            ),
        )
    }

    /**
     * Envia localizações pendentes em ordem cronológica. Para no primeiro erro de rede
     * para preservar a ordem e evitar bater na API repetidamente enquanto o dispositivo
     * está offline; a próxima execução do worker retoma de onde parou.
     */
    suspend fun flushPending(batchSize: Int = 50): Int {
        var sent = 0
        val batch = dao.oldest(batchSize)
        for (pending in batch) {
            val request = LocationPingRequest(
                latitude = pending.latitude,
                longitude = pending.longitude,
                accuracy = pending.accuracy?.toDouble(),
                altitude = pending.altitude,
                speed = pending.speed?.toDouble(),
                capturedAt = Instant.ofEpochMilli(pending.capturedAtEpochMillis).toString(),
            )
            try {
                api.pingLocation(request)
                dao.delete(pending)
                sent++
            } catch (e: Exception) {
                Timber.w(e, "Falha ao sincronizar localização pendente; tentando novamente depois")
                break
            }
        }
        return sent
    }

    suspend fun pendingCount(): Int = dao.count()
}
