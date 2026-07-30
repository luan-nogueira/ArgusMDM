package com.argusmdm.agent.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Fila local de localizações capturadas ainda não confirmadas pelo backend —
 * permite que a captura continue funcionando offline (Modo Offline / Sincronização
 * inteligente), com o envio sendo tentado depois pelo SyncWorker.
 */
@Entity(tableName = "pending_locations")
data class PendingLocationEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float?,
    val altitude: Double?,
    val speed: Float?,
    val capturedAtEpochMillis: Long,
)
