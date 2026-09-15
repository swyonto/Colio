package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entity.AcademicDocumentEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface DocumentDao {
  @Query("SELECT * FROM academic_documents ORDER BY createdAt DESC")
  fun getAllDocuments(): Flow<List<AcademicDocumentEntity>>

  @Query("SELECT * FROM academic_documents WHERE subjectId = :subjectId ORDER BY createdAt DESC")
  fun getDocumentsBySubject(subjectId: Long): Flow<List<AcademicDocumentEntity>>

  @Query("SELECT * FROM academic_documents WHERE docType = 'BOOK' ORDER BY createdAt DESC")
  fun getBooks(): Flow<List<AcademicDocumentEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertDocument(document: AcademicDocumentEntity): Long

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertAll(documents: List<AcademicDocumentEntity>)

  @Update
  suspend fun updateDocument(document: AcademicDocumentEntity)

  @Query("DELETE FROM academic_documents WHERE id = :id")
  suspend fun deleteDocumentById(id: Long)

  @Query("SELECT COUNT(*) FROM academic_documents")
  suspend fun getCount(): Int
}
