package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entity.ExpenseEntity
import com.example.data.local.entity.QuickExpenseEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ExpenseDao {
  @Query("SELECT * FROM expenses ORDER BY expenseDate DESC, timestamp DESC")
  fun getAllExpenses(): Flow<List<ExpenseEntity>>

  @Query("SELECT * FROM expenses WHERE expenseDate LIKE :monthPrefix || '%' ORDER BY expenseDate DESC, timestamp DESC")
  fun getExpensesForMonth(monthPrefix: String): Flow<List<ExpenseEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertExpense(expense: ExpenseEntity): Long

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertAll(expenses: List<ExpenseEntity>)

  @Update
  suspend fun updateExpense(expense: ExpenseEntity)

  @Query("DELETE FROM expenses WHERE id = :id")
  suspend fun deleteExpenseById(id: Long)

  @Query("SELECT SUM(amount) FROM expenses WHERE expenseDate LIKE :monthPrefix || '%'")
  fun getTotalForMonth(monthPrefix: String): Flow<Double?>

  @Query("SELECT COUNT(*) FROM expenses")
  suspend fun getCount(): Int
}

@Dao
interface QuickExpenseDao {
  @Query("SELECT * FROM quick_expenses ORDER BY id ASC")
  fun getAllQuickExpenses(): Flow<List<QuickExpenseEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertQuickExpense(quickExpense: QuickExpenseEntity): Long

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertAll(quickExpenses: List<QuickExpenseEntity>)

  @Update
  suspend fun updateQuickExpense(quickExpense: QuickExpenseEntity)

  @Query("DELETE FROM quick_expenses WHERE id = :id")
  suspend fun deleteQuickExpenseById(id: Long)

  @Query("SELECT COUNT(*) FROM quick_expenses")
  suspend fun getCount(): Int
}
