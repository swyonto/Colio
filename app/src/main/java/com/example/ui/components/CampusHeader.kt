package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.R
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
    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)),
    shadowElevation = 0.dp
  ) {
    Column(
      modifier = Modifier
        .statusBarsPadding()
        .padding(horizontal = 16.dp, vertical = 10.dp)
    ) {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        // Left: Custom CampusOS Logo + Brand Title
        Row(
          verticalAlignment = Alignment.CenterVertically,
          modifier = Modifier.testTag("app_brand_logo")
        ) {
          Image(
            painter = painterResource(id = R.drawable.ic_campusos_logo),
            contentDescription = "CampusOS Logo",
            modifier = Modifier
              .size(36.dp)
              .clip(RoundedCornerShape(8.dp))
          )

          Spacer(modifier = Modifier.width(10.dp))

          Column {
            Text(
              text = "CampusOS",
              style = MaterialTheme.typography.titleMedium.copy(
                fontWeight = FontWeight.Bold,
                letterSpacing = (-0.3).sp
              ),
              color = MaterialTheme.colorScheme.onSurface
            )
            Text(
              text = "Academic Workspace",
              style = MaterialTheme.typography.labelSmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
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
              .size(38.dp)
              .testTag("header_search_button")
          ) {
            Icon(
              imageVector = Icons.Default.Search,
              contentDescription = "Search",
              tint = MaterialTheme.colorScheme.onSurfaceVariant,
              modifier = Modifier.size(20.dp)
            )
          }

          val initials = profile?.name?.split(" ")
            ?.mapNotNull { it.firstOrNull()?.toString() }
            ?.take(2)
            ?.joinToString("") ?: "SM"

          Box(
            modifier = Modifier
              .size(38.dp)
              .clip(CircleShape)
              .background(MaterialTheme.colorScheme.surfaceVariant)
              .clickable(onClick = onProfileClick)
              .testTag("header_profile_avatar"),
            contentAlignment = Alignment.Center
          ) {
            if (!profile?.avatarUri.isNullOrBlank()) {
              AsyncImage(
                model = profile?.avatarUri,
                contentDescription = "Profile Avatar",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                  .size(38.dp)
                  .clip(CircleShape)
              )
            } else {
              Text(
                text = initials,
                style = MaterialTheme.typography.titleSmall.copy(
                  fontWeight = FontWeight.Bold
                ),
                color = MaterialTheme.colorScheme.onSurface
              )
            }
          }
        }
      }
    }
  }
}
