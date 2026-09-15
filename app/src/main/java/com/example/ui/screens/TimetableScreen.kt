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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
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
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.components.AddTimetableClassDialog
import com.example.ui.viewmodel.CampusViewModel
import java.util.Calendar

@Composable
fun TimetableScreen(
  viewModel: CampusViewModel,
  modifier: Modifier = Modifier
) {
  val timetable by viewModel.timetable.collectAsStateWithLifecycle()
  val subjects by viewModel.subjects.collectAsStateWithLifecycle()

  val days = listOf("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday")
  var selectedDayIndex by remember {
    val cal = Calendar.getInstance()
    val d = when (cal.get(Calendar.DAY_OF_WEEK)) {
      Calendar.MONDAY -> 0
      Calendar.TUESDAY -> 1
      Calendar.WEDNESDAY -> 2
      Calendar.THURSDAY -> 3
      Calendar.FRIDAY -> 4
      Calendar.SATURDAY -> 5
      else -> 0
    }
    mutableIntStateOf(d)
  }

  var showAddClassDialog by remember { mutableStateOf(false) }

  val dayEntries = remember(timetable, selectedDayIndex) {
    val dayNumber = selectedDayIndex + 1
    timetable.filter { it.dayOfWeek == dayNumber }.sortedBy { it.startTime }
  }

  Box(modifier = modifier.fillMaxSize()) {
    Column(
      modifier = Modifier
        .fillMaxSize()
        .testTag("timetable_screen")
    ) {
      // Day Selector Pills (PRD Section 34)
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(6.dp)
      ) {
        days.forEachIndexed { index, dayName ->
          val isSelected = selectedDayIndex == index
          Surface(
            shape = RoundedCornerShape(12.dp),
            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface,
            tonalElevation = if (isSelected) 4.dp else 1.dp,
            modifier = Modifier
              .weight(1f)
              .clickable { selectedDayIndex = index }
              .testTag("day_tab_$index")
          ) {
            Column(
              modifier = Modifier.padding(vertical = 8.dp),
              horizontalAlignment = Alignment.CenterHorizontally
            ) {
              Text(
                text = dayName.take(3),
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface
              )
            }
          }
        }
      }

      // Schedule for selected day
      LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
      ) {
        item {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "${days[selectedDayIndex]} Schedule",
              style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
              color = MaterialTheme.colorScheme.onSurface
            )
            Text(
              text = "${dayEntries.size} class${if (dayEntries.size != 1) "es" else ""}",
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }

        if (dayEntries.isEmpty()) {
          item {
            Box(
              modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(MaterialTheme.colorScheme.surface)
                .padding(32.dp),
              contentAlignment = Alignment.Center
            ) {
              Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                  text = "No classes on ${days[selectedDayIndex]}",
                  style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                  color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                  text = "Tap the + button below to add a class to this day.",
                  style = MaterialTheme.typography.bodySmall,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            }
          }
        } else {
          items(dayEntries, key = { it.id }) { entry ->
            val sub = subjects.firstOrNull { it.id == entry.subjectId }
            val color = try {
              Color(android.graphics.Color.parseColor(sub?.colorHex ?: entry.colorHex))
            } catch (e: Exception) {
              MaterialTheme.colorScheme.primary
            }

            Card(
              shape = RoundedCornerShape(16.dp),
              colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
              elevation = CardDefaults.cardElevation(defaultElevation = 1.5.dp),
              modifier = Modifier.fillMaxWidth()
            ) {
              Row(
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
              ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                  // Time slot indicator column
                  Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.width(60.dp)
                  ) {
                    Text(
                      text = entry.startTime,
                      style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                      color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                      text = entry.endTime,
                      style = MaterialTheme.typography.labelSmall,
                      color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                  }

                  Box(
                    modifier = Modifier
                      .width(4.dp)
                      .height(44.dp)
                      .clip(RoundedCornerShape(2.dp))
                      .background(color)
                  )

                  Spacer(modifier = Modifier.width(12.dp))

                  // Class details
                  Column {
                    Text(
                      text = sub?.name ?: "Unknown Subject",
                      style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                      color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                      text = "${entry.room}${if (entry.teacher.isNotBlank()) " • ${entry.teacher}" else ""}",
                      style = MaterialTheme.typography.bodySmall,
                      color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                  }
                }

                // Delete button
                IconButton(
                  onClick = { viewModel.deleteTimetableEntry(entry.id) },
                  modifier = Modifier.size(36.dp)
                ) {
                  Icon(
                    imageVector = Icons.Default.Delete,
                    contentDescription = "Delete Class",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(18.dp)
                  )
                }
              }
            }
          }
        }
      }
    }

    // Add Class FAB
    FloatingActionButton(
      onClick = { showAddClassDialog = true },
      modifier = Modifier
        .align(Alignment.BottomEnd)
        .padding(end = 16.dp, bottom = 96.dp)
        .testTag("fab_add_timetable_class"),
      containerColor = MaterialTheme.colorScheme.primary,
      contentColor = Color.White
    ) {
      Icon(Icons.Default.Add, contentDescription = "Add Class")
    }
  }

  if (showAddClassDialog) {
    AddTimetableClassDialog(
      subjects = subjects,
      initialDay = selectedDayIndex + 1,
      onDismiss = { showAddClassDialog = false },
      onConfirm = { subId, day, start, end, room, teacher, colorHex ->
        viewModel.addTimetableEntry(subId, day, start, end, room, teacher, colorHex)
        showAddClassDialog = false
      }
    )
  }
}
