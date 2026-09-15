package com.example.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.example.data.local.entity.TaskEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TaskDao {
  @Query("SELECT * FROM tasks ORDER BY completed ASC, dueDate ASC, priority DESC")
  fun getAllTasks(): Flow<List<TaskEntity>>

  @Query("SELECT * FROM tasks WHERE completed = 0 ORDER BY dueDate ASC")
  fun getPendingTasks(): Flow<List<TaskEntity>>

  @Query("SELECT * FROM tasks WHERE completed = 0 AND dueDate = :today")
  fun getTasksDueToday(today: String): Flow<List<TaskEntity>>

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertTask(task: TaskEntity): Long

  @Insert(onConflict = OnConflictStrategy.REPLACE)
  suspend fun insertAll(tasks: List<TaskEntity>)

  @Update
  suspend fun updateTask(task: TaskEntity)

  @Query("UPDATE tasks SET completed = :completed WHERE id = :id")
  suspend fun updateCompletion(id: Long, completed: Boolean)

  @Query("DELETE FROM tasks WHERE id = :id")
  suspend fun deleteTaskById(id: Long)

  @Query("SELECT COUNT(*) FROM tasks")
  suspend fun getCount(): Int
}
