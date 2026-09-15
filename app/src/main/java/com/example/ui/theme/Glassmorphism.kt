package com.example.ui.theme

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

enum class AppThemeMode(val title: String, val subtitle: String) {
  SYSTEM("System", "Match device theme"),
  LIGHT("Light Glass", "Clean frosted daylight"),
  DARK("Dark Glass", "Luminous obsidian glass");

  val label: String get() = title
}

enum class GlassAccent(
  val id: String,
  val title: String,
  val primary: Color,
  val secondary: Color,
  val highlight: Color,
  val previewColors: List<Color>
) {
  AURORA_INDIGO(
    id = "aurora",
    title = "Aurora Indigo",
    primary = Color(0xFF6366F1), // Indigo 500
    secondary = Color(0xFF8B5CF6), // Purple 500
    highlight = Color(0xFF818CF8),
    previewColors = listOf(Color(0xFF6366F1), Color(0xFF8B5CF6))
  ),
  EMERALD_MINT(
    id = "emerald",
    title = "Emerald Mint",
    primary = Color(0xFF10B981), // Emerald 500
    secondary = Color(0xFF059669), // Teal 600
    highlight = Color(0xFF34D399),
    previewColors = listOf(Color(0xFF10B981), Color(0xFF059669))
  ),
  COSMIC_VIOLET(
    id = "violet",
    title = "Cosmic Violet",
    primary = Color(0xFF8B5CF6), // Violet 500
    secondary = Color(0xFFD946EF), // Fuchsia 500
    highlight = Color(0xFFA855F7),
    previewColors = listOf(Color(0xFF8B5CF6), Color(0xFFD946EF))
  ),
  OCEAN_CYAN(
    id = "ocean",
    title = "Ocean Cyan",
    primary = Color(0xFF0EA5E9), // Sky 500
    secondary = Color(0xFF06B6D4), // Cyan 500
    highlight = Color(0xFF38BDF8),
    previewColors = listOf(Color(0xFF0EA5E9), Color(0xFF06B6D4))
  ),
  SUNSET_AMBER(
    id = "sunset",
    title = "Sunset Amber",
    primary = Color(0xFFF59E0B), // Amber 500
    secondary = Color(0xFFEA580C), // Orange 600
    highlight = Color(0xFFFBBF24),
    previewColors = listOf(Color(0xFFF59E0B), Color(0xFFEA580C))
  ),
  SLATE_MINIMAL(
    id = "slate",
    title = "Slate Minimal",
    primary = Color(0xFF64748B), // Slate 500
    secondary = Color(0xFF475569), // Slate 600
    highlight = Color(0xFF94A3B8),
    previewColors = listOf(Color(0xFF64748B), Color(0xFF475569))
  );

  val label: String get() = title

  companion object {
    fun fromId(id: String): GlassAccent {
      return entries.find { it.id.equals(id, ignoreCase = true) } ?: AURORA_INDIGO
    }
  }
}

val LocalGlassAccent = compositionLocalOf { GlassAccent.AURORA_INDIGO }
val LocalThemeMode = compositionLocalOf { AppThemeMode.SYSTEM }

/**
 * Creates a subtle gradient brush for glassmorphic cards.
 * Provides tasteful, gentle color tinting without visual overwhelm.
 */
fun getGlassGradientBrush(accent: GlassAccent, isDark: Boolean): Brush {
  return if (isDark) {
    Brush.linearGradient(
      colors = listOf(
        accent.primary.copy(alpha = 0.20f),
        Color(0xFF1B1B22).copy(alpha = 0.88f),
        Color(0xFF111116).copy(alpha = 0.94f)
      ),
      start = Offset(0f, 0f),
      end = Offset(Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY)
    )
  } else {
    Brush.linearGradient(
      colors = listOf(
        accent.primary.copy(alpha = 0.10f),
        accent.secondary.copy(alpha = 0.04f),
        Color(0xFFFFFFFF).copy(alpha = 0.90f)
      ),
      start = Offset(0f, 0f),
      end = Offset(Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY)
    )
  }
}

/**
 * Creates the frosted glass refraction border with subtle gradient highlights.
 */
fun getGlassBorderStroke(accent: GlassAccent, isDark: Boolean, width: Dp = 1.dp): BorderStroke {
  val borderBrush = if (isDark) {
    Brush.linearGradient(
      colors = listOf(
        accent.primary.copy(alpha = 0.50f),
        Color.White.copy(alpha = 0.18f),
        accent.secondary.copy(alpha = 0.28f)
      ),
      start = Offset(0f, 0f),
      end = Offset(Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY)
    )
  } else {
    Brush.linearGradient(
      colors = listOf(
        accent.primary.copy(alpha = 0.40f),
        Color.White.copy(alpha = 0.80f),
        accent.secondary.copy(alpha = 0.25f)
      ),
      start = Offset(0f, 0f),
      end = Offset(Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY)
    )
  }
  return BorderStroke(width, borderBrush)
}

/**
 * Modifier extension to turn any layout into a gradient glassmorphic surface.
 */
@Composable
fun Modifier.glassmorphic(
  shape: Shape = RoundedCornerShape(16.dp),
  accent: GlassAccent = LocalGlassAccent.current,
  isDark: Boolean = when (LocalThemeMode.current) {
    AppThemeMode.SYSTEM -> isSystemInDarkTheme()
    AppThemeMode.LIGHT -> false
    AppThemeMode.DARK -> true
  },
  borderWidth: Dp = 1.dp
): Modifier {
  val brush = getGlassGradientBrush(accent, isDark)
  val border = getGlassBorderStroke(accent, isDark, borderWidth)
  return this
    .clip(shape)
    .background(brush = brush, shape = shape)
    .border(border = border, shape = shape)
}

/**
 * Reusable Glassmorphic Card with subtle color gradient and frosted glass rim.
 */
@Composable
fun GlassCard(
  modifier: Modifier = Modifier,
  shape: Shape = RoundedCornerShape(16.dp),
  accent: GlassAccent = LocalGlassAccent.current,
  borderWidth: Dp = 1.dp,
  onClick: (() -> Unit)? = null,
  content: @Composable ColumnScope.() -> Unit
) {
  val isDark = when (LocalThemeMode.current) {
    AppThemeMode.SYSTEM -> isSystemInDarkTheme()
    AppThemeMode.LIGHT -> false
    AppThemeMode.DARK -> true
  }

  val baseModifier = modifier.glassmorphic(
    shape = shape,
    accent = accent,
    isDark = isDark,
    borderWidth = borderWidth
  )

  val clickableModifier = if (onClick != null) {
    baseModifier.clickable(onClick = onClick)
  } else {
    baseModifier
  }

  Column(modifier = clickableModifier) {
    content()
  }
}

/**
 * Ambient background container that paints soft luminous gradient spots in the canvas
 * so the translucent glassmorphism can refract background atmosphere beautifully.
 */
@Composable
fun AmbientGlassCanvas(
  modifier: Modifier = Modifier,
  accent: GlassAccent = LocalGlassAccent.current,
  content: @Composable () -> Unit
) {
  val isDark = when (LocalThemeMode.current) {
    AppThemeMode.SYSTEM -> isSystemInDarkTheme()
    AppThemeMode.LIGHT -> false
    AppThemeMode.DARK -> true
  }

  val baseBg = if (isDark) Color(0xFF09090C) else CampusBackground
  val auraPrimary = accent.primary.copy(alpha = if (isDark) 0.12f else 0.07f)
  val auraSecondary = accent.secondary.copy(alpha = if (isDark) 0.08f else 0.04f)

  Box(
    modifier = modifier
      .fillMaxSize()
      .background(baseBg)
      .background(
        Brush.radialGradient(
          colors = listOf(auraPrimary, Color.Transparent),
          center = Offset(800f, 150f),
          radius = 700f
        )
      )
      .background(
        Brush.radialGradient(
          colors = listOf(auraSecondary, Color.Transparent),
          center = Offset(100f, 1400f),
          radius = 800f
        )
      )
  ) {
    content()
  }
}
