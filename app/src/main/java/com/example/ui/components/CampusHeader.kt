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
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
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
import com.example.data.local.entity.StudentProfileEntity

@Composable
fun CampusHeader(
  profile: StudentProfileEntity?,
  onProfileClick: () -> Unit,
  onSearchClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  Surface(
    modifier = modifier.fillMaxWidth(),
    color = MaterialTheme.colorScheme.surface,
    tonalElevation = 2.dp,
    shadowElevation = 1.dp
  ) {
    Column(
      modifier = Modifier
        .statusBarsPadding()
        .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        // Left: Application Title / Brand Logo (NO GREETINGS per PRD Section 6)
        Row(
          verticalAlignment = Alignment.CenterVertically,
          modifier = Modifier.testTag("app_brand_logo")
        ) {
          Box(
            modifier = Modifier
              .size(38.dp)
              .clip(RoundedCornerShape(10.dp))
              .background(MaterialTheme.colorScheme.primary),
            contentAlignment = Alignment.Center
          ) {
            Icon(
              imageVector = Icons.Default.School,
              contentDescription = "CampusOS",
              tint = Color.White,
              modifier = Modifier.size(22.dp)
            )
          }

          Spacer(modifier = Modifier.width(10.dp))

          Column {
            Text(
              text = "CampusOS",
              style = MaterialTheme.typography.titleLarge.copy(
                fontWeight = FontWeight.Bold,
                letterSpacing = (-0.5).sp
              ),
              color = MaterialTheme.colorScheme.onSurface
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
              Box(
                modifier = Modifier
                  .size(6.dp)
                  .clip(CircleShape)
                  .background(Color(0xFF16A34A))
              )
              Spacer(modifier = Modifier.width(4.dp))
              Text(
                text = "Offline First • Synced",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
            }
          }
        }

        // Right: Search & Circular Profile Avatar Button
        Row(
          verticalAlignment = Alignment.CenterVertically,
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          IconButton(
            onClick = onSearchClick,
            modifier = Modifier
              .size(40.dp)
              .testTag("header_search_button")
          ) {
            Icon(
              imageVector = Icons.Default.Search,
              contentDescription = "Search",
              tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
          }

          // Circular profile avatar (PRD Section 6: Avatar with initials or image)
          val initials = profile?.name?.split(" ")
            ?.mapNotNull { it.firstOrNull()?.toString() }
            ?.take(2)
            ?.joinToString("") ?: "SM"

          Box(
            modifier = Modifier
              .size(42.dp)
              .clip(CircleShape)
              .background(MaterialTheme.colorScheme.primaryContainer)
              .clickable(onClick = onProfileClick)
              .testTag("header_profile_avatar"),
            contentAlignment = Alignment.Center
          ) {
            Text(
              text = initials,
              style = MaterialTheme.typography.titleMedium.copy(
                fontWeight = FontWeight.Bold
              ),
              color = MaterialTheme.colorScheme.onPrimaryContainer
            )
          }
        }
      }
    }
  }
}
