package com.argusmdm.agent.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import androidx.core.app.NotificationManagerCompat
import com.argusmdm.agent.R

object NotificationChannels {
    const val MANAGED_CHANNEL_ID = "managed_device"
    const val SYNC_CHANNEL_ID = "sync_progress"

    fun ensureCreated(context: Context) {
        val managed = NotificationChannel(
            MANAGED_CHANNEL_ID,
            context.getString(R.string.notification_channel_managed_name),
            NotificationManager.IMPORTANCE_LOW,
        ).apply {
            description = context.getString(R.string.notification_channel_managed_desc)
            setShowBadge(false)
        }

        val sync = NotificationChannel(
            SYNC_CHANNEL_ID,
            context.getString(R.string.notification_channel_sync_name),
            NotificationManager.IMPORTANCE_MIN,
        ).apply {
            description = context.getString(R.string.notification_channel_sync_desc)
            setShowBadge(false)
        }

        NotificationManagerCompat.from(context).apply {
            createNotificationChannel(managed)
            createNotificationChannel(sync)
        }
    }
}
