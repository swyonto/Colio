package com.example.ui.components

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.waitForUpOrCancellation
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
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.StatusAbsent
import com.example.ui.theme.StatusPresent
import com.example.ui.theme.glassmorphic
import com.example.ui.viewmodel.TodayClassItem

@Composable
fun TimetableCard(
  todayClasses: List<TodayClassItem>,
  onViewMoreClick: () -> Unit,
  onQuickMarkAttendance: (subjectId: Long, timeSlot: String, status: String) -> Unit,
  modifier: Modifier = Modifier
) {
  var isPressed by remember { mutableStateOf(false) }
  val scale by animateFloatAsState(
    targetValue = if (isPressed) 0.98f else 1.0f,
    animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium),
    label = "timetableCardScale"
  )

  Card(
    modifier = modifier
      .fillMaxWidth()
      .scale(scale)
      .glassmorphic(shape = RoundedCornerShape(16.dp))
      .pointerInput(Unit) {
        awaitPointerEventScope {
          while (true) {
            awaitFirstDown(requireUnconsumed = false)
            isPressed = true
            val up = waitForUpOrCancellation()
            isPressed = false
            if (up != null) {
              onViewMoreClick()
            }
          }
        }
      }
      .testTag("dashboard_timetable_card"),
    shape = RoundedCornerShape(16.dp),
    colors = CardDefaults.cardColors(
      containerColor = Color.Transparent
    ),
    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
  ) {
    Column(
      modifier = Modifier.padding(18.dp)
    ) {
      // Top Row: Title on Left, View Action ON TOP
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.CalendarMonth,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(20.dp)
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = "Today's Classes",
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
            text = "View Schedule",
            style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
            color = MaterialTheme.colorScheme.primary
          )
          Spacer(modifier = Modifier.width(4.dp))
          Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
            contentDescription = null,
            modifier = Modifier.size(15.dp),
            tint = MaterialTheme.colorScheme.primary
          )
        }
      }

      Spacer(modifier = Modifier.height(14.dp))

      if (todayClasses.isEmpty()) {
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(14.dp),
          contentAlignment = Alignment.Center
        ) {
          Text(
            text = "No classes scheduled for today",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )
        }
      } else {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
          todayClasses.forEach { item ->
            val parsedColor = try {
              Color(android.graphics.Color.parseColor(item.colorHex))
            } catch (e: Exception) {
              MaterialTheme.colorScheme.primary
            }

            val cardBg = when {
              item.isCurrent -> MaterialTheme.colorScheme.primaryContainer
              item.isNext -> MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.5f)
              else -> MaterialTheme.colorScheme.surfaceVariant
            }

            Box(
              modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(cardBg)
                .padding(12.dp)
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
                      style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                      color = MaterialTheme.colorScheme.onSurface
                    )
                  }

                  if (item.isCurrent) {
                    Text(
                      text = "NOW",
                      style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                      color = MaterialTheme.colorScheme.primary
                    )
                  } else if (item.isNext) {
                    Text(
                      text = "NEXT",
                      style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                      color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                  }
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                  text = item.subjectName,
                  style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
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

                  val timeSlot = "${item.entry.startTime} - ${item.entry.endTime}"
                  if (item.todaySession != null) {
                    val statusBg = when (item.todaySession.status) {
                      "PRESENT" -> StatusPresent.copy(alpha = 0.15f)
                      "ABSENT" -> StatusAbsent.copy(alpha = 0.15f)
                      else -> Color(0xFFFFEDD5)
                    }
                    val statusColor = when (item.todaySession.status) {
                      "PRESENT" -> StatusPresent
                      "ABSENT" -> StatusAbsent
                      else -> Color(0xFFEA580C)
                    }
                    Box(
                      modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(statusBg)
                        .padding(horizontal = 8.dp, vertical = 2.dp)
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
                          .background(StatusPresent.copy(alpha = 0.15f))
                          .clickable { onQuickMarkAttendance(item.entry.subjectId, timeSlot, "PRESENT") }
                          .padding(horizontal = 8.dp, vertical = 3.dp),
                        contentAlignment = Alignment.Center
                      ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                          Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = null,
                            tint = StatusPresent,
                            modifier = Modifier.size(12.dp)
                          )
                          Spacer(modifier = Modifier.width(3.dp))
                          Text(
                            text = "Present",
                            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                            color = StatusPresent
                          )
                        }
                      }
                      Box(
                        modifier = Modifier
                          .clip(RoundedCornerShape(6.dp))
                          .background(StatusAbsent.copy(alpha = 0.15f))
                          .clickable { onQuickMarkAttendance(item.entry.subjectId, timeSlot, "ABSENT") }
                          .padding(horizontal = 8.dp, vertical = 3.dp),
                        contentAlignment = Alignment.Center
                      ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                          Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = null,
                            tint = StatusAbsent,
                            modifier = Modifier.size(12.dp)
                          )
                          Spacer(modifier = Modifier.width(3.dp))
                          Text(
                            text = "Absent",
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
}
