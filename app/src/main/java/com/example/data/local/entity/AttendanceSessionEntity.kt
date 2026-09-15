package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
  tableName = "attendance_sessions",
  indices = [Index(value = ["subjectId", "date", "timeSlot"], unique = true)]
)
data class AttendanceSessionEntity(
  @PrimaryKey(autoGenerate = true) val id: Long = 0,
  val subjectId: Long,
  val date: String, // Format: YYYY-MM-DD
  val timeSlot: String, // e.g. "09:00 - 10:00"
  val status: String, // "PRESENT", "ABSENT", "HOLIDAY"
  val source: String = "MANUAL", // "MANUAL", "AUTOMATIC"
  val notes: String = "",
  val createdAt: Long = System.currentTimeMillis(),
  val updatedAt: Long = System.currentTimeMillis()
)
