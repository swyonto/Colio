package com.example.ui.components

import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.waitForUpOrCancellation
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.material.icons.filled.MenuBook
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
import androidx.compose.ui.draw.scale
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.local.entity.AcademicDocumentEntity

@Composable
fun BooksCard(
  documents: List<AcademicDocumentEntity>,
  onViewBooksClick: () -> Unit,
  modifier: Modifier = Modifier
) {
  val bookCount = documents.count { it.docType == "BOOK" }
  val docCount = documents.count { it.docType != "BOOK" }

  var isPressed by remember { mutableStateOf(false) }
  val scale by animateFloatAsState(
    targetValue = if (isPressed) 0.98f else 1.0f,
    animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium),
    label = "booksCardScale"
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
              onViewBooksClick()
            }
          }
        }
      }
      .testTag("dashboard_books_card"),
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
      // Top Row: Title on Left, View Action ON TOP
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
          Icon(
            imageVector = Icons.Default.MenuBook,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(20.dp)
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = "Books & Library",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
            color = MaterialTheme.colorScheme.onSurface
          )
        }

        Row(
          verticalAlignment = Alignment.CenterVertically,
          modifier = Modifier
            .clickable(onClick = onViewBooksClick)
            .testTag("view_books_link")
        ) {
          Text(
            text = "View Books",
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

      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.Bottom
      ) {
        Row(verticalAlignment = Alignment.Bottom) {
          Text(
            text = "${documents.size}",
            style = MaterialTheme.typography.displayMedium.copy(
              fontWeight = FontWeight.Bold,
              letterSpacing = (-1).sp
            ),
            color = MaterialTheme.colorScheme.onSurface
          )
          Spacer(modifier = Modifier.width(8.dp))
          Text(
            text = "Total Files",
            style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(bottom = 6.dp)
          )
        }

        Text(
          text = "$bookCount Books  •  $docCount Notes",
          style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium),
          color = MaterialTheme.colorScheme.onSurfaceVariant,
          modifier = Modifier.padding(bottom = 6.dp)
        )
      }
    }
  }
}
