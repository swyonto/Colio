package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.components.AddTaskDialog
import com.example.ui.viewmodel.CampusViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TasksScreen(
  viewModel: CampusViewModel,
  onBack: () -> Unit,
  modifier: Modifier = Modifier
) {
  val tasks by viewModel.tasks.collectAsStateWithLifecycle()
  val subjects by viewModel.subjects.collectAsStateWithLifecycle()
  var showAddTaskDialog by remember { mutableStateOf(false) }

  val filters = listOf("Pending", "Due Today", "All", "Completed")
  var selectedFilter by remember { mutableStateOf("Pending") }

  val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())

  val filteredTasks = remember(tasks, selectedFilter) {
    when (selectedFilter) {
      "Pending" -> tasks.filter { !it.completed }
      "Due Today" -> tasks.filter { it.dueDate == todayStr }
      "Completed" -> tasks.filter { it.completed }
      else -> tasks
    }
  }

  Box(modifier = modifier.fillMaxSize()) {
    Column(modifier = Modifier.fillMaxSize()) {
      TopAppBar(
        title = { Text("College Tasks & Assignments", fontWeight = FontWeight.Bold) },
        navigationIcon = {
          IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
          }
        }
      )

      // Filter Chips (PRD Section 27)
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        filters.forEach { filter ->
          val isSelected = selectedFilter == filter
          Surface(
            shape = RoundedCornerShape(12.dp),
            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
            modifier = Modifier
              .clickable { selectedFilter = filter }
              .testTag("filter_$filter")
          ) {
            Text(
              text = filter,
              style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
              color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface,
              modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
            )
          }
        }
      }

      LazyColumn(
        modifier = Modifier
          .fillMaxSize()
          .testTag("tasks_list"),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        if (filteredTasks.isEmpty()) {
          item {
            Box(
              modifier = Modifier
                .fillMaxWidth()
                .padding(top = 40.dp),
              contentAlignment = Alignment.Center
            ) {
              Text(
                text = "No tasks found in $selectedFilter 🎉",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
          }
        } else {
          items(filteredTasks, key = { it.id }) { task ->
            val sub = subjects.firstOrNull { it.id == task.subjectId }

            Card(
              shape = RoundedCornerShape(14.dp),
              colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
              elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
              modifier = Modifier.fillMaxWidth()
            ) {
              Row(
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(14.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                Checkbox(
                  checked = task.completed,
                  onCheckedChange = { viewModel.toggleTaskCompletion(task) },
                  colors = CheckboxDefaults.colors(checkedColor = MaterialTheme.colorScheme.primary)
                )

                Spacer(modifier = Modifier.width(10.dp))

                Column(modifier = Modifier.weight(1f)) {
                  Text(
                    text = task.title,
                    style = MaterialTheme.typography.titleMedium.copy(
                      fontWeight = FontWeight.SemiBold,
                      textDecoration = if (task.completed) TextDecoration.LineThrough else null
                    ),
                    color = if (task.completed) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.onSurface
                  )

                  if (task.description.isNotBlank()) {
                    Text(
                      text = task.description,
                      style = MaterialTheme.typography.bodySmall,
                      color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                  }

                  Spacer(modifier = Modifier.height(4.dp))

                  Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                  ) {
                    if (sub != null) {
                      Box(
                        modifier = Modifier
                          .clip(RoundedCornerShape(6.dp))
                          .background(MaterialTheme.colorScheme.surfaceVariant)
                          .padding(horizontal = 6.dp, vertical = 2.dp)
                      ) {
                        Text(sub.name, style = MaterialTheme.typography.labelSmall)
                      }
                    }

                    val priorityColor = when (task.priority) {
                      "HIGH" -> Color(0xFFEF4444)
                      "MEDIUM" -> Color(0xFFF59E0B)
                      else -> Color(0xFF10B981)
                    }

                    Box(
                      modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(priorityColor.copy(alpha = 0.15f))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                      Text(task.priority, style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), color = priorityColor)
                    }

                    if (task.dueDate.isNotBlank()) {
                      Text("Due: ${task.dueDate}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                  }
                }

                IconButton(onClick = { viewModel.deleteTask(task.id) }) {
                  Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(18.dp))
                }
              }
            }
          }
        }
      }
    }

    FloatingActionButton(
      onClick = { showAddTaskDialog = true },
      modifier = Modifier
        .align(Alignment.BottomEnd)
        .padding(16.dp)
        .testTag("fab_add_task_screen"),
      containerColor = MaterialTheme.colorScheme.primary,
      contentColor = Color.White
    ) {
      Icon(Icons.Default.Add, contentDescription = "Add Task")
    }
  }

  if (showAddTaskDialog) {
    AddTaskDialog(
      subjects = subjects,
      onDismiss = { showAddTaskDialog = false },
      onConfirm = { title, desc, due, priority, subId ->
        viewModel.addTask(title, desc, due, priority, subId)
        showAddTaskDialog = false
      }
    )
  }
}
