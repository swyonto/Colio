package com.example.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "expenses")
data class ExpenseEntity(
  @PrimaryKey(autoGenerate = true) val id: Long = 0,
  val amount: Double,
  val category: String,
  val description: String,
  val expenseDate: String, // YYYY-MM-DD
  val timestamp: Long = System.currentTimeMillis(),
  val quickExpenseId: Long? = null
)

@Entity(tableName = "quick_expenses")
data class QuickExpenseEntity(
  @PrimaryKey(autoGenerate = true) val id: Long = 0,
  val name: String,
  val amount: Double,
  val category: String,
  val icon: String = "💰"
)
