package com.argusmdm.agent.data.local.prefs

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore by preferencesDataStore(name = "argus_prefs")

/**
 * Persistência local de credenciais do dispositivo e metadados de sincronização.
 * A chave de API é salva como veio do provisionamento (o backend só guarda o hash,
 * então não há como recuperá-la depois — perder este armazenamento exige reprovisionar).
 */
@Singleton
class ArgusPreferences @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private object Keys {
        val DEVICE_ID = stringPreferencesKey("device_id")
        val API_KEY = stringPreferencesKey("api_key")
        val LAST_SYNC_AT = longPreferencesKey("last_sync_at")
    }

    val credentialsFlow: Flow<DeviceCredentials?> = context.dataStore.data.map { prefs ->
        val deviceId = prefs[Keys.DEVICE_ID]
        val apiKey = prefs[Keys.API_KEY]
        if (deviceId != null && apiKey != null) DeviceCredentials(deviceId, apiKey) else null
    }

    val lastSyncAtFlow: Flow<Long?> = context.dataStore.data.map { prefs -> prefs[Keys.LAST_SYNC_AT] }

    suspend fun saveCredentials(deviceId: String, apiKey: String) {
        context.dataStore.edit { prefs ->
            prefs[Keys.DEVICE_ID] = deviceId
            prefs[Keys.API_KEY] = apiKey
        }
    }

    suspend fun clearCredentials() {
        context.dataStore.edit { prefs ->
            prefs.remove(Keys.DEVICE_ID)
            prefs.remove(Keys.API_KEY)
            prefs.remove(Keys.LAST_SYNC_AT)
        }
    }

    suspend fun updateLastSyncAt(epochMillis: Long) {
        context.dataStore.edit { prefs -> prefs[Keys.LAST_SYNC_AT] = epochMillis }
    }
}
