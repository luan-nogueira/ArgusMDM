package com.argusmdm.agent.policy

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.os.UserManager
import androidx.core.content.getSystemService
import com.argusmdm.agent.data.remote.dto.PolicyResponse
import dagger.hilt.android.qualifiers.ApplicationContext
import timber.log.Timber
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Traduz a política vinda do backend (com.tactio.mdm.domain.entity.Policy) em chamadas
 * reais de [DevicePolicyManager]. Toda operação é no-op silencioso se o app ainda não
 * for o Device Owner, para nunca derrubar a sincronização por falta de permissão.
 */
@Singleton
class DevicePolicyManagerHelper @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    private val devicePolicyManager: DevicePolicyManager? = context.getSystemService()
    private val adminComponent = ComponentName(context, ArgusDeviceAdminReceiver::class.java)

    val isDeviceOwner: Boolean
        get() = devicePolicyManager?.isDeviceOwnerApp(context.packageName) == true

    fun apply(policy: PolicyResponse) {
        val dpm = devicePolicyManager
        if (dpm == null || !isDeviceOwner) {
            Timber.w("App não é Device Owner; política não pôde ser aplicada no sistema")
            return
        }

        runCatching {
            if (policy.passwordRequired) {
                dpm.setPasswordQuality(adminComponent, DevicePolicyManager.PASSWORD_QUALITY_ALPHANUMERIC)
                dpm.setPasswordMinimumLength(adminComponent, policy.minPasswordLength)
            } else {
                dpm.setPasswordQuality(adminComponent, DevicePolicyManager.PASSWORD_QUALITY_UNSPECIFIED)
            }
        }.onFailure { Timber.w(it, "Falha ao aplicar política de senha") }

        runCatching {
            dpm.setMaximumTimeToLock(adminComponent, policy.maxInactivityLockMs)
        }.onFailure { Timber.w(it, "Falha ao aplicar tempo de bloqueio") }

        runCatching {
            dpm.setCameraDisabled(adminComponent, policy.cameraDisabled)
        }.onFailure { Timber.w(it, "Falha ao aplicar restrição de câmera") }

        runCatching {
            val keyguardFlags = if (policy.screenCaptureDisabled) {
                DevicePolicyManager.KEYGUARD_DISABLE_SECURE_CAMERA or
                    DevicePolicyManager.KEYGUARD_DISABLE_SECURE_NOTIFICATIONS
            } else {
                DevicePolicyManager.KEYGUARD_DISABLE_FEATURES_NONE
            }
            dpm.setKeyguardDisabledFeatures(adminComponent, keyguardFlags)
            dpm.setScreenCaptureDisabled(adminComponent, policy.screenCaptureDisabled)
        }.onFailure { Timber.w(it, "Falha ao aplicar restrição de captura de tela") }

        runCatching {
            setUserRestriction(dpm, UserManager.DISALLOW_FACTORY_RESET, policy.factoryResetDisabled)
        }.onFailure { Timber.w(it, "Falha ao aplicar restrição de reset de fábrica") }

        runCatching {
            setUserRestriction(dpm, UserManager.DISALLOW_INSTALL_APPS, policy.installAppsDisabled)
        }.onFailure { Timber.w(it, "Falha ao aplicar restrição de instalação de apps") }

        runCatching {
            setUserRestriction(dpm, UserManager.DISALLOW_USB_FILE_TRANSFER, policy.usbFileTransferDisabled)
        }.onFailure { Timber.w(it, "Falha ao aplicar restrição de transferência USB") }

        Timber.i("Política '${policy.name}' aplicada com sucesso")
    }

    private fun setUserRestriction(dpm: DevicePolicyManager, restriction: String, enabled: Boolean) {
        if (enabled) {
            dpm.addUserRestriction(adminComponent, restriction)
        } else {
            dpm.clearUserRestriction(adminComponent, restriction)
        }
    }

    fun lockDeviceNow() {
        if (isDeviceOwner) {
            runCatching { devicePolicyManager?.lockNow() }
                .onFailure { Timber.w(it, "Falha ao bloquear dispositivo") }
        }
    }
}
