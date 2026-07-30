package com.argusmdm.agent.di

import android.content.Context
import androidx.room.Room
import com.argusmdm.agent.data.local.ArgusDatabase
import com.argusmdm.agent.data.local.dao.PendingLocationDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): ArgusDatabase {
        return Room.databaseBuilder(context, ArgusDatabase::class.java, "argus_mdm.db").build()
    }

    @Provides
    fun providePendingLocationDao(database: ArgusDatabase): PendingLocationDao = database.pendingLocationDao()
}
