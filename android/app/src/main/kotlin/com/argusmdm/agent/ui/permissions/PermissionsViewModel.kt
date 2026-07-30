package com.argusmdm.agent.ui.permissions

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import com.argusmdm.agent.util.PermissionUtils
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class PermissionsUiState(
    val foregroundLocationGranted: Boolean = false,
    val backgroundLocationGranted: Boolean = false,
    val notificationsGranted: Boolean = false,
    val usageAccessGranted: Boolean = false,
) {
    val canContinue: Boolean
        get() = foregroundLocationGranted && notificationsGranted
}

class PermissionsViewModel(application: Application) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(PermissionsUiState())
    val uiState: StateFlow<PermissionsUiState> = _uiState.asStateFlow()

    fun refresh() {
        val context = getApplication<Application>()
        _uiState.value = PermissionsUiState(
            foregroundLocationGranted = PermissionUtils.hasForegroundLocation(context),
            backgroundLocationGranted = PermissionUtils.hasBackgroundLocation(context),
            notificationsGranted = PermissionUtils.hasNotifications(context),
            usageAccessGranted = PermissionUtils.hasUsageAccess(context),
        )
    }
}
