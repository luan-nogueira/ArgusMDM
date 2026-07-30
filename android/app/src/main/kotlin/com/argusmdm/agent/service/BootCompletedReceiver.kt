package com.argusmdm.agent.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.argusmdm.agent.data.local.prefs.ArgusPreferences
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

@AndroidEntryPoint
class BootCompletedReceiver : BroadcastReceiver() {

    @Inject
    lateinit var preferences: ArgusPreferences

    @Inject
    lateinit var syncScheduler: SyncScheduler

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return

        Timber.i("Dispositivo reiniciado; retomando gerenciamento")
        syncScheduler.ensureScheduled()

        // Lê o DataStore diretamente (em vez do cache em memória, que só é populado de
        // forma assíncrona e pode ainda não ter o primeiro valor logo após o boot) e
        // usa goAsync() para manter o processo vivo até a leitura suspensa terminar.
        val pendingResult = goAsync()
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val credentials = preferences.credentialsFlow.first()
                if (credentials != null) {
                    LocationForegroundService.start(context)
                }
            } finally {
                pendingResult.finish()
            }
        }
    }
}
