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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
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
import com.example.data.repository.AttendanceSummary
import com.example.ui.theme.StatusAbsent
import com.example.ui.theme.StatusPresent

@Composable
fun AttendanceCard(
  summary: AttendanceSummary,
  onViewAttendanceClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val isAboveTarget = summary.overallPercentage >= summary.targetPercentage
  val statusColor = if (isAboveTarget) StatusPresent else StatusAbsent

  Card(
    modifier = modifier
      .fillMaxWidth()
      .testTag("dashboard_attendance_card")
      .clickable(onClick = onViewAttendanceClick),
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
              .size(10.dp)
              .clip(RoundedCornerShape(5.dp))
              .background(statusColor)
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = "Attendance",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
            color = MaterialTheme.colorScheme.onSurface
          )
        }

        Box(
          modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(if (isAboveTarget) Color(0xFFDCFCE7) else Color(0xFFFEE2E2))
            .padding(horizontal = 10.dp, vertical = 4.dp)
        ) {
          Text(
            text = if (isAboveTarget) "Above Goal (≥${summary.targetPercentage.toInt()}%)" else "Below Goal (<${summary.targetPercentage.toInt()}%)",
            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
            color = if (isAboveTarget) Color(0xFF15803D) else Color(0xFFB91C1C)
          )
        }
      }

      Spacer(modifier = Modifier.height(16.dp))

      // Main Percentage Display
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Bottom
      ) {
        Text(
          text = "${String.format("%.1f", summary.overallPercentage)}%",
          style = MaterialTheme.typography.displayMedium.copy(
            fontWeight = FontWeight.ExtraBold,
            letterSpacing = (-1).sp
          ),
          color = MaterialTheme.colorScheme.onSurface
        )

        // Status pill: Classes safe to miss or needed
        if (isAboveTarget && summary.classesCanMiss > 0) {
          Text(
            text = "Can miss ${summary.classesCanMiss} class${if (summary.classesCanMiss > 1) "es" else ""}",
            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
            color = StatusPresent
          )
        } else if (!isAboveTarget && summary.classesNeededForTarget > 0) {
          Text(
            text = "Need ${summary.classesNeededForTarget} consecutive",
            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
            color = StatusAbsent
          )
        }
      }

      Spacer(modifier = Modifier.height(12.dp))

      // Progress bar
      LinearProgressIndicator(
        progress = { (summary.overallPercentage / 100f).coerceIn(0f, 1f) },
        modifier = Modifier
          .fillMaxWidth()
          .height(8.dp)
          .clip(RoundedCornerShape(4.dp)),
        color = statusColor,
        trackColor = MaterialTheme.colorScheme.surfaceVariant
      )

      Spacer(modifier = Modifier.height(16.dp))

      // Present / Absent / Denominator
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
              text = "Present ",
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
              text = "${summary.presentClasses}",
              style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
              color = StatusPresent
            )
          }

          Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
              text = "Absent ",
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
              text = "${summary.absentClasses}",
              style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold),
              color = StatusAbsent
            )
          }
        }

        Row(
          verticalAlignment = Alignment.CenterVertically,
          modifier = Modifier.clickable(onClick = onViewAttendanceClick)
        ) {
          Text(
            text = "View Attendance",
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
    }
  }
}
