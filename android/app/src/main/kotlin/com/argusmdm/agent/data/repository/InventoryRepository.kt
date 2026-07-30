package com.argusmdm.agent.data.repository

import android.app.ActivityManager
import android.bluetooth.BluetoothAdapter
import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiManager
import android.os.BatteryManager
import android.os.StatFs
import android.telephony.TelephonyManager
import androidx.core.content.getSystemService
import com.argusmdm.agent.data.remote.api.ArgusSyncApi
import com.argusmdm.agent.data.remote.dto.DeviceMetricRequest
import com.argusmdm.agent.data.remote.dto.InstalledAppSyncRequest
import dagger.hilt.android.qualifiers.ApplicationContext
import java.time.Instant
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class InventoryRepository @Inject constructor(
    @ApplicationContext private val context: Context,
    private val api: ArgusSyncApi,
) {

    @Suppress("DEPRECATION")
    suspend fun syncInstalledApps() {
        val packageManager = context.packageManager
        val apps = packageManager.getInstalledApplications(PackageManager.GET_META_DATA).map { appInfo ->
            val packageInfo = runCatching { packageManager.getPackageInfo(appInfo.packageName, 0) }.getOrNull()
            InstalledAppSyncRequest.AppEntry(
                packageName = appInfo.packageName,
                appName = packageManager.getApplicationLabel(appInfo).toString(),
                versionName = packageInfo?.versionName,
                versionCode = packageInfo?.let { longVersionCodeOf(it) },
                sizeBytes = runCatching { java.io.File(appInfo.sourceDir).length() }.getOrNull(),
                systemApp = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0,
            )
        }
        api.syncApps(InstalledAppSyncRequest(apps))
    }

    suspend fun syncMetrics() {
        api.syncMetrics(collectMetrics())
    }

    private fun collectMetrics(): DeviceMetricRequest {
        val batteryManager = context.getSystemService<BatteryManager>()
        val batteryLevel = batteryManager?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        val charging = batteryManager?.isCharging

        val statFs = StatFs(android.os.Environment.getDataDirectory().path)
        val storageTotal = statFs.blockCountLong * statFs.blockSizeLong
        val storageFree = statFs.availableBlocksLong * statFs.blockSizeLong
        val storageUsed = storageTotal - storageFree

        val activityManager = context.getSystemService<ActivityManager>()
        val memoryInfo = ActivityManager.MemoryInfo()
        activityManager?.getMemoryInfo(memoryInfo)
        val memoryTotal = memoryInfo.totalMem
        val memoryUsed = memoryTotal - memoryInfo.availMem

        val connectivityManager = context.getSystemService<ConnectivityManager>()
        val activeNetwork = connectivityManager?.activeNetwork
        val capabilities = activeNetwork?.let { connectivityManager.getNetworkCapabilities(it) }
        val wifiConnected = capabilities?.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) == true
        val wifiManager = context.getSystemService<WifiManager>()
        val wifiSsid = if (wifiConnected) {
            runCatching { wifiManager?.connectionInfo?.ssid?.trim('"') }.getOrNull()
        } else {
            null
        }

        val bluetoothAdapter = BluetoothAdapter.getDefaultAdapter()
        val bluetoothEnabled = bluetoothAdapter?.isEnabled

        val telephonyManager = context.getSystemService<TelephonyManager>()
        val networkOperator = telephonyManager?.networkOperatorName?.takeIf { it.isNotBlank() }

        return DeviceMetricRequest(
            batteryLevel = batteryLevel,
            charging = charging,
            storageUsedBytes = storageUsed,
            storageTotalBytes = storageTotal,
            memoryUsedBytes = memoryUsed,
            memoryTotalBytes = memoryTotal,
            cpuUsagePercent = null,
            wifiConnected = wifiConnected,
            wifiSsid = wifiSsid,
            bluetoothEnabled = bluetoothEnabled,
            networkOperator = networkOperator,
            capturedAt = Instant.now().toString(),
        )
    }

    @Suppress("DEPRECATION")
    private fun longVersionCodeOf(packageInfo: android.content.pm.PackageInfo): Long {
        return if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
            packageInfo.longVersionCode
        } else {
            packageInfo.versionCode.toLong()
        }
    }
}
