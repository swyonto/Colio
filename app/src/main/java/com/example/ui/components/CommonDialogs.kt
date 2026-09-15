package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
import com.example.data.local.entity.SubjectEntity
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun AddSubjectDialog(
  onDismiss: () -> Unit,
  onConfirm: (name: String, code: String, teacher: String, credits: Int, colorHex: String) -> Unit
) {
  var name by remember { mutableStateOf("") }
  var code by remember { mutableStateOf("") }
  var teacher by remember { mutableStateOf("") }
  var credits by remember { mutableStateOf("4") }
  val availableColors = listOf("#4F46E5", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6")
  var selectedColor by remember { mutableStateOf(availableColors[0]) }

  AlertDialog(
    onDismissRequest = onDismiss,
    title = { Text("Add New Subject", fontWeight = FontWeight.Bold) },
    text = {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        OutlinedTextField(
          value = name,
          onValueChange = { name = it },
          label = { Text("Subject Name *") },
          singleLine = true,
          modifier = Modifier.fillMaxWidth().testTag("input_subject_name")
        )
        OutlinedTextField(
          value = code,
          onValueChange = { code = it },
          label = { Text("Subject Code (e.g. CS301)") },
          singleLine = true,
          modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
          value = teacher,
          onValueChange = { teacher = it },
          label = { Text("Professor / Teacher") },
          singleLine = true,
          modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
          value = credits,
          onValueChange = { credits = it },
          label = { Text("Credits") },
          singleLine = true,
          modifier = Modifier.fillMaxWidth()
        )

        Text("Select Color", style = MaterialTheme.typography.labelMedium)
        Row(
          horizontalArrangement = Arrangement.spacedBy(8.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          availableColors.forEach { hex ->
            val color = Color(android.graphics.Color.parseColor(hex))
            Box(
              modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(color)
                .border(
                  width = if (selectedColor == hex) 3.dp else 1.dp,
                  color = if (selectedColor == hex) MaterialTheme.colorScheme.onSurface else Color.Transparent,
                  shape = CircleShape
                )
                .clickable { selectedColor = hex }
            )
          }
        }
      }
    },
    confirmButton = {
      Button(
        onClick = {
          if (name.isNotBlank()) {
            onConfirm(name.trim(), code.trim(), teacher.trim(), credits.toIntOrNull() ?: 3, selectedColor)
          }
        },
        enabled = name.isNotBlank(),
        modifier = Modifier.testTag("button_confirm_subject")
      ) {
        Text("Save Subject")
      }
    },
    dismissButton = {
      TextButton(onClick = onDismiss) {
        Text("Cancel")
      }
    }
  )
}

@Composable
fun AddExpenseDialog(
  onDismiss: () -> Unit,
  onConfirm: (amount: Double, category: String, description: String, date: String) -> Unit
) {
  val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
  var amountStr by remember { mutableStateOf("") }
  var description by remember { mutableStateOf("") }
  var dateStr by remember { mutableStateOf(todayStr) }
  val categories = listOf("Food", "Transport", "Books", "College", "Fees", "Shopping", "Entertainment", "Other")
  var selectedCategory by remember { mutableStateOf(categories[0]) }

  AlertDialog(
    onDismissRequest = onDismiss,
    title = { Text("Record Expense", fontWeight = FontWeight.Bold) },
    text = {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        OutlinedTextField(
          value = amountStr,
          onValueChange = { amountStr = it },
          label = { Text("Amount (₹) *") },
          singleLine = true,
          modifier = Modifier.fillMaxWidth().testTag("input_expense_amount")
        )
        OutlinedTextField(
          value = description,
          onValueChange = { description = it },
          label = { Text("Description (e.g. Lunch, Metro)") },
          singleLine = true,
          modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
          value = dateStr,
          onValueChange = { dateStr = it },
          label = { Text("Date (YYYY-MM-DD)") },
          singleLine = true,
          modifier = Modifier.fillMaxWidth()
        )

        Text("Category", style = MaterialTheme.typography.labelMedium)
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          Column {
            categories.take(4).forEach { cat ->
              Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.clickable { selectedCategory = cat }
              ) {
                RadioButton(selected = selectedCategory == cat, onClick = { selectedCategory = cat })
                Text(cat, style = MaterialTheme.typography.bodySmall)
              }
            }
          }
          Column {
            categories.drop(4).forEach { cat ->
              Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.clickable { selectedCategory = cat }
              ) {
                RadioButton(selected = selectedCategory == cat, onClick = { selectedCategory = cat })
                Text(cat, style = MaterialTheme.typography.bodySmall)
              }
            }
          }
        }
      }
    },
    confirmButton = {
      Button(
        onClick = {
          val amt = amountStr.toDoubleOrNull()
          if (amt != null && amt > 0) {
            onConfirm(amt, selectedCategory, description.ifBlank { selectedCategory }, dateStr)
          }
        },
        enabled = (amountStr.toDoubleOrNull() ?: 0.0) > 0.0,
        modifier = Modifier.testTag("button_confirm_expense")
      ) {
        Text("Save Expense")
      }
    },
    dismissButton = {
      TextButton(onClick = onDismiss) {
        Text("Cancel")
      }
    }
  )
}

@Composable
fun AddQuickExpensePresetDialog(
  onDismiss: () -> Unit,
  onConfirm: (name: String, amount: Double, category: String, icon: String) -> Unit
) {
  var name by remember { mutableStateOf("") }
  var amountStr by remember { mutableStateOf("") }
  val categories = listOf("Transport", "Food", "College", "Books", "Other")
  var selectedCategory by remember { mutableStateOf(categories[0]) }
  val icons = listOf("🎫", "☕", "🚇", "🍛", "🖨️", "🥤", "🚌", "📖")
  var selectedIcon by remember { mutableStateOf(icons[0]) }

  AlertDialog(
    onDismissRequest = onDismiss,
    title = { Text("New Quick Expense Preset", fontWeight = FontWeight.Bold) },
    text = {
      Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        OutlinedTextField(
          value = name,
          onValueChange = { name = it },
          label = { Text("Name (e.g. Bus, Coffee) *") },
          singleLine = true,
          modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
          value = amountStr,
          onValueChange = { amountStr = it },
          label = { Text("Amount (₹) *") },
          singleLine = true,
          modifier = Modifier.fillMaxWidth()
        )

        Text("Select Icon", style = MaterialTheme.typography.labelMedium)
        Row(
          horizontalArrangement = Arrangement.spacedBy(8.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          icons.forEach { ic ->
            Surface(
              shape = RoundedCornerShape(8.dp),
              color = if (selectedIcon == ic) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
              modifier = Modifier.clickable { selectedIcon = ic }
            ) {
              Text(
                text = ic,
                modifier = Modifier.padding(8.dp)
              )
            }
          }
        }
      }
    },
    confirmButton = {
      Button(
        onClick = {
          val amt = amountStr.toDoubleOrNull()
          if (name.isNotBlank() && amt != null && amt > 0) {
            onConfirm(name.trim(), amt, selectedCategory, selectedIcon)
          }
        },
        enabled = name.isNotBlank() && (amountStr.toDoubleOrNull() ?: 0.0) > 0.0
      ) {
        Text("Add Preset")
      }
    },
    dismissButton = {
      TextButton(onClick = onDismiss) {
        Text("Cancel")
      }
    }
  )
}

@Composable
fun AddTaskDialog(
  subjects: List<SubjectEntity>,
  onDismiss: () -> Unit,
  onConfirm: (title: String, description: String, dueDate: String, priority: String, subjectId: Long?) -> Unit
) {
  val todayStr = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
  var title by remember { mutableStateOf("") }
  var description by remember { mutableStateOf("") }
  var dueDate by remember { mutableStateOf(todayStr) }
  val priorities = listOf("LOW", "MEDIUM", "HIGH")
  var selectedPriority by remember { mutableStateOf("MEDIUM") }
  var selectedSubjectId by remember { mutableStateOf<Long?>(subjects.firstOrNull()?.id) }

  AlertDialog(
    onDismissRequest = onDismiss,
    title = { Text("New Academic Task", fontWeight = FontWeight.Bold) },
    text = {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        OutlinedTextField(
          value = title,
          onValueChange = { title = it },
          label = { Text("Task Title *") },
          singleLine = true,
          modifier = Modifier.fillMaxWidth().testTag("input_task_title")
        )
        OutlinedTextField(
          value = description,
          onValueChange = { description = it },
          label = { Text("Description") },
          modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
          value = dueDate,
          onValueChange = { dueDate = it },
          label = { Text("Due Date (YYYY-MM-DD)") },
          singleLine = true,
          modifier = Modifier.fillMaxWidth()
        )

        Text("Priority", style = MaterialTheme.typography.labelMedium)
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
          priorities.forEach { p ->
            Surface(
              shape = RoundedCornerShape(8.dp),
              color = if (selectedPriority == p) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
              modifier = Modifier.clickable { selectedPriority = p }
            ) {
              Text(
                text = p,
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                style = MaterialTheme.typography.labelSmall
              )
            }
          }
        }

        if (subjects.isNotEmpty()) {
          Text("Related Subject", style = MaterialTheme.typography.labelMedium)
          Column {
            subjects.forEach { s ->
              Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.clickable { selectedSubjectId = s.id }
              ) {
                RadioButton(selected = selectedSubjectId == s.id, onClick = { selectedSubjectId = s.id })
                Text(s.name, style = MaterialTheme.typography.bodySmall)
              }
            }
          }
        }
      }
    },
    confirmButton = {
      Button(
        onClick = {
          if (title.isNotBlank()) {
            onConfirm(title.trim(), description.trim(), dueDate, selectedPriority, selectedSubjectId)
          }
        },
        enabled = title.isNotBlank()
      ) {
        Text("Save Task")
      }
    },
    dismissButton = {
      TextButton(onClick = onDismiss) {
        Text("Cancel")
      }
    }
  )
}
