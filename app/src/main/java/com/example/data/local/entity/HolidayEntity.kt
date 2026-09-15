package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
  tableName = "holidays",
  indices = [Index(value = ["date"], unique = true)]
)
data class HolidayEntity(
  @PrimaryKey(autoGenerate = true) val id: Long = 0,
  val date: String, // Format: YYYY-MM-DD
  val title: String,
  val type: String = "COLLEGE_HOLIDAY", // "COLLEGE_HOLIDAY", "FESTIVAL", "SEMESTER_BREAK", "PERSONAL"
  val createdAt: Long = System.currentTimeMillis()
)
