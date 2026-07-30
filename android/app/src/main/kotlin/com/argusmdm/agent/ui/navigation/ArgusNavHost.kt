package com.argusmdm.agent.ui.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.argusmdm.agent.service.LocationForegroundService
import com.argusmdm.agent.ui.dashboard.DashboardScreen
import com.argusmdm.agent.ui.permissions.PermissionsScreen
import com.argusmdm.agent.ui.provisioning.ProvisioningScreen

private object Routes {
    const val PROVISIONING = "provisioning"
    const val PERMISSIONS = "permissions"
    const val DASHBOARD = "dashboard"
}

@Composable
fun ArgusNavHost() {
    val appStartViewModel: AppStartViewModel = hiltViewModel()
    val startDestination by appStartViewModel.startDestination.collectAsState()
    val context = LocalContext.current

    if (startDestination == StartDestination.LOADING) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        return
    }

    val navController = rememberNavController()
    val startRoute = when (startDestination) {
        StartDestination.PROVISIONING -> Routes.PROVISIONING
        StartDestination.PERMISSIONS -> Routes.PERMISSIONS
        else -> Routes.DASHBOARD
    }

    NavHost(navController = navController, startDestination = startRoute) {
        composable(Routes.PROVISIONING) {
            ProvisioningScreen(
                onProvisioned = {
                    navController.navigate(Routes.PERMISSIONS) {
                        popUpTo(Routes.PROVISIONING) { inclusive = true }
                    }
                },
            )
        }
        composable(Routes.PERMISSIONS) {
            PermissionsScreen(
                onContinue = {
                    LocationForegroundService.start(context)
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(Routes.PERMISSIONS) { inclusive = true }
                    }
                },
            )
        }
        composable(Routes.DASHBOARD) {
            DashboardScreen(
                onUnlinked = {
                    LocationForegroundService.stop(context)
                    navController.navigate(Routes.PROVISIONING) {
                        popUpTo(Routes.DASHBOARD) { inclusive = true }
                    }
                },
            )
        }
    }
}
