package com.argusmdm.agent.policy

import android.app.admin.DeviceAdminReceiver
import android.content.Context
import android.content.Intent
import com.argusmdm.agent.data.local.prefs.ArgusPreferences
import com.argusmdm.agent.di.ApplicationScope
import com.argusmdm.agent.service.SyncScheduler
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import timber.log.Timber
import javax.inject.Inject

/**
 * Recebe os callbacks do Device Owner. O app pode ser provisionado de duas formas:
 * 1) QR code durante o assistente de configuração de fábrica — o bundle de extras
 *    definido no QR (deviceId/apiKey) chega em [onProfileProvisioningComplete].
 * 2) `adb shell dpm set-device-owner` seguido de vínculo manual na tela de
 *    provisionamento do app (fluxo documentado no README, mais prático para uso
 *    pessoal/familiar sem infraestrutura de download hospedado).
 */
@AndroidEntryPoint
class ArgusDeviceAdminReceiver : DeviceAdminReceiver() {

    @Inject
    lateinit var preferences: ArgusPreferences

    @Inject
    lateinit var syncScheduler: SyncScheduler

    @Inject
    @ApplicationScope
    lateinit var applicationScope: CoroutineScope

    override fun onEnabled(context: Context, intent: Intent) {
        super.onEnabled(context, intent)
        Timber.i("Device admin habilitado")
    }

    override fun onProfileProvisioningComplete(context: Context, intent: Intent) {
        super.onProfileProvisioningComplete(context, intent)
        Timber.i("Provisionamento via QR concluído")

        val extras = intent.getParcelableExtra<android.os.PersistableBundle>(
            android.app.admin.DevicePolicyManager.EXTRA_PROVISIONING_ADMIN_EXTRAS_BUNDLE,
        )
        val deviceId = extras?.getString(EXTRA_DEVICE_ID)
        val apiKey = extras?.getString(EXTRA_API_KEY)

        if (!deviceId.isNullOrBlank() && !apiKey.isNullOrBlank()) {
            applicationScope.launch {
                preferences.saveCredentials(deviceId, apiKey)
                syncScheduler.ensureScheduled()
                syncScheduler.runOnce()
            }
        }
    }

    override fun onDisabled(context: Context, intent: Intent) {
        super.onDisabled(context, intent)
        Timber.w("Device admin desabilitado")
    }

    companion object {
        const val EXTRA_DEVICE_ID = "com.argusmdm.agent.DEVICE_ID"
        const val EXTRA_API_KEY = "com.argusmdm.agent.API_KEY"
    }
}
