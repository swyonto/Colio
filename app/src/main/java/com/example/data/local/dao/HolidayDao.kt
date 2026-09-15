package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.data.local.entity.HolidayEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface HolidayDao {
  @Query("SELECT * FROM holidays ORDER BY date ASC")
  fun getAllHolidays(): Flow<List<HolidayEntity>>

  @Query("SELECT * FROM holidays WHERE date = :date LIMIT 1")
  suspend fun getHolidayByDate(date: String): HolidayEntity?

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertHoliday(holiday: HolidayEntity): Long

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertAll(holidays: List<HolidayEntity>)

  @Query("DELETE FROM holidays WHERE id = :id")
  suspend fun deleteHolidayById(id: Long)

  @Query("SELECT COUNT(*) FROM holidays")
  suspend fun getCount(): Int
}
