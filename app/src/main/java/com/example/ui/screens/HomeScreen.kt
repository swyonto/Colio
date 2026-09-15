package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.EditNote
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.local.entity.QuickExpenseEntity
import com.example.data.local.entity.TaskEntity
import com.example.ui.components.AddExpenseDialog
import com.example.ui.components.AddTaskDialog
import com.example.ui.components.AttendanceCard
import com.example.ui.components.BooksCard
import com.example.ui.components.ExpenseCard
import com.example.ui.components.TaskCard
import com.example.ui.components.TimetableCard
import com.example.ui.viewmodel.CampusViewModel
import com.example.ui.viewmodel.ScreenTab
import com.example.ui.viewmodel.SubScreen

@Composable
fun HomeScreen(
  viewModel: CampusViewModel,
  modifier: Modifier = Modifier
) {
  val summary by viewModel.overallAttendanceSummary.collectAsStateWithLifecycle()
  val monthTotal by viewModel.currentMonthTotal.collectAsStateWithLifecycle()
  val quickExpenses by viewModel.quickExpenses.collectAsStateWithLifecycle()
  val tasksRemaining by viewModel.tasksRemainingCount.collectAsStateWithLifecycle()
  val tasksDueToday by viewModel.tasksDueTodayCount.collectAsStateWithLifecycle()
  val allTasks by viewModel.tasks.collectAsStateWithLifecycle()
  val documents by viewModel.documents.collectAsStateWithLifecycle()
  val todayClasses by viewModel.todayClasses.collectAsStateWithLifecycle()
  val profile by viewModel.profile.collectAsStateWithLifecycle()
  val subjects by viewModel.subjects.collectAsStateWithLifecycle()

  var showAddExpenseDialog by remember { mutableStateOf(false) }
  var showAddTaskDialog by remember { mutableStateOf(false) }

  val pendingTasksPreview = remember(allTasks) {
    allTasks.filter { !it.completed }
  }

  LazyColumn(
    modifier = modifier
      .fillMaxSize()
      .testTag("home_screen_feed"),
    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 12.dp, bottom = 96.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp)
  ) {
    // 1. Attendance Card (PRD Section 7 & 8)
    item {
      AttendanceCard(
        summary = summary,
        onViewAttendanceClick = { viewModel.selectTab(ScreenTab.ATTENDANCE) }
      )
    }

    // 2. Expense Card (PRD Section 7 & 19)
    item {
      ExpenseCard(
        monthTotal = monthTotal,
        quickExpenses = quickExpenses,
        onViewExpensesClick = { viewModel.selectTab(ScreenTab.EXPENSES) },
        onQuickExpenseClick = { quick -> viewModel.logQuickExpense(quick) }
      )
    }

    // 3. Tasks Card (PRD Section 7 & 25)
    item {
      TaskCard(
        remainingCount = tasksRemaining,
        dueTodayCount = tasksDueToday,
        pendingTasksPreview = pendingTasksPreview,
        onTaskToggle = { task -> viewModel.toggleTaskCompletion(task) },
        onViewTasksClick = { viewModel.navigateToSubScreen(SubScreen.TASKS) }
      )
    }

    // 4. Books Card (PRD Section 7 & 28)
    item {
      BooksCard(
        documents = documents,
        onViewBooksClick = { viewModel.navigateToSubScreen(SubScreen.BOOKS) }
      )
    }

    // 5. Academic Summary / Add-on Card (PRD Section 7: Additional useful card)
    item {
      Card(
        modifier = Modifier
          .fillMaxWidth()
          .clickable { viewModel.navigateToSubScreen(SubScreen.ADDONS) }
          .testTag("academic_summary_card"),
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(18.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
              modifier = Modifier
                .size(40.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(MaterialTheme.colorScheme.secondaryContainer),
              contentAlignment = Alignment.Center
            ) {
              Icon(
                imageVector = Icons.Default.Calculate,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSecondaryContainer,
                modifier = Modifier.size(22.dp)
              )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
              Text(
                text = "${profile?.semester ?: "Semester 5"} • CGPA: 8.49",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
              )
              Text(
                text = "Tap to open CGPA, GPA & Goal Calculator",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
          }
        }
      }
    }

    // 6. Today's Timetable (PRD Section 7 & 32)
    item {
      TimetableCard(
        todayClasses = todayClasses,
        onViewMoreClick = { viewModel.selectTab(ScreenTab.TIMETABLE) },
        onQuickMarkAttendance = { subId, slot, status ->
          viewModel.markQuickAttendance(subId, slot, status)
        }
      )
    }

    // 7. Quick Actions Row
    item {
      Column {
        Text(
          text = "Quick Actions",
          style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
          color = MaterialTheme.colorScheme.onSurfaceVariant,
          modifier = Modifier.padding(bottom = 8.dp)
        )
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          Surface(
            shape = RoundedCornerShape(12.dp),
            color = MaterialTheme.colorScheme.surface,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
            modifier = Modifier
              .weight(1f)
              .clickable { showAddExpenseDialog = true }
              .testTag("quick_action_add_expense")
          ) {
            Row(
              modifier = Modifier.padding(12.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(Icons.Default.Payments, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
              Spacer(modifier = Modifier.width(8.dp))
              Text("Add Expense", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold))
            }
          }

          Surface(
            shape = RoundedCornerShape(12.dp),
            color = MaterialTheme.colorScheme.surface,
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
            modifier = Modifier
              .weight(1f)
              .clickable { showAddTaskDialog = true }
              .testTag("quick_action_add_task")
          ) {
            Row(
              modifier = Modifier.padding(12.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Icon(Icons.Default.EditNote, contentDescription = null, tint = MaterialTheme.colorScheme.secondary, modifier = Modifier.size(18.dp))
              Spacer(modifier = Modifier.width(8.dp))
              Text("Add Task", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold))
            }
          }
        }
      }
    }
  }

  // Dialogs
  if (showAddExpenseDialog) {
    AddExpenseDialog(
      onDismiss = { showAddExpenseDialog = false },
      onConfirm = { amt, cat, desc, date ->
        viewModel.addExpense(amt, cat, desc, date)
        showAddExpenseDialog = false
      }
    )
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
