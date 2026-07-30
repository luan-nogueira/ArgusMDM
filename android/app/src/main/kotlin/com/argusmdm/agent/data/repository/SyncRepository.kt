package com.argusmdm.agent.data.repository

import com.argusmdm.agent.data.local.prefs.ArgusPreferences
import com.argusmdm.agent.data.local.prefs.CredentialsCache
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SyncRepository @Inject constructor(
    private val credentialsCache: CredentialsCache,
    private val locationRepository: LocationRepository,
    private val inventoryRepository: InventoryRepository,
    private val policyRepository: PolicyRepository,
    private val preferences: ArgusPreferences,
) {

    /**
     * Executa uma rodada completa de sincronização. Cada etapa é isolada para que
     * uma falha (ex: sem conexão) não impeça as demais de tentar; a política mais
     * recente ainda é buscada mesmo se o envio de apps falhar, por exemplo.
     */
    suspend fun syncNow(): SyncResult {
        if (!credentialsCache.isProvisioned) {
            return SyncResult(success = false, message = "Dispositivo não vinculado")
        }

        var locationsSent = 0
        var appsOk = false
        var metricsOk = false

        runCatching { locationsSent = locationRepository.flushPending() }
            .onFailure { Timber.w(it, "Falha ao enviar localizações pendentes") }

        runCatching { inventoryRepository.syncInstalledApps(); appsOk = true }
            .onFailure { Timber.w(it, "Falha ao sincronizar apps instalados") }

        runCatching { inventoryRepository.syncMetrics(); metricsOk = true }
            .onFailure { Timber.w(it, "Falha ao sincronizar métricas") }

        val policy = runCatching { policyRepository.fetchAndApply() }
            .onFailure { Timber.w(it, "Falha ao buscar política") }
            .getOrNull()

        val anySuccess = appsOk || metricsOk || locationsSent > 0
        if (anySuccess) {
            preferences.updateLastSyncAt(System.currentTimeMillis())
        }

        return SyncResult(
            success = anySuccess,
            message = if (anySuccess) "Sincronização concluída" else "Falha na sincronização (sem conexão?)",
            locationsSent = locationsSent,
            policyName = policy?.name,
        )
    }
}

data class SyncResult(
    val success: Boolean,
    val message: String,
    val locationsSent: Int = 0,
    val policyName: String? = null,
)
