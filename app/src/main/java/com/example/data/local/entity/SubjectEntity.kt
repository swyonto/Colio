package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "subjects")
data class SubjectEntity(
  @PrimaryKey(autoGenerate = true) val id: Long = 0,
  val name: String,
  val code: String,
  val teacher: String,
  val credits: Int = 4,
  val colorHex: String = "#4F46E5",
  val targetAttendancePercent: Float = 75.0f,
  val createdAt: Long = System.currentTimeMillis()
)
