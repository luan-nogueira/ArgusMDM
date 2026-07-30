package com.argusmdm.agent.ui.provisioning

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.argusmdm.agent.data.local.prefs.ArgusPreferences
import com.argusmdm.agent.data.repository.SyncRepository
import com.argusmdm.agent.service.SyncScheduler
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProvisioningUiState(
    val deviceId: String = "",
    val apiKey: String = "",
    val isSubmitting: Boolean = false,
    val errorMessage: String? = null,
    val success: Boolean = false,
)

@HiltViewModel
class ProvisioningViewModel @Inject constructor(
    private val preferences: ArgusPreferences,
    private val syncRepository: SyncRepository,
    private val syncScheduler: SyncScheduler,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProvisioningUiState())
    val uiState: StateFlow<ProvisioningUiState> = _uiState.asStateFlow()

    fun onDeviceIdChange(value: String) = _uiState.update { it.copy(deviceId = value, errorMessage = null) }

    fun onApiKeyChange(value: String) = _uiState.update { it.copy(apiKey = value, errorMessage = null) }

    fun onQrCodeScanned(deviceId: String, apiKey: String) {
        _uiState.update { it.copy(deviceId = deviceId, apiKey = apiKey, errorMessage = null) }
        confirm()
    }

    fun confirm() {
        val state = _uiState.value
        if (state.deviceId.isBlank() || state.apiKey.isBlank()) {
            _uiState.update { it.copy(errorMessage = "Informe o ID do dispositivo e a chave de API") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true, errorMessage = null) }
            preferences.saveCredentials(state.deviceId.trim(), state.apiKey.trim())

            val result = syncRepository.syncNow()
            if (result.success) {
                syncScheduler.ensureScheduled()
                _uiState.update { it.copy(isSubmitting = false, success = true) }
            } else {
                preferences.clearCredentials()
                _uiState.update {
                    it.copy(
                        isSubmitting = false,
                        errorMessage = "Não foi possível confirmar o vínculo. Verifique os dados e a conexão.",
                    )
                }
            }
        }
    }
}
