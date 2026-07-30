package com.argusmdm.agent.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import com.argusmdm.agent.data.local.entity.PendingLocationEntity

@Dao
interface PendingLocationDao {

    @Insert
    suspend fun insert(location: PendingLocationEntity): Long

    @Query("SELECT * FROM pending_locations ORDER BY capturedAtEpochMillis ASC LIMIT :limit")
    suspend fun oldest(limit: Int = 50): List<PendingLocationEntity>

    @Delete
    suspend fun delete(location: PendingLocationEntity)

    @Query("SELECT COUNT(*) FROM pending_locations")
    suspend fun count(): Int

    @Query("SELECT * FROM pending_locations ORDER BY capturedAtEpochMillis DESC LIMIT 1")
    suspend fun latest(): PendingLocationEntity?
}
