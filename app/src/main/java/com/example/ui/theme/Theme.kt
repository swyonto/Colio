package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
  primary = DarkPrimary,
  onPrimary = Color(0xFF09090B),
  primaryContainer = Color(0xFF27272A),
  onPrimaryContainer = Color(0xFFFAFAFA),
  secondary = DarkSecondary,
  onSecondary = Color(0xFF09090B),
  secondaryContainer = Color(0xFF18181B),
  onSecondaryContainer = Color(0xFFE4E4E7),
  tertiary = DarkTertiary,
  background = DarkBackground,
  surface = DarkSurface,
  surfaceVariant = DarkSurfaceVariant,
  onBackground = Color(0xFFFAFAFA),
  onSurface = Color(0xFFFAFAFA),
  onSurfaceVariant = Color(0xFFA1A1AA),
  outline = DarkOutline,
  outlineVariant = Color(0xFF3F3F46)
)

private val LightColorScheme = lightColorScheme(
  primary = ShadcnPrimary,
  onPrimary = ShadcnOnPrimary,
  primaryContainer = ShadcnPrimaryContainer,
  onPrimaryContainer = ShadcnOnPrimaryContainer,
  secondary = ShadcnSecondary,
  onSecondary = Color.White,
  secondaryContainer = ShadcnSecondaryContainer,
  onSecondaryContainer = ShadcnOnSecondaryContainer,
  tertiary = ShadcnTertiary,
  background = CampusBackground,
  surface = CampusSurface,
  surfaceVariant = CampusSurfaceVariant,
  onBackground = TextPrimary,
  onSurface = TextPrimary,
  onSurfaceVariant = TextSecondary,
  outline = CampusOutline,
  outlineVariant = CampusOutlineVariant
)

@Composable
fun CampusOSTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  dynamicColor: Boolean = false, // Keep clean Notion / shadcn aesthetic
  content: @Composable () -> Unit
) {
  val colorScheme = when {
    dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
      val context = LocalContext.current
      if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
    }
    darkTheme -> DarkColorScheme
    else -> LightColorScheme
  }

  MaterialTheme(
    colorScheme = colorScheme,
    typography = Typography,
    content = content
  )
}
