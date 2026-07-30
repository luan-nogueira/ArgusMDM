package com.argusmdm.agent.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.argusmdm.agent.data.local.dao.PendingLocationDao
import com.argusmdm.agent.data.local.entity.PendingLocationEntity

@Database(
    entities = [PendingLocationEntity::class],
    version = 1,
    exportSchema = false,
)
abstract class ArgusDatabase : RoomDatabase() {
    abstract fun pendingLocationDao(): PendingLocationDao
}
