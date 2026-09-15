package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entity.AttendanceSessionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface AttendanceDao {
  @Query("SELECT * FROM attendance_sessions ORDER BY date DESC, timeSlot DESC")
  fun getAllSessions(): Flow<List<AttendanceSessionEntity>>

  @Query("SELECT * FROM attendance_sessions WHERE subjectId = :subjectId ORDER BY date DESC")
  fun getSessionsBySubject(subjectId: Long): Flow<List<AttendanceSessionEntity>>

  @Query("SELECT * FROM attendance_sessions WHERE date = :date")
  fun getSessionsByDate(date: String): Flow<List<AttendanceSessionEntity>>

  @Query("SELECT * FROM attendance_sessions WHERE subjectId = :subjectId AND date = :date LIMIT 1")
  suspend fun getSessionBySubjectAndDate(subjectId: Long, date: String): AttendanceSessionEntity?

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertSession(session: AttendanceSessionEntity): Long

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertAll(sessions: List<AttendanceSessionEntity>)

  @Update
  suspend fun updateSession(session: AttendanceSessionEntity)

  @Query("DELETE FROM attendance_sessions WHERE id = :id")
  suspend fun deleteSessionById(id: Long)

  @Query("SELECT COUNT(*) FROM attendance_sessions")
  suspend fun getCount(): Int
}
