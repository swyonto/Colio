package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entity.TimetableEntryEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TimetableDao {
  @Query("SELECT * FROM timetable_entries ORDER BY dayOfWeek ASC, startTime ASC")
  fun getAllEntries(): Flow<List<TimetableEntryEntity>>

  @Query("SELECT * FROM timetable_entries WHERE dayOfWeek = :dayOfWeek ORDER BY startTime ASC")
  fun getEntriesForDay(dayOfWeek: Int): Flow<List<TimetableEntryEntity>>

  @Query("SELECT * FROM timetable_entries WHERE dayOfWeek = :dayOfWeek ORDER BY startTime ASC")
  suspend fun getEntriesForDayDirect(dayOfWeek: Int): List<TimetableEntryEntity>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertEntry(entry: TimetableEntryEntity): Long

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertAll(entries: List<TimetableEntryEntity>)

  @Update
  suspend fun updateEntry(entry: TimetableEntryEntity)

  @Query("DELETE FROM timetable_entries WHERE id = :id")
  suspend fun deleteEntryById(id: Long)

  @Query("DELETE FROM timetable_entries WHERE subjectId = :subjectId")
  suspend fun deleteBySubjectId(subjectId: Long)

  @Query("SELECT COUNT(*) FROM timetable_entries")
  suspend fun getCount(): Int
}
