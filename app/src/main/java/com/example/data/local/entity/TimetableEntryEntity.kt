package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "timetable_entries")
data class TimetableEntryEntity(
  @PrimaryKey(autoGenerate = true) val id: Long = 0,
  val subjectId: Long,
  val dayOfWeek: Int, // 1=Monday ... 6=Saturday, 7=Sunday
  val startTime: String, // "09:00"
  val endTime: String, // "10:00"
  val room: String,
  val teacher: String = "",
  val colorHex: String = "#4F46E5",
  val createdAt: Long = System.currentTimeMillis()
)
