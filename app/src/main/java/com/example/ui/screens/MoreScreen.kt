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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Assignment
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.BeachAccess
import androidx.compose.material.icons.filled.CloudSync
import androidx.compose.material.icons.filled.Extension
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.NoteAlt
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.viewmodel.CampusViewModel
import com.example.ui.viewmodel.SubScreen

data class MoreMenuItem(
  val subScreen: SubScreen,
  val title: String,
  val subtitle: String,
  val icon: ImageVector,
  val iconTint: Color,
  val badgeText: String? = null
)

@Composable
fun MoreScreen(
  viewModel: CampusViewModel,
  modifier: Modifier = Modifier
) {
  val tasksRemaining by viewModel.tasksRemainingCount.collectAsStateWithLifecycle()
  val documents by viewModel.documents.collectAsStateWithLifecycle()
  val notes by viewModel.notes.collectAsStateWithLifecycle()
  val profile by viewModel.profile.collectAsStateWithLifecycle()

  val items = listOf(
    MoreMenuItem(
      subScreen = SubScreen.TASKS,
      title = "Tasks",
      subtitle = "College assignments, deadlines & projects",
      icon = Icons.Default.Assignment,
      iconTint = Color(0xFF4F46E5),
      badgeText = if (tasksRemaining > 0) "$tasksRemaining pending" else null
    ),
    MoreMenuItem(
      subScreen = SubScreen.BOOKS,
      title = "Books & Documents",
      subtitle = "Academic textbooks, syllabus & lab PDFs",
      icon = Icons.Default.MenuBook,
      iconTint = Color(0xFF0EA5E9),
      badgeText = "${documents.size} files"
    ),
    MoreMenuItem(
      subScreen = SubScreen.NOTES,
      title = "Notes & Lecture Snaps",
      subtitle = "Formulae sheets & whiteboard photo notes",
      icon = Icons.Default.NoteAlt,
      iconTint = Color(0xFF10B981),
      badgeText = "${notes.size} notes"
    ),
    MoreMenuItem(
      subScreen = SubScreen.ADDONS,
      title = "Add-ons & Calculators",
      subtitle = "CGPA, SGPA, Study Timer & Attendance Predictor",
      icon = Icons.Default.Extension,
      iconTint = Color(0xFFF59E0B)
    ),
    MoreMenuItem(
      subScreen = SubScreen.PROFILE,
      title = "Student Profile",
      subtitle = "${profile?.name ?: "Student"} • ${profile?.course ?: "Course"}",
      icon = Icons.Default.Person,
      iconTint = Color(0xFF8B5CF6)
    ),
    MoreMenuItem(
      subScreen = SubScreen.ID_CARD,
      title = "College ID Card",
      subtitle = "View & export official college digital ID card",
      icon = Icons.Default.Badge,
      iconTint = Color(0xFFEC4899)
    ),
    MoreMenuItem(
      subScreen = SubScreen.HOLIDAYS,
      title = "Holidays & Non-Class Days",
      subtitle = "College holidays & Sunday non-class rules",
      icon = Icons.Default.BeachAccess,
      iconTint = Color(0xFFEA580C)
    )
  )

  LazyColumn(
    modifier = modifier
      .fillMaxSize()
      .testTag("more_screen"),
    contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 96.dp),
    verticalArrangement = Arrangement.spacedBy(12.dp)
  ) {
    item {
      Text(
        text = "College Modules & Tools",
        style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
        color = MaterialTheme.colorScheme.onSurface,
        modifier = Modifier.padding(bottom = 4.dp)
      )
    }

    items.forEach { item ->
      item {
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
          elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
          modifier = Modifier
            .fillMaxWidth()
            .clickable { viewModel.navigateToSubScreen(item.subScreen) }
            .testTag("more_item_${item.title.lowercase().replace(" ", "_")}")
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier.weight(1f)
            ) {
              Box(
                modifier = Modifier
                  .size(42.dp)
                  .clip(RoundedCornerShape(12.dp))
                  .background(item.iconTint.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
              ) {
                Icon(
                  imageVector = item.icon,
                  contentDescription = null,
                  tint = item.iconTint,
                  modifier = Modifier.size(22.dp)
                )
              }

              Spacer(modifier = Modifier.width(14.dp))

              Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                  Text(
                    text = item.title,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurface
                  )
                  if (item.badgeText != null) {
                    Spacer(modifier = Modifier.width(8.dp))
                    Box(
                      modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(item.iconTint.copy(alpha = 0.15f))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                      Text(
                        text = item.badgeText,
                        style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                        color = item.iconTint
                      )
                    }
                  }
                }
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                  text = item.subtitle,
                  style = MaterialTheme.typography.bodySmall,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            }

            Icon(
              imageVector = Icons.AutoMirrored.Filled.ArrowForward,
              contentDescription = null,
              tint = MaterialTheme.colorScheme.onSurfaceVariant,
              modifier = Modifier.size(18.dp)
            )
          }
        }
      }
    }

    // Architecture Footer info (PRD Section 53-56: Offline-first SQLite + Cloud sync)
    item {
      Spacer(modifier = Modifier.height(8.dp))
      Surface(
        shape = RoundedCornerShape(14.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f),
        modifier = Modifier.fillMaxWidth()
      ) {
        Row(
          modifier = Modifier.padding(14.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Icon(
            imageVector = Icons.Default.CloudSync,
            contentDescription = null,
            tint = Color(0xFF16A34A),
            modifier = Modifier.size(20.dp)
          )
          Spacer(modifier = Modifier.width(10.dp))
          Column {
            Text(
              text = "CampusOS Engine",
              style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
              color = MaterialTheme.colorScheme.onSurface
            )
            Text(
              text = "Local SQLite database active. All entries are saved locally with immediate responsiveness.",
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }
        }
      }
    }
  }
}
