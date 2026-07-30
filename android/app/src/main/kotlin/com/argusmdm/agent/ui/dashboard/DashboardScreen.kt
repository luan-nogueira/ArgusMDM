package com.argusmdm.agent.ui.dashboard

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.argusmdm.agent.R
import kotlinx.coroutines.launch
import java.text.DateFormat
import java.util.Date

@Composable
fun DashboardScreen(
    onUnlinked: () -> Unit,
    viewModel: DashboardViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()
    val scope = rememberCoroutineScope()

    Column(modifier = Modifier.fillMaxSize().padding(24.dp)) {
        Text(text = stringResource(R.string.dashboard_title), style = MaterialTheme.typography.titleLarge)

        Card(
            modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(Icons.Default.Shield, contentDescription = null)
                Text(
                    text = stringResource(R.string.dashboard_managed_banner),
                    modifier = Modifier.padding(start = 12.dp),
                )
            }
        }

        Card(modifier = Modifier.fillMaxWidth().padding(top = 16.dp)) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = stringResource(R.string.dashboard_last_sync), style = MaterialTheme.typography.titleMedium)
                Text(
                    text = uiState.lastSyncAtEpochMillis?.let {
                        DateFormat.getDateTimeInstance().format(Date(it))
                    } ?: stringResource(R.string.dashboard_never_synced),
                    style = MaterialTheme.typography.bodyMedium,
                )

                Button(
                    onClick = viewModel::syncNow,
                    enabled = !uiState.isSyncing,
                    modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
                ) {
                    if (uiState.isSyncing) {
                        CircularProgressIndicator(
                            modifier = Modifier.padding(end = 8.dp),
                            color = MaterialTheme.colorScheme.onPrimary,
                        )
                        Text(stringResource(R.string.dashboard_syncing))
                    } else {
                        Icon(Icons.Default.Sync, contentDescription = null, modifier = Modifier.padding(end = 8.dp))
                        Text(stringResource(R.string.dashboard_sync_now))
                    }
                }

                uiState.statusMessage?.let {
                    Text(text = it, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.padding(top = 8.dp))
                }
            }
        }

        Card(modifier = Modifier.fillMaxWidth().padding(top = 16.dp)) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = stringResource(R.string.dashboard_policy_title), style = MaterialTheme.typography.titleMedium)
                Text(
                    text = uiState.policy?.name ?: stringResource(R.string.dashboard_no_policy),
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
        }

        Column(
            modifier = Modifier.fillMaxWidth().padding(top = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            TextButton(
                onClick = {
                    scope.launch {
                        viewModel.unlinkDevice()
                        onUnlinked()
                    }
                },
            ) {
                Text(stringResource(R.string.dashboard_unlink), color = MaterialTheme.colorScheme.error)
            }
        }
    }
}
