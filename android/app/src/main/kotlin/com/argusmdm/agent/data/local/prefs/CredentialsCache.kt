package com.argusmdm.agent.data.local.prefs

import com.argusmdm.agent.di.ApplicationScope
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Cópia em memória, sempre atualizada, das credenciais do dispositivo — necessária
 * porque o [okhttp3.Interceptor] que assina as requisições roda de forma síncrona e
 * não pode suspender para ler o DataStore diretamente.
 */
@Singleton
class CredentialsCache @Inject constructor(
    preferences: ArgusPreferences,
    @ApplicationScope scope: CoroutineScope,
) {
    private val _current = MutableStateFlow<DeviceCredentials?>(null)
    val current: StateFlow<DeviceCredentials?> = _current

    init {
        scope.launch {
            preferences.credentialsFlow.collect { _current.value = it }
        }
    }

    val isProvisioned: Boolean
        get() = _current.value != null
}
