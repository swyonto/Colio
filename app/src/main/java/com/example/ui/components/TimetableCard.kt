package com.example.ui.components

import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.StatusAbsent
import com.example.ui.theme.StatusPresent
import com.example.ui.viewmodel.TodayClassItem

@Composable
fun TimetableCard(
  todayClasses: List<TodayClassItem>,
  onViewMoreClick: () -> Unit,
  onQuickMarkAttendance: (subjectId: Long, timeSlot: String, status: String) -> Unit,
  modifier: Modifier = Modifier
) {
  Card(
    modifier = modifier
      .fillMaxWidth()
      .testTag("dashboard_timetable_card"),
    shape = RoundedCornerShape(20.dp),
    colors = CardDefaults.cardColors(
      containerColor = MaterialTheme.colorScheme.surface
    ),
    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
  ) {
    Column(
      modifier = Modifier.padding(20.dp)
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Box(
            modifier = Modifier
              .size(32.dp)
              .clip(RoundedCornerShape(8.dp))
              .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center
          ) {
            Icon(
              imageVector = Icons.Default.CalendarMonth,
              contentDescription = null,
              tint = MaterialTheme.colorScheme.primary,
              modifier = Modifier.size(18.dp)
            )
          }
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = "Today's Timetable",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
            color = MaterialTheme.colorScheme.onSurface
          )
        }

        Row(
          verticalAlignment = Alignment.CenterVertically,
          modifier = Modifier
            .clickable(onClick = onViewMoreClick)
            .testTag("view_timetable_link")
        ) {
          Text(
            text = "View More",
            style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.SemiBold),
            color = MaterialTheme.colorScheme.primary
          )
          Spacer(modifier = Modifier.width(4.dp))
          Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
            contentDescription = null,
            modifier = Modifier.size(16.dp),
            tint = MaterialTheme.colorScheme.primary
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      if (todayClasses.isEmpty()) {
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(16.dp),
          contentAlignment = Alignment.Center
        ) {
          Text(
            text = "No classes scheduled for today 🎉",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }
      } else {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
          todayClasses.forEach { item ->
            val parsedColor = try {
              Color(android.graphics.Color.parseColor(item.colorHex))
            } catch (e: Exception) {
              MaterialTheme.colorScheme.primary
            }

            val isHighlighted = item.isCurrent || item.isNext
            val cardBg = when {
              item.isCurrent -> MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.5f)
              item.isNext -> MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.4f)
              else -> MaterialTheme.colorScheme.surfaceVariant
            }

            Box(
              modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(cardBg)
                .padding(14.dp)
            ) {
              Column {
                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                      modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(parsedColor)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                      text = "${item.entry.startTime} – ${item.entry.endTime}",
                      style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                      color = MaterialTheme.colorScheme.onSurface
                    )
                  }

                  if (item.isCurrent) {
                    Box(
                      modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(MaterialTheme.colorScheme.primary)
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                      Text(
                        text = "CURRENT CLASS",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = Color.White
                      )
                    }
                  } else if (item.isNext) {
                    Box(
                      modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(MaterialTheme.colorScheme.secondary)
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                      Text(
                        text = "NEXT CLASS",
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = Color.White
                      )
                    }
                  }
                }

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                  text = item.subjectName,
                  style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                  color = MaterialTheme.colorScheme.onSurface
                )

                Row(
                  modifier = Modifier.fillMaxWidth(),
                  horizontalArrangement = Arrangement.SpaceBetween,
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Text(
                    text = "${item.entry.room}${if (item.entry.teacher.isNotEmpty()) " • ${item.entry.teacher}" else ""}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                  )

                  // Attendance status or quick mark buttons for today
                  val timeSlot = "${item.entry.startTime} - ${item.entry.endTime}"
                  if (item.todaySession != null) {
                    val statusBg = when (item.todaySession.status) {
                      "PRESENT" -> Color(0xFFDCFCE7)
                      "ABSENT" -> Color(0xFFFEE2E2)
                      else -> Color(0xFFFFEDD5)
                    }
                    val statusColor = when (item.todaySession.status) {
                      "PRESENT" -> StatusPresent
                      "ABSENT" -> StatusAbsent
                      else -> Color(0xFFEA580C)
                    }
                    Box(
                      modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(statusBg)
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                      Text(
                        text = item.todaySession.status,
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = statusColor
                      )
                    }
                  } else {
                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                      Box(
                        modifier = Modifier
                          .clip(RoundedCornerShape(6.dp))
                          .background(Color(0xFFDCFCE7))
                          .clickable { onQuickMarkAttendance(item.entry.subjectId, timeSlot, "PRESENT") }
                          .padding(horizontal = 8.dp, vertical = 3.dp)
                      ) {
                        Text(
                          text = "✓ Present",
                          style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                          color = StatusPresent
                        )
                      }
                      Box(
                        modifier = Modifier
                          .clip(RoundedCornerShape(6.dp))
                          .background(Color(0xFFFEE2E2))
                          .clickable { onQuickMarkAttendance(item.entry.subjectId, timeSlot, "ABSENT") }
                          .padding(horizontal = 8.dp, vertical = 3.dp)
                      ) {
                        Text(
                          text = "✕ Absent",
                          style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                          color = StatusAbsent
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
  }
}
