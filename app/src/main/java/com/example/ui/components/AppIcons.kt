package com.example.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Calculate
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ConfirmationNumber
import androidx.compose.material.icons.filled.DirectionsBus
import androidx.compose.material.icons.filled.DirectionsSubway
import androidx.compose.material.icons.filled.Grading
import androidx.compose.material.icons.filled.LocalCafe
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.Print
import androidx.compose.material.icons.filled.Restaurant
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.TrackChanges
import androidx.compose.material.icons.filled.Work
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector

object AppIcons {
  fun getExpenseCategoryIcon(category: String): ImageVector {
    return when (category.lowercase()) {
      "food", "canteen", "lunch", "dinner" -> Icons.Default.Restaurant
      "transport", "metro", "bus", "cab" -> Icons.Default.DirectionsSubway
      "books", "study", "notes", "stationary" -> Icons.Default.MenuBook
      "college", "tuition", "fee", "lab" -> Icons.Default.School
      "shopping", "market" -> Icons.Default.ShoppingBag
      else -> Icons.Default.Payments
    }
  }

  fun getQuickExpenseIcon(iconKey: String): ImageVector {
    return when (iconKey.lowercase()) {
      "ticket", "🎫" -> Icons.Default.ConfirmationNumber
      "tea", "coffee", "chai", "☕" -> Icons.Default.LocalCafe
      "train", "metro", "subway", "🚇" -> Icons.Default.DirectionsSubway
      "bus", "🚌" -> Icons.Default.DirectionsBus
      "food", "lunch", "canteen", "curry", "🍛" -> Icons.Default.Restaurant
      "print", "printout", "xerox", "🖨️" -> Icons.Default.Print
      "book", "study", "📖" -> Icons.Default.Book
      else -> Icons.Default.Payments
    }
  }

  fun getAddonIcon(iconKey: String): ImageVector {
    return when (iconKey.lowercase()) {
      "calculate", "cgpa", "sgpa", "📊" -> Icons.Default.Calculate
      "goal", "attendance", "🎯" -> Icons.Default.TrackChanges
      "timer", "pomodoro", "⏱️" -> Icons.Default.Timer
      "grade", "marks", "📝" -> Icons.Default.Grading
      "calendar", "countdown", "⏳" -> Icons.Default.CalendarMonth
      else -> Icons.Default.CheckCircle
    }
  }
}
