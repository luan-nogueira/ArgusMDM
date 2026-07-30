package com.argusmdm.agent.ui.navigation

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.argusmdm.agent.data.local.prefs.ArgusPreferences
import com.argusmdm.agent.util.PermissionUtils
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class StartDestination { LOADING, PROVISIONING, PERMISSIONS, DASHBOARD }

@HiltViewModel
class AppStartViewModel @Inject constructor(
    private val preferences: ArgusPreferences,
    @ApplicationContext private val context: Context,
) : ViewModel() {

    private val _startDestination = MutableStateFlow(StartDestination.LOADING)
    val startDestination: StateFlow<StartDestination> = _startDestination.asStateFlow()

    init {
        recompute()
    }

    fun recompute() {
        viewModelScope.launch {
            val provisioned = preferences.credentialsFlow.first() != null
            _startDestination.value = when {
                !provisioned -> StartDestination.PROVISIONING
                !PermissionUtils.hasAllRequiredPermissions(context) -> StartDestination.PERMISSIONS
                else -> StartDestination.DASHBOARD
            }
        }
    }
}
