package com.example.ui.components

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.BorderStroke
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
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
import com.example.data.repository.AttendanceSummary
import com.example.ui.theme.CampusOutline
import com.example.ui.theme.StatusAbsent
import com.example.ui.theme.StatusPresent

@Composable
fun AttendanceCard(
  summary: AttendanceSummary,
  onViewAttendanceClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  AttendanceCard(
    overallPercentage = summary.overallPercentage,
    classesCanMiss = summary.classesCanMiss,
    classesNeededForTarget = summary.classesNeededForTarget,
    totalPresent = summary.presentClasses,
    totalAbsent = summary.absentClasses,
    onViewAttendanceClick = onViewAttendanceClick,
    modifier = modifier
  )
}

@Composable
fun AttendanceCard(
  overallPercentage: Float,
  classesCanMiss: Int,
  classesNeededForTarget: Int,
  totalPresent: Int,
  totalAbsent: Int,
  onViewAttendanceClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  var isPressed by remember { mutableStateOf(false) }
  val scale by animateFloatAsState(
    targetValue = if (isPressed) 0.98f else 1.0f,
    animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium),
    label = "cardScale"
  )

  Card(
    modifier = modifier
      .fillMaxWidth()
      .scale(scale)
      .pointerInput(Unit) {
        awaitPointerEventScope {
          while (true) {
            awaitFirstDown(requireUnconsumed = false)
            isPressed = true
            val up = waitForUpOrCancellation()
            isPressed = false
            if (up != null) {
              onViewAttendanceClick()
            }
          }
        }
      }
      .testTag("dashboard_attendance_card"),
    shape = RoundedCornerShape(16.dp),
    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
    colors = CardDefaults.cardColors(
      containerColor = MaterialTheme.colorScheme.surface
    ),
    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
  ) {
    Column(
      modifier = Modifier.padding(18.dp)
    ) {
      // Top Row: Title on Left, View Attendance Action ON TOP
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.CheckCircle,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(20.dp)
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = "Attendance",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
            color = MaterialTheme.colorScheme.onSurface
          )
        }

        Row(
          verticalAlignment = Alignment.CenterVertically,
          modifier = Modifier
            .clickable(onClick = onViewAttendanceClick)
            .testTag("view_attendance_link")
        ) {
          Text(
            text = "View Attendance",
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

      // Clean Notion Typography: Large Percentage + Target Insight
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Bottom
      ) {
        Column {
          Text(
            text = "${String.format("%.1f", overallPercentage)}%",
            style = MaterialTheme.typography.displayMedium.copy(
              fontWeight = FontWeight.Bold,
              letterSpacing = (-1).sp
            ),
            color = MaterialTheme.colorScheme.onSurface
          )
        }

        Text(
          text = if (overallPercentage >= 75f) {
            if (classesCanMiss > 0) "Can miss $classesCanMiss class${if (classesCanMiss > 1) "es" else ""}" else "At 75% target threshold"
          } else {
            "Need $classesNeededForTarget classes to 75%"
          },
          style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
          color = if (overallPercentage >= 75f) StatusPresent else StatusAbsent
        )
      }

      Spacer(modifier = Modifier.height(10.dp))

      // Minimalist Clean Progress Track
      LinearProgressIndicator(
        progress = { (overallPercentage / 100f).coerceIn(0f, 1f) },
        modifier = Modifier
          .fillMaxWidth()
          .height(5.dp)
          .clip(RoundedCornerShape(3.dp)),
        color = if (overallPercentage >= 75f) StatusPresent else StatusAbsent,
        trackColor = MaterialTheme.colorScheme.surfaceVariant
      )

      Spacer(modifier = Modifier.height(12.dp))

      // Clean Stats Summary
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = "Present: $totalPresent",
          style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
          text = "Absent: $totalAbsent",
          style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
          text = "Total: ${totalPresent + totalAbsent}",
          style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
          color = MaterialTheme.colorScheme.onSurfaceVariant
        )
      }
    }
  }
}
