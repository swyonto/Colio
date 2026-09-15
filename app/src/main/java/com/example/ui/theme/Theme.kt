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
  onPrimary = Color(0xFF0F172A),
  primaryContainer = Color(0xFF312E81),
  onPrimaryContainer = Color(0xFFE0E7FF),
  secondary = DarkSecondary,
  onSecondary = Color(0xFF042F2E),
  secondaryContainer = Color(0xFF134E4A),
  onSecondaryContainer = Color(0xFFCCFBF1),
  tertiary = DarkTertiary,
  background = DarkBackground,
  surface = DarkSurface,
  surfaceVariant = DarkSurfaceVariant,
  onBackground = Color(0xFFF8FAFC),
  onSurface = Color(0xFFF8FAFC),
  outline = Color(0xFF374151)
)

private val LightColorScheme = lightColorScheme(
  primary = IndigoPrimary,
  onPrimary = Color.White,
  primaryContainer = IndigoContainer,
  onPrimaryContainer = OnIndigoContainer,
  secondary = TealSecondary,
  onSecondary = Color.White,
  secondaryContainer = TealContainer,
  onSecondaryContainer = OnTealContainer,
  tertiary = AmberTertiary,
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
  dynamicColor: Boolean = false, // Use intentional CampusOS branding by default
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
