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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Extension
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
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
import com.example.ui.viewmodel.CampusViewModel

data class SemGrade(val sem: String, var sgpa: String, var credits: String)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddonsScreen(
  viewModel: CampusViewModel,
  onBack: () -> Unit,
  modifier: Modifier = Modifier
) {
  val addons by viewModel.addons.collectAsStateWithLifecycle()
  val pomodoroSeconds by viewModel.pomodoroSecondsLeft.collectAsStateWithLifecycle()
  val isPomodoroRunning by viewModel.pomodoroIsRunning.collectAsStateWithLifecycle()

  // CGPA Calculator State
  val semesters = remember {
    mutableStateListOf(
      SemGrade("Sem 1", "8.20", "22"),
      SemGrade("Sem 2", "8.40", "24"),
      SemGrade("Sem 3", "8.65", "22"),
      SemGrade("Sem 4", "8.72", "24")
    )
  }

  // Calculated CGPA
  val calculatedCgpa = remember(semesters.map { it.sgpa to it.credits }) {
    var totalCreditPoints = 0.0
    var totalCredits = 0.0
    for (s in semesters) {
      val g = s.sgpa.toDoubleOrNull() ?: 0.0
      val c = s.credits.toDoubleOrNull() ?: 0.0
      if (g > 0 && c > 0) {
        totalCreditPoints += g * c
        totalCredits += c
      }
    }
    if (totalCredits > 0) totalCreditPoints / totalCredits else 0.0
  }

  Column(modifier = modifier.fillMaxSize()) {
    TopAppBar(
      title = { Text("Add-ons & Academic Tools", fontWeight = FontWeight.Bold) },
      navigationIcon = {
        IconButton(onClick = onBack) {
          Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
        }
      }
    )

    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .testTag("addons_screen"),
      contentPadding = PaddingValues(16.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      // 1. Pomodoro Focus Timer Tool (PRD Section 45)
      item {
        Card(
          shape = RoundedCornerShape(16.dp),
          border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
          colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
          elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
          modifier = Modifier.fillMaxWidth().testTag("pomodoro_tool_card")
        ) {
          Column(
            modifier = Modifier.padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                  modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFFFEF3C7)),
                  contentAlignment = Alignment.Center
                ) {
                  Icon(Icons.Default.Timer, contentDescription = null, tint = Color(0xFFD97706), modifier = Modifier.size(20.dp))
                }
                Spacer(modifier = Modifier.width(10.dp))
                Text("Pomodoro Focus Timer", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
              }

              Box(
                modifier = Modifier
                  .clip(RoundedCornerShape(8.dp))
                  .background(if (isPomodoroRunning) Color(0xFFDCFCE7) else MaterialTheme.colorScheme.surfaceVariant)
                  .padding(horizontal = 8.dp, vertical = 4.dp)
              ) {
                Text(
                  text = if (isPomodoroRunning) "Focusing" else "Paused",
                  style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                  color = if (isPomodoroRunning) Color(0xFF16A34A) else MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            }

            Spacer(modifier = Modifier.height(16.dp))

            val minutes = pomodoroSeconds / 60
            val seconds = pomodoroSeconds % 60
            val timeFormatted = String.format("%02d:%02d", minutes, seconds)

            Text(
              text = timeFormatted,
              style = MaterialTheme.typography.displayLarge.copy(
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = (-1).sp
              ),
              color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(16.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
              Button(
                onClick = { viewModel.togglePomodoro() },
                modifier = Modifier.testTag("button_pomodoro_toggle")
              ) {
                Icon(if (isPomodoroRunning) Icons.Default.Pause else Icons.Default.PlayArrow, contentDescription = null)
                Spacer(modifier = Modifier.width(6.dp))
                Text(if (isPomodoroRunning) "Pause" else "Start Focus")
              }

              OutlinedButton(
                onClick = { viewModel.resetPomodoro() },
                modifier = Modifier.testTag("button_pomodoro_reset")
              ) {
                Icon(Icons.Default.Refresh, contentDescription = null)
                Spacer(modifier = Modifier.width(6.dp))
                Text("Reset")
              }
            }
          }
        }
      }

      // 2. CGPA / SGPA Academic Calculator (PRD Section 45)
      item {
        Card(
          shape = RoundedCornerShape(16.dp),
          border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
          colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
          elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
          modifier = Modifier.fillMaxWidth().testTag("cgpa_calculator_card")
        ) {
          Column(modifier = Modifier.padding(20.dp)) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                  modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFFEEF2FF)),
                  contentAlignment = Alignment.Center
                ) {
                  Icon(Icons.Default.Calculate, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                }
                Spacer(modifier = Modifier.width(10.dp))
                Text("CGPA & GPA Calculator", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
              }

              Text(
                text = "CGPA: ${String.format("%.2f", calculatedCgpa)}",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold),
                color = MaterialTheme.colorScheme.primary
              )
            }

            Spacer(modifier = Modifier.height(14.dp))

            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
              semesters.forEachIndexed { idx, s ->
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.spacedBy(8.dp),
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Text(s.sem, modifier = Modifier.width(55.dp), style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))

                  OutlinedTextField(
                    value = s.sgpa,
                    onValueChange = { newVal ->
                      semesters[idx] = s.copy(sgpa = newVal)
                    },
                    label = { Text("SGPA") },
                    singleLine = true,
                    modifier = Modifier.weight(1f)
                  )

                  OutlinedTextField(
                    value = s.credits,
                    onValueChange = { newVal ->
                      semesters[idx] = s.copy(credits = newVal)
                    },
                    label = { Text("Credits") },
                    singleLine = true,
                    modifier = Modifier.weight(1f)
                  )
                }
              }
            }

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedButton(
              onClick = {
                semesters.add(SemGrade("Sem ${semesters.size + 1}", "8.50", "22"))
              },
              modifier = Modifier.fillMaxWidth()
            ) {
              Text("+ Add Another Semester")
            }
          }
        }
      }

      // 3. Enabled Add-ons Settings List (PRD Section 44)
      item {
        Text("Installed Add-ons & Modular Features", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))
      }

      items(addons, key = { it.id }) { addon ->
        Card(
          shape = RoundedCornerShape(14.dp),
          border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
          colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
          elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column(modifier = Modifier.weight(1f)) {
              Text(addon.name, style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold))
              Text(addon.description, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }

            Switch(
              checked = addon.isEnabled,
              onCheckedChange = { isChecked ->
                viewModel.toggleAddon(addon.id, isChecked)
              }
            )
          }
        }
      }
    }
  }
}
