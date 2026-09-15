package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "tasks")
data class TaskEntity(
  @PrimaryKey(autoGenerate = true) val id: Long = 0,
  val subjectId: Long? = null,
  val title: String,
  val description: String = "",
  val dueDate: String, // YYYY-MM-DD
  val priority: String = "MEDIUM", // "LOW", "MEDIUM", "HIGH"
  val completed: Boolean = false,
  val createdAt: Long = System.currentTimeMillis()
)
