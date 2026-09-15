package com.example.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarViewMonth
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.ViewAgenda
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.local.entity.SubjectEntity
import com.example.data.local.entity.TimetableEntryEntity
import com.example.ui.components.AddTimetableClassDialog
import com.example.ui.viewmodel.CampusViewModel
import java.util.Calendar

enum class TimetableViewMode {
  DAY_LIST,
  CALENDAR_GRID
}

@Composable
fun TimetableScreen(
  viewModel: CampusViewModel,
  modifier: Modifier = Modifier
) {
  val timetable by viewModel.timetable.collectAsStateWithLifecycle()
  val subjects by viewModel.subjects.collectAsStateWithLifecycle()

  var viewMode by remember { mutableStateOf(TimetableViewMode.CALENDAR_GRID) }

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
  var addClassDayPreset by remember { mutableIntStateOf(1) }
  var selectedEntryForDetail by remember { mutableStateOf<TimetableEntryEntity?>(null) }

  Box(modifier = modifier.fillMaxSize()) {
    Column(
      modifier = Modifier
        .fillMaxSize()
        .testTag("timetable_screen")
    ) {
      // Top Controls Header: Mode Switcher (Day List vs Calendar Grid)
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 16.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Column {
          Text(
            text = "Academic Schedule",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.onSurface
          )
          Text(
            text = if (viewMode == TimetableViewMode.CALENDAR_GRID) "Weekly Calendar Matrix" else "${days[selectedDayIndex]} Schedule",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }

        // Notion-style Segmented View Switcher
        Surface(
          shape = RoundedCornerShape(8.dp),
          color = MaterialTheme.colorScheme.surfaceVariant,
          border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f))
        ) {
          Row(modifier = Modifier.padding(2.dp)) {
            // Calendar Grid Tab
            Surface(
              shape = RoundedCornerShape(6.dp),
              color = if (viewMode == TimetableViewMode.CALENDAR_GRID) MaterialTheme.colorScheme.primary else Color.Transparent,
              modifier = Modifier
                .clickable { viewMode = TimetableViewMode.CALENDAR_GRID }
                .testTag("tab_calendar_grid")
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                Icon(
                  imageVector = Icons.Default.CalendarViewMonth,
                  contentDescription = null,
                  modifier = Modifier.size(16.dp),
                  tint = if (viewMode == TimetableViewMode.CALENDAR_GRID) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                  text = "Grid",
                  style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                  color = if (viewMode == TimetableViewMode.CALENDAR_GRID) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            }

            // Day List Tab
            Surface(
              shape = RoundedCornerShape(6.dp),
              color = if (viewMode == TimetableViewMode.DAY_LIST) MaterialTheme.colorScheme.primary else Color.Transparent,
              modifier = Modifier
                .clickable { viewMode = TimetableViewMode.DAY_LIST }
                .testTag("tab_day_list")
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                Icon(
                  imageVector = Icons.Default.ViewAgenda,
                  contentDescription = null,
                  modifier = Modifier.size(16.dp),
                  tint = if (viewMode == TimetableViewMode.DAY_LIST) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                  text = "List",
                  style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                  color = if (viewMode == TimetableViewMode.DAY_LIST) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            }
          }
        }
      }

      Crossfade(targetState = viewMode, label = "timetableModeCrossfade") { mode ->
        when (mode) {
          TimetableViewMode.CALENDAR_GRID -> {
            // Notion-Style Calendar Grid: Weekdays on the left, Timings on top, Subjects inside
            TimetableCalendarGridView(
              days = days,
              timetable = timetable,
              subjects = subjects,
              onClassClick = { entry -> selectedEntryForDetail = entry },
              onEmptySlotClick = { dayIndex ->
                addClassDayPreset = dayIndex + 1
                showAddClassDialog = true
              },
              modifier = Modifier.fillMaxSize()
            )
          }

          TimetableViewMode.DAY_LIST -> {
            // Day list view
            TimetableDayListView(
              days = days,
              selectedDayIndex = selectedDayIndex,
              onSelectDayIndex = { selectedDayIndex = it },
              timetable = timetable,
              subjects = subjects,
              onDeleteEntry = { viewModel.deleteTimetableEntry(it) }
            )
          }
        }
      }
    }

    // Add Class FAB
    FloatingActionButton(
      onClick = {
        addClassDayPreset = selectedDayIndex + 1
        showAddClassDialog = true
      },
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

  // Class Detail Dialog (from clicking a grid cell)
  selectedEntryForDetail?.let { entry ->
    val sub = subjects.firstOrNull { it.id == entry.subjectId }
    AlertDialog(
      onDismissRequest = { selectedEntryForDetail = null },
      title = {
        Text(sub?.name ?: "Class Details", fontWeight = FontWeight.Bold)
      },
      text = {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.Schedule, contentDescription = null, modifier = Modifier.size(16.dp), tint = MaterialTheme.colorScheme.primary)
            Spacer(modifier = Modifier.width(6.dp))
            Text("${entry.startTime} – ${entry.endTime}", style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold))
          }

          if (entry.room.isNotBlank()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(Icons.Default.LocationOn, contentDescription = null, modifier = Modifier.size(16.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
              Spacer(modifier = Modifier.width(6.dp))
              Text("Room: ${entry.room}", style = MaterialTheme.typography.bodyMedium)
            }
          }

          if (entry.teacher.isNotBlank()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.size(16.dp), tint = MaterialTheme.colorScheme.onSurfaceVariant)
              Spacer(modifier = Modifier.width(6.dp))
              Text("Faculty: ${entry.teacher}", style = MaterialTheme.typography.bodyMedium)
            }
          }
        }
      },
      confirmButton = {
        TextButton(onClick = { selectedEntryForDetail = null }) {
          Text("Close")
        }
      },
      dismissButton = {
        TextButton(
          onClick = {
            viewModel.deleteTimetableEntry(entry.id)
            selectedEntryForDetail = null
          }
        ) {
          Text("Delete Class", color = MaterialTheme.colorScheme.error)
        }
      }
    )
  }

  // Add Class Dialog
  if (showAddClassDialog) {
    AddTimetableClassDialog(
      subjects = subjects,
      initialDay = addClassDayPreset,
      onDismiss = { showAddClassDialog = false },
      onConfirm = { subId, day, start, end, room, teacher, colorHex ->
        viewModel.addTimetableEntry(subId, day, start, end, room, teacher, colorHex)
        showAddClassDialog = false
      }
    )
  }
}

/**
 * Calendar Grid View:
 * - Weekdays on the left (Mon to Sat)
 * - Timing slots on top (09:00, 10:00, 11:00, 12:00, 13:00, 14:00)
 * - Subjects plotted as glassmorphic cards in grid cells
 */
@Composable
fun TimetableCalendarGridView(
  days: List<String>,
  timetable: List<TimetableEntryEntity>,
  subjects: List<SubjectEntity>,
  onClassClick: (TimetableEntryEntity) -> Unit,
  onEmptySlotClick: (Int) -> Unit,
  modifier: Modifier = Modifier
) {
  val timeSlots = listOf(
    "09:00" to "10:00",
    "10:00" to "11:00",
    "11:00" to "12:00",
    "12:00" to "13:00",
    "13:00" to "14:00",
    "14:00" to "15:00"
  )

  val horizontalScrollState = rememberScrollState()

  Column(
    modifier = modifier
      .fillMaxSize()
      .padding(bottom = 80.dp)
      .horizontalScroll(horizontalScrollState)
  ) {
    // Header Row: Top-left corner ("Day \ Time") + Time slot headers
    Row(
      modifier = Modifier
        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
        .padding(vertical = 8.dp)
    ) {
      // Left corner label
      Box(
        modifier = Modifier
          .width(72.dp)
          .padding(start = 12.dp),
        contentAlignment = Alignment.CenterStart
      ) {
        Text(
          text = "Day",
          style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }

      // Timing columns
      timeSlots.forEach { (start, end) ->
        Box(
          modifier = Modifier
            .width(115.dp)
            .padding(horizontal = 4.dp),
          contentAlignment = Alignment.Center
        ) {
          Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
              text = "$start – $end",
              style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
              color = MaterialTheme.colorScheme.onSurface
            )
          }
        }
      }
    }

    // Grid Rows: One row per weekday
    LazyColumn(
      modifier = Modifier.fillMaxSize(),
      contentPadding = PaddingValues(bottom = 32.dp)
    ) {
      items(days.size) { dayIndex ->
        val dayNumber = dayIndex + 1
        val dayName = days[dayIndex]

        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          // Left Weekday Column
          Box(
            modifier = Modifier
              .width(72.dp)
              .height(68.dp)
              .padding(start = 12.dp, end = 6.dp),
            contentAlignment = Alignment.CenterStart
          ) {
            Column {
              Text(
                text = dayName.take(3).uppercase(),
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.ExtraBold),
                color = MaterialTheme.colorScheme.onSurface
              )
              Text(
                text = "Day $dayNumber",
                style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
          }

          // Cells for each time slot
          timeSlots.forEach { (start, _) ->
            // Find timetable entry matching day and time
            val entry = timetable.firstOrNull {
              it.dayOfWeek == dayNumber && it.startTime.startsWith(start.take(2))
            }

            Box(
              modifier = Modifier
                .width(115.dp)
                .height(68.dp)
                .padding(3.dp)
            ) {
              if (entry != null) {
                val sub = subjects.firstOrNull { it.id == entry.subjectId }
                val parsedColor = try {
                  Color(android.graphics.Color.parseColor(sub?.colorHex ?: entry.colorHex))
                } catch (e: Exception) {
                  MaterialTheme.colorScheme.primary
                }

                Surface(
                  shape = RoundedCornerShape(8.dp),
                  color = MaterialTheme.colorScheme.surface,
                  border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                  modifier = Modifier
                    .fillMaxSize()
                    .clickable { onClassClick(entry) }
                ) {
                  Row(
                    modifier = Modifier
                      .fillMaxSize()
                      .padding(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                  ) {
                    Box(
                      modifier = Modifier
                        .width(3.dp)
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(1.5.dp))
                        .background(parsedColor)
                    )
                    Spacer(modifier = Modifier.width(5.dp))
                    Column(
                      modifier = Modifier.weight(1f),
                      verticalArrangement = Arrangement.Center
                    ) {
                      Text(
                        text = sub?.name ?: "Class",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        color = MaterialTheme.colorScheme.onSurface
                      )
                      Text(
                        text = entry.room.ifEmpty { "Online" },
                        style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                      )
                    }
                  }
                }
              } else {
                // Empty slot
                Surface(
                  shape = RoundedCornerShape(8.dp),
                  color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
                  border = BorderStroke(0.5.dp, MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f)),
                  modifier = Modifier
                    .fillMaxSize()
                    .clickable { onEmptySlotClick(dayIndex) }
                ) {
                  Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                  ) {
                    Text(
                      text = "+",
                      style = MaterialTheme.typography.labelSmall,
                      color = MaterialTheme.colorScheme.outline
                    )
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

/**
 * Traditional Day List View
 */
@Composable
fun TimetableDayListView(
  days: List<String>,
  selectedDayIndex: Int,
  onSelectDayIndex: (Int) -> Unit,
  timetable: List<TimetableEntryEntity>,
  subjects: List<SubjectEntity>,
  onDeleteEntry: (Long) -> Unit
) {
  val dayEntries = remember(timetable, selectedDayIndex) {
    val dayNumber = selectedDayIndex + 1
    timetable.filter { it.dayOfWeek == dayNumber }.sortedBy { it.startTime }
  }

  Column(modifier = Modifier.fillMaxSize()) {
    // Day Selector Pills
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp, vertical = 8.dp),
      horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
      days.forEachIndexed { index, dayName ->
        val isSelected = selectedDayIndex == index
        Surface(
          shape = RoundedCornerShape(10.dp),
          color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface,
          border = BorderStroke(1.dp, if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline),
          modifier = Modifier
            .weight(1f)
            .clickable { onSelectDayIndex(index) }
            .testTag("day_tab_$index")
        ) {
          Column(
            modifier = Modifier.padding(vertical = 8.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            Text(
              text = dayName.take(3),
              style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
              color = if (isSelected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
            )
          }
        }
      }
    }

    // Schedule for selected day
    LazyColumn(
      modifier = Modifier.fillMaxSize(),
      contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 96.dp),
      verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      item {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "${days[selectedDayIndex]} Classes",
            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
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
          Card(
            shape = RoundedCornerShape(14.dp),
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = Modifier.fillMaxWidth()
          ) {
            Column(
              modifier = Modifier
                .fillMaxWidth()
                .padding(28.dp),
              horizontalAlignment = Alignment.CenterHorizontally
            ) {
              Text(
                text = "No classes scheduled",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.onSurface
              )
              Spacer(modifier = Modifier.height(4.dp))
              Text(
                text = "Tap the + button to add a new lecture or lab.",
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
            shape = RoundedCornerShape(14.dp),
            border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = Modifier.fillMaxWidth()
          ) {
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                Column(
                  horizontalAlignment = Alignment.CenterHorizontally,
                  modifier = Modifier.width(54.dp)
                ) {
                  Text(
                    text = entry.startTime,
                    style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                  )
                  Text(
                    text = entry.endTime,
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                  )
                }

                Box(
                  modifier = Modifier
                    .width(3.dp)
                    .height(38.dp)
                    .clip(RoundedCornerShape(1.5.dp))
                    .background(color)
                )

                Spacer(modifier = Modifier.width(10.dp))

                Column {
                  Text(
                    text = sub?.name ?: "Class",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                  )
                  Text(
                    text = "${entry.room}${if (entry.teacher.isNotBlank()) " • ${entry.teacher}" else ""}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                  )
                }
              }

              IconButton(
                onClick = { onDeleteEntry(entry.id) },
                modifier = Modifier.size(32.dp)
              ) {
                Icon(
                  imageVector = Icons.Default.Delete,
                  contentDescription = "Delete Class",
                  tint = MaterialTheme.colorScheme.onSurfaceVariant,
                  modifier = Modifier.size(16.dp)
                )
              }
            }
          }
        }
      }
    }
  }
}
