package com.argusmdm.agent.ui.permissions

import android.Manifest
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.viewmodel.compose.viewModel
import com.argusmdm.agent.R

private data class PermissionItem(
    val title: String,
    val description: String,
    val granted: Boolean,
    val onRequest: () -> Unit,
)

@Composable
fun PermissionsScreen(
    onContinue: () -> Unit,
    viewModel: PermissionsViewModel = viewModel(),
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()

    val lifecycleOwner = LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner) {
        viewModel.refresh()
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) viewModel.refresh()
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    val locationLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { viewModel.refresh() }

    val backgroundLocationLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { viewModel.refresh() }

    val notificationsLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { viewModel.refresh() }

    val galleryLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { viewModel.refresh() }

    val items = buildList {
        add(
            PermissionItem(
                title = stringResource(R.string.permissions_location_title),
                description = stringResource(R.string.permissions_location_desc),
                granted = uiState.foregroundLocationGranted,
                onRequest = { locationLauncher.launch(Manifest.permission.ACCESS_FINE_LOCATION) },
            ),
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            add(
                PermissionItem(
                    title = stringResource(R.string.permissions_background_location_title),
                    description = stringResource(R.string.permissions_background_location_desc),
                    granted = uiState.backgroundLocationGranted,
                    onRequest = {
                        backgroundLocationLauncher.launch(Manifest.permission.ACCESS_BACKGROUND_LOCATION)
                    },
                ),
            )
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            add(
                PermissionItem(
                    title = stringResource(R.string.permissions_notifications_title),
                    description = stringResource(R.string.permissions_notifications_desc),
                    granted = uiState.notificationsGranted,
                    onRequest = { notificationsLauncher.launch(Manifest.permission.POST_NOTIFICATIONS) },
                ),
            )
        }
        add(
            PermissionItem(
                title = stringResource(R.string.permissions_gallery_title),
                description = stringResource(R.string.permissions_gallery_desc),
                granted = uiState.galleryGranted,
                onRequest = {
                    val perm = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        Manifest.permission.READ_MEDIA_IMAGES
                    } else {
                        Manifest.permission.READ_EXTERNAL_STORAGE
                    }
                    galleryLauncher.launch(perm)
                },
            ),
        )
        add(
            PermissionItem(
                title = stringResource(R.string.permissions_usage_access_title),
                description = stringResource(R.string.permissions_usage_access_desc),
                granted = uiState.usageAccessGranted,
                onRequest = {
                    val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS, Uri.parse("package:${context.packageName}"))
                    context.startActivity(intent)
                },
            ),
        )
    }

    Column(modifier = Modifier.fillMaxSize().padding(24.dp)) {
        Text(text = stringResource(R.string.permissions_title), style = MaterialTheme.typography.titleLarge)

        LazyColumn(modifier = Modifier.weight(1f).padding(top = 16.dp)) {
            items(items) { item -> PermissionCard(item) }
        }

        Button(
            onClick = onContinue,
            enabled = uiState.canContinue,
            modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
        ) {
            Text(stringResource(R.string.permissions_continue))
        }
    }
}

@Composable
private fun PermissionCard(item: PermissionItem) {
    Card(modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(text = item.title, style = MaterialTheme.typography.titleMedium)
                Text(text = item.description, style = MaterialTheme.typography.bodyMedium)
            }
            if (item.granted) {
                Text(
                    text = stringResource(R.string.permissions_granted),
                    color = MaterialTheme.colorScheme.primary,
                )
            } else {
                TextButton(onClick = item.onRequest) {
                    Text(stringResource(R.string.permissions_grant))
                }
            }
        }
    }
}
