package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entity.SubjectEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SubjectDao {
  @Query("SELECT * FROM subjects ORDER BY name ASC")
  fun getAllSubjects(): Flow<List<SubjectEntity>>

  @Query("SELECT * FROM subjects WHERE id = :id")
  suspend fun getSubjectById(id: Long): SubjectEntity?

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertSubject(subject: SubjectEntity): Long

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertAll(subjects: List<SubjectEntity>)

  @Update
  suspend fun updateSubject(subject: SubjectEntity)

  @Query("DELETE FROM subjects WHERE id = :id")
  suspend fun deleteSubjectById(id: Long)

  @Query("SELECT COUNT(*) FROM subjects")
  suspend fun getCount(): Int
}
