package com.example.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.waitForUpOrCancellation
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardColors
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.example.ui.theme.CampusOutline

/**
 * Adds a tactile physical press animation (spring scale down on press, bounce back on release)
 */
fun Modifier.bounceClick(
  scaleDown: Float = 0.96f,
  onClick: () -> Unit
): Modifier = this
  .pointerInput(onClick) {
    // Note: Can also combine with standard clickable
  }

@Composable
fun NotionButton(
  onClick: () -> Unit,
  modifier: Modifier = Modifier,
  enabled: Boolean = true,
  isPrimary: Boolean = true,
  shape: Shape = RoundedCornerShape(10.dp),
  content: @Composable () -> Unit
) {
  var isPressed by remember { mutableStateOf(false) }
  val scale by animateFloatAsState(
    targetValue = if (isPressed) 0.96f else 1.0f,
    animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessLow),
    label = "buttonScale"
  )

  val containerColor = if (isPrimary) {
    MaterialTheme.colorScheme.primary
  } else {
    MaterialTheme.colorScheme.surface
  }

  val contentColor = if (isPrimary) {
    MaterialTheme.colorScheme.onPrimary
  } else {
    MaterialTheme.colorScheme.onSurface
  }

  val borderStroke = if (isPrimary) {
    BorderStroke(1.dp, MaterialTheme.colorScheme.primary)
  } else {
    BorderStroke(1.dp, MaterialTheme.colorScheme.outline)
  }

  Surface(
    modifier = modifier
      .scale(scale)
      .pointerInput(enabled) {
        if (!enabled) return@pointerInput
        awaitPointerEventScope {
          while (true) {
            awaitFirstDown(requireUnconsumed = false)
            isPressed = true
            val up = waitForUpOrCancellation()
            isPressed = false
            if (up != null) {
              onClick()
            }
          }
        }
      },
    shape = shape,
    color = if (enabled) containerColor else containerColor.copy(alpha = 0.5f),
    contentColor = if (enabled) contentColor else contentColor.copy(alpha = 0.5f),
    border = borderStroke,
    shadowElevation = if (isPrimary) 1.dp else 0.dp
  ) {
    Box(contentAlignment = Alignment.Center) {
      content()
    }
  }
}

/**
 * Premium Notion / shadcn glassmorphic card with subtle 1px border
 */
@Composable
fun NotionCard(
  modifier: Modifier = Modifier,
  shape: Shape = RoundedCornerShape(16.dp),
  border: BorderStroke = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
  backgroundColor: Color = MaterialTheme.colorScheme.surface,
  elevation: Dp = 0.dp,
  onClick: (() -> Unit)? = null,
  content: @Composable ColumnScope.() -> Unit
) {
  var isPressed by remember { mutableStateOf(false) }
  val scale by animateFloatAsState(
    targetValue = if (isPressed && onClick != null) 0.985f else 1.0f,
    animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium),
    label = "cardScale"
  )

  Card(
    modifier = modifier
      .scale(scale)
      .then(
        if (onClick != null) {
          Modifier.clickable(onClick = onClick)
        } else Modifier
      ),
    shape = shape,
    border = border,
    colors = CardDefaults.cardColors(containerColor = backgroundColor),
    elevation = CardDefaults.cardElevation(defaultElevation = elevation)
  ) {
    Column {
      content()
    }
  }
}

/**
 * Minimalist Notion-style spin loader
 */
@Composable
fun NotionSpinLoader(
  modifier: Modifier = Modifier,
  size: Dp = 20.dp,
  color: Color = MaterialTheme.colorScheme.primary,
  strokeWidth: Dp = 2.dp
) {
  CircularProgressIndicator(
    modifier = modifier.size(size),
    color = color,
    strokeWidth = strokeWidth,
    strokeCap = StrokeCap.Round
  )
}
