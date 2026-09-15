package com.example.ui.theme

import androidx.compose.ui.graphics.Color

// shadcn / Notion Neutral Palette (Minimalist Zinc / Slate)
val ShadcnPrimary = Color(0xFF18181B) // zinc-900 / Notion primary obsidian
val ShadcnOnPrimary = Color(0xFFFAFAFA) // zinc-50
val ShadcnPrimaryVariant = Color(0xFF27272A) // zinc-800
val ShadcnPrimaryContainer = Color(0xFFF4F4F5) // zinc-100
val ShadcnOnPrimaryContainer = Color(0xFF09090B)

val ShadcnSecondary = Color(0xFF27272A)
val ShadcnSecondaryContainer = Color(0xFFF4F4F5)
val ShadcnOnSecondaryContainer = Color(0xFF18181B)

val ShadcnTertiary = Color(0xFF52525B) // zinc-600
val ShadcnTertiaryContainer = Color(0xFFE4E4E7) // zinc-200
val ShadcnOnTertiaryContainer = Color(0xFF18181B)

// Canvas & Surfaces (Notion Warm Neutral / shadcn Light)
val CampusBackground = Color(0xFFFBFBFA) // Notion paper canvas
val CampusSurface = Color(0xFFFFFFFF) // Crisp white with glassmorphic capability
val CampusSurfaceGlass = Color(0xE6FFFFFF) // 90% opacity for glassmorphism
val CampusSurfaceVariant = Color(0xFFF4F4F5) // zinc-100
val CampusOutline = Color(0xFFE4E4E7) // zinc-200 (1px crisp border)
val CampusOutlineVariant = Color(0xFFD4D4D8) // zinc-300

// Clean Typography colors
val TextPrimary = Color(0xFF09090B) // zinc-950
val TextSecondary = Color(0xFF52525B) // zinc-600
val TextMuted = Color(0xFF71717A) // zinc-500

// Status Accents (Restrained, elegant)
val StatusPresent = Color(0xFF10B981) // emerald-500
val StatusPresentBg = Color(0xFFECFDF5)
val StatusAbsent = Color(0xFFEF4444) // rose-500
val StatusAbsentBg = Color(0xFFFEF2F2)
val StatusHoliday = Color(0xFFF59E0B) // amber-500
val StatusHolidayBg = Color(0xFFFFFBEB)

// Dark Palette (shadcn Dark Mode)
val DarkBackground = Color(0xFF09090B) // zinc-950
val DarkSurface = Color(0xFF121215) // zinc-900
val DarkSurfaceVariant = Color(0xFF18181B)
val DarkPrimary = Color(0xFFFAFAFA)
val DarkSecondary = Color(0xFFA1A1AA)
val DarkTertiary = Color(0xFF71717A)
val DarkOutline = Color(0xFF27272A)

// Backward-compatibility aliases so existing references resolve smoothly
val IndigoPrimary = ShadcnPrimary
val IndigoPrimaryVariant = ShadcnPrimaryVariant
val IndigoContainer = ShadcnPrimaryContainer
val OnIndigoContainer = ShadcnOnPrimaryContainer
val TealSecondary = ShadcnSecondary
val TealContainer = ShadcnSecondaryContainer
val OnTealContainer = ShadcnOnSecondaryContainer
val AmberTertiary = ShadcnTertiary
val AmberContainer = ShadcnTertiaryContainer
val OnAmberContainer = ShadcnOnTertiaryContainer
