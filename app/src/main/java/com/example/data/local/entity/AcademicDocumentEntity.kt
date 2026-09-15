package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "academic_documents")
data class AcademicDocumentEntity(
  @PrimaryKey(autoGenerate = true) val id: Long = 0,
  val subjectId: Long? = null,
  val title: String,
  val description: String = "",
  val docType: String = "BOOK", // "BOOK", "LECTURE_NOTES", "SYLLABUS", "ASSIGNMENT", "LAB_PRACTICAL"
  val fileSize: String = "2.5 MB",
  val pageCount: Int = 30,
  val storageUri: String = "",
  val createdAt: Long = System.currentTimeMillis()
)
