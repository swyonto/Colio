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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.BeachAccess
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.ExpandLess
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
import com.example.data.local.entity.AttendanceSessionEntity
import com.example.data.repository.SubjectAttendance
import com.example.ui.components.AddSubjectDialog
import com.example.ui.theme.StatusAbsent
import com.example.ui.theme.StatusHoliday
import com.example.ui.theme.StatusPresent
import com.example.ui.viewmodel.CampusViewModel
import com.example.ui.viewmodel.SubScreen

@Composable
fun AttendanceScreen(
  viewModel: CampusViewModel,
  modifier: Modifier = Modifier
) {
  val summary by viewModel.overallAttendanceSummary.collectAsStateWithLifecycle()
  val subjectAttendanceList by viewModel.subjectAttendanceList.collectAsStateWithLifecycle()
  val allSessions by viewModel.allSessions.collectAsStateWithLifecycle()

  var showAddSubjectDialog by remember { mutableStateOf(false) }
  var expandedSubjectId by remember { mutableStateOf<Long?>(null) }

  Box(modifier = modifier.fillMaxSize()) {
    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .testTag("attendance_screen_list"),
      contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 96.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      // Overall Attendance Summary & Prediction Banner (PRD Section 10 & 17)
      item {
        Card(
          shape = RoundedCornerShape(16.dp),
          border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
          colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
          elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
          Column(modifier = Modifier.padding(20.dp)) {
            Text(
              text = "Overall Attendance",
              style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(8.dp))

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.Bottom
            ) {
              Text(
                text = "${String.format("%.1f", summary.overallPercentage)}%",
                style = MaterialTheme.typography.displayMedium.copy(
                  fontWeight = FontWeight.Bold,
                  letterSpacing = (-1).sp
                ),
                color = MaterialTheme.colorScheme.onSurface
              )

              Text(
                text = if (summary.overallPercentage >= 75f) "Target: 75% • Met" else "Target: 75% • Below",
                style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                color = if (summary.overallPercentage >= 75f) StatusPresent else StatusAbsent
              )
            }

            Spacer(modifier = Modifier.height(12.dp))

            LinearProgressIndicator(
              progress = { (summary.overallPercentage / 100f).coerceIn(0f, 1f) },
              modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(RoundedCornerShape(3.dp)),
              color = if (summary.overallPercentage >= 75f) StatusPresent else StatusAbsent,
              trackColor = MaterialTheme.colorScheme.surfaceVariant
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Prediction Notice
            Surface(
              shape = RoundedCornerShape(10.dp),
              color = MaterialTheme.colorScheme.surfaceVariant
            ) {
              Row(
                modifier = Modifier
                  .fillMaxWidth()
                  .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                Icon(
                  imageVector = if (summary.overallPercentage >= 75f) Icons.Default.CheckCircle else Icons.Default.Warning,
                  contentDescription = null,
                  tint = if (summary.overallPercentage >= 75f) StatusPresent else StatusAbsent,
                  modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                  text = if (summary.overallPercentage >= 75f) {
                    "You can miss ${summary.classesCanMiss} more class${if (summary.classesCanMiss > 1) "es" else ""} before falling below 75%."
                  } else {
                    "You must attend ${summary.classesNeededForTarget} consecutive classes to reach 75%."
                  },
                  style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
                  color = MaterialTheme.colorScheme.onSurface
                )
              }
            }
          }
        }
      }

      // Section Header: Subjects List (PRD Section 10)
      item {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Text(
            text = "Subjects",
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.onSurface
          )

          Text(
            text = "${subjectAttendanceList.size} subjects",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }
      }

      // Subject Cards with 1-Tap Quick Mark & Detailed Attendance History (PRD Section 11 & 18)
      items(subjectAttendanceList, key = { it.subject.id }) { item ->
        val subColor = try {
          Color(android.graphics.Color.parseColor(item.subject.colorHex))
        } catch (e: Exception) {
          MaterialTheme.colorScheme.primary
        }

        val isExpanded = expandedSubjectId == item.subject.id
        val subjectSessions = remember(allSessions, item.subject.id) {
          allSessions.filter { it.subjectId == item.subject.id }.sortedByDescending { it.date }
        }

        Card(
          shape = RoundedCornerShape(16.dp),
          border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
          colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
          elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(modifier = Modifier.padding(16.dp)) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                  modifier = Modifier
                    .size(12.dp)
                    .clip(CircleShape)
                    .background(subColor)
                )
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                  Text(
                    text = item.subject.name,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                  )
                  Text(
                    text = "${item.subject.code} • ${item.subject.teacher}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                  )
                }
              }

              Text(
                text = "${String.format("%.0f", item.percentage)}%",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold),
                color = if (item.percentage >= 75f) StatusPresent else StatusAbsent
              )
            }

            Spacer(modifier = Modifier.height(10.dp))

            LinearProgressIndicator(
              progress = { (item.percentage / 100f).coerceIn(0f, 1f) },
              modifier = Modifier
                .fillMaxWidth()
                .height(6.dp)
                .clip(RoundedCornerShape(3.dp)),
              color = if (item.percentage >= 75f) StatusPresent else StatusAbsent,
              trackColor = MaterialTheme.colorScheme.surfaceVariant
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Present / Absent / Denominator Stats
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text(
                text = "Present: ${item.presentCount}  |  Absent: ${item.absentCount}  |  Total: ${item.presentCount + item.absentCount}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )

              if (item.canMiss > 0) {
                Text(
                  text = "Can miss ${item.canMiss}",
                  style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                  color = StatusPresent
                )
              } else if (item.neededForTarget > 0) {
                Text(
                  text = "Need ${item.neededForTarget}",
                  style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                  color = StatusAbsent
                )
              }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Quick Mark Attendance
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              Surface(
                modifier = Modifier
                  .weight(1f)
                  .clickable { viewModel.markQuickAttendance(item.subject.id, "09:00 - 10:00", "PRESENT") },
                shape = RoundedCornerShape(8.dp),
                color = StatusPresent.copy(alpha = 0.12f),
                border = BorderStroke(1.dp, StatusPresent.copy(alpha = 0.3f))
              ) {
                Row(
                  modifier = Modifier.padding(vertical = 8.dp),
                  horizontalArrangement = Arrangement.Center,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Icon(Icons.Default.Check, contentDescription = null, tint = StatusPresent, modifier = Modifier.size(15.dp))
                  Spacer(modifier = Modifier.width(4.dp))
                  Text(
                    text = "Present",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = StatusPresent
                  )
                }
              }

              Surface(
                modifier = Modifier
                  .weight(1f)
                  .clickable { viewModel.markQuickAttendance(item.subject.id, "09:00 - 10:00", "ABSENT") },
                shape = RoundedCornerShape(8.dp),
                color = StatusAbsent.copy(alpha = 0.12f),
                border = BorderStroke(1.dp, StatusAbsent.copy(alpha = 0.3f))
              ) {
                Row(
                  modifier = Modifier.padding(vertical = 8.dp),
                  horizontalArrangement = Arrangement.Center,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Icon(Icons.Default.Close, contentDescription = null, tint = StatusAbsent, modifier = Modifier.size(15.dp))
                  Spacer(modifier = Modifier.width(4.dp))
                  Text(
                    text = "Absent",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = StatusAbsent
                  )
                }
              }

              Surface(
                modifier = Modifier
                  .weight(1f)
                  .clickable { viewModel.markQuickAttendance(item.subject.id, "09:00 - 10:00", "HOLIDAY") },
                shape = RoundedCornerShape(8.dp),
                color = StatusHoliday.copy(alpha = 0.12f),
                border = BorderStroke(1.dp, StatusHoliday.copy(alpha = 0.3f))
              ) {
                Row(
                  modifier = Modifier.padding(vertical = 8.dp),
                  horizontalArrangement = Arrangement.Center,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Icon(Icons.Default.CalendarMonth, contentDescription = null, tint = StatusHoliday, modifier = Modifier.size(15.dp))
                  Spacer(modifier = Modifier.width(4.dp))
                  Text(
                    text = "Holiday",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                    color = StatusHoliday
                  )
                }
              }
            }

            // Expand history toggle (PRD Section 11: Attendance History Table)
            Spacer(modifier = Modifier.height(8.dp))
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .clickable { expandedSubjectId = if (isExpanded) null else item.subject.id }
                .padding(vertical = 4.dp),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text(
                text = if (isExpanded) "Hide Attendance History" else "View Attendance History (${subjectSessions.size} entries)",
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.primary
              )
              Icon(
                imageVector = if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(18.dp)
              )
            }

            // Attendance Table (PRD Section 11)
            if (isExpanded) {
              Spacer(modifier = Modifier.height(8.dp))
              Column(
                modifier = Modifier
                  .fillMaxWidth()
                  .clip(RoundedCornerShape(10.dp))
                  .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                  .padding(10.dp),
                verticalArrangement = Arrangement.spacedBy(6.dp)
              ) {
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween
                ) {
                  Text("Date", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                  Text("Status", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold))
                }

                subjectSessions.take(15).forEach { session ->
                  Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                  ) {
                    Text(session.date, style = MaterialTheme.typography.bodySmall)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                      val tagBg = when (session.status) {
                        "PRESENT" -> Color(0xFFDCFCE7)
                        "ABSENT" -> Color(0xFFFEE2E2)
                        else -> Color(0xFFFFEDD5)
                      }
                      val tagColor = when (session.status) {
                        "PRESENT" -> StatusPresent
                        "ABSENT" -> StatusAbsent
                        else -> StatusHoliday
                      }
                      Box(
                        modifier = Modifier
                          .clip(RoundedCornerShape(6.dp))
                          .background(tagBg)
                          .padding(horizontal = 8.dp, vertical = 2.dp)
                      ) {
                        Text(session.status, style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), color = tagColor)
                      }
                      Spacer(modifier = Modifier.width(6.dp))
                      Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete record",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier
                          .size(16.dp)
                          .clickable { viewModel.deleteAttendanceSession(session.id) }
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

    // Floating Action Button: Add Subject
    FloatingActionButton(
      onClick = { showAddSubjectDialog = true },
      modifier = Modifier
        .align(Alignment.BottomEnd)
        .padding(end = 16.dp, bottom = 96.dp)
        .testTag("fab_add_subject"),
      containerColor = MaterialTheme.colorScheme.primary,
      contentColor = Color.White
    ) {
      Icon(Icons.Default.Add, contentDescription = "Add Subject")
    }
  }

  if (showAddSubjectDialog) {
    AddSubjectDialog(
      onDismiss = { showAddSubjectDialog = false },
      onConfirm = { name, code, teacher, credits, colorHex ->
        viewModel.addSubject(name, code, teacher, credits, colorHex)
        showAddSubjectDialog = false
      }
    )
  }
}
