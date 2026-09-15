package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entity.AddonEntity
import com.example.data.local.entity.NoteEntity
import com.example.data.local.entity.StudentProfileEntity
import com.example.data.local.entity.SyncQueueEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface NoteDao {
  @Query("SELECT * FROM notes ORDER BY updatedAt DESC")
  fun getAllNotes(): Flow<List<NoteEntity>>

  @Query("SELECT * FROM notes WHERE subjectId = :subjectId ORDER BY updatedAt DESC")
  fun getNotesBySubject(subjectId: Long): Flow<List<NoteEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertNote(note: NoteEntity): Long

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertAll(notes: List<NoteEntity>)

  @Update
  suspend fun updateNote(note: NoteEntity)

  @Query("DELETE FROM notes WHERE id = :id")
  suspend fun deleteNoteById(id: Long)

  @Query("SELECT COUNT(*) FROM notes")
  suspend fun getCount(): Int
}

@Dao
interface ProfileDao {
  @Query("SELECT * FROM student_profile WHERE id = 1 LIMIT 1")
  fun getProfile(): Flow<StudentProfileEntity?>

  @Query("SELECT * FROM student_profile WHERE id = 1 LIMIT 1")
  suspend fun getProfileDirect(): StudentProfileEntity?

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertProfile(profile: StudentProfileEntity)

  @Update
  suspend fun updateProfile(profile: StudentProfileEntity)
}

@Dao
interface SyncQueueDao {
  @Query("SELECT * FROM sync_queue ORDER BY createdAt ASC")
  fun getAllQueue(): Flow<List<SyncQueueEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insert(entry: SyncQueueEntity): Long

  @Query("DELETE FROM sync_queue WHERE id = :id")
  suspend fun deleteById(id: Long)

  @Query("DELETE FROM sync_queue WHERE isSynced = 1")
  suspend fun clearSynced()
}

@Dao
interface AddonDao {
  @Query("SELECT * FROM addons ORDER BY id ASC")
  fun getAllAddons(): Flow<List<AddonEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertAll(addons: List<AddonEntity>)

  @Query("UPDATE addons SET isEnabled = :enabled WHERE id = :id")
  suspend fun setEnabled(id: String, enabled: Boolean)

  @Query("SELECT COUNT(*) FROM addons")
  suspend fun getCount(): Int
}
