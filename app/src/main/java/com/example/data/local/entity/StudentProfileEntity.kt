package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "student_profile")
data class StudentProfileEntity(
  @PrimaryKey val id: Long = 1L,
  val name: String = "Suraj Maurya",
  val collegeName: String = "National Institute of Technology",
  val course: String = "B.Tech Computer Science & Engineering",
  val semester: String = "Semester 5",
  val rollNumber: String = "2024CS042",
  val branch: String = "CSE",
  val avatarUri: String? = null,
  val idCardUri: String? = null,
  val validThru: String = "2027-06-30",
  val targetAttendance: Float = 75.0f,
  val updatedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "sync_queue")
data class SyncQueueEntity(
  @PrimaryKey(autoGenerate = true) val id: Long = 0,
  val entityType: String,
  val entityId: String,
  val operation: String, // "CREATE", "UPDATE", "DELETE"
  val payload: String,
  val createdAt: Long = System.currentTimeMillis(),
  val isSynced: Boolean = true // simulated local first offline sync status
)

@Entity(tableName = "addons")
data class AddonEntity(
  @PrimaryKey val id: String,
  val name: String,
  val description: String,
  val icon: String,
  val category: String, // "ACADEMIC", "PRODUCTIVITY", "UTILITY"
  val isEnabled: Boolean = true
)
