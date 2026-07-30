package com.argusmdm.agent.ui.dashboard

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.argusmdm.agent.data.local.prefs.ArgusPreferences
import com.argusmdm.agent.data.remote.dto.PolicyResponse
import com.argusmdm.agent.data.repository.PolicyRepository
import com.argusmdm.agent.data.repository.SyncRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DashboardUiState(
    val lastSyncAtEpochMillis: Long? = null,
    val isSyncing: Boolean = false,
    val policy: PolicyResponse? = null,
    val statusMessage: String? = null,
)

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val preferences: ArgusPreferences,
    private val syncRepository: SyncRepository,
    private val policyRepository: PolicyRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            preferences.lastSyncAtFlow.collect { value ->
                _uiState.update { it.copy(lastSyncAtEpochMillis = value) }
            }
        }
        refreshPolicy()
    }

    fun syncNow() {
        viewModelScope.launch {
            _uiState.update { it.copy(isSyncing = true, statusMessage = null) }
            val result = syncRepository.syncNow()
            _uiState.update { it.copy(isSyncing = false, statusMessage = result.message) }
            refreshPolicy()
        }
    }

    private fun refreshPolicy() {
        viewModelScope.launch {
            val policy = policyRepository.fetchAndApply()
            _uiState.update { it.copy(policy = policy) }
        }
    }

    suspend fun unlinkDevice() {
        preferences.clearCredentials()
    }
}
