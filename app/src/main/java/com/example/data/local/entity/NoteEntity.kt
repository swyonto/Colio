package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "notes")
data class NoteEntity(
  @PrimaryKey(autoGenerate = true) val id: Long = 0,
  val subjectId: Long? = null,
  val title: String,
  val content: String,
  val hasPhotoAttachment: Boolean = false,
  val photoUri: String? = null,
  val createdAt: Long = System.currentTimeMillis(),
  val updatedAt: Long = System.currentTimeMillis()
)
