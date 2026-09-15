package com.example.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.CheckCircle
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Menu
import androidx.compose.material.icons.outlined.Payments
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.components.CampusHeader
import com.example.ui.screens.AddonsScreen
import com.example.ui.screens.AttendanceScreen
import com.example.ui.screens.BooksScreen
import com.example.ui.screens.ExpensesScreen
import com.example.ui.screens.HolidaysScreen
import com.example.ui.screens.HomeScreen
import com.example.ui.screens.IdCardViewerScreen
import com.example.ui.screens.MoreScreen
import com.example.ui.screens.NotesScreen
import com.example.ui.screens.ProfileScreen
import com.example.ui.screens.SearchScreen
import com.example.ui.screens.TasksScreen
import com.example.ui.screens.TimetableScreen
import com.example.ui.viewmodel.CampusViewModel
import com.example.ui.viewmodel.ScreenTab
import com.example.ui.viewmodel.SubScreen

data class NavTabItem(
  val tab: ScreenTab,
  val label: String,
  val selectedIcon: ImageVector,
  val unselectedIcon: ImageVector
)

@Composable
fun CampusApp(
  viewModel: CampusViewModel,
  modifier: Modifier = Modifier
) {
  val currentTab by viewModel.currentTab.collectAsStateWithLifecycle()
  val activeSubScreen by viewModel.activeSubScreen.collectAsStateWithLifecycle()
  val profile by viewModel.profile.collectAsStateWithLifecycle()

  // Handle Android back button
  BackHandler(enabled = activeSubScreen != SubScreen.NONE) {
    viewModel.closeSubScreen()
  }

  val navItems = listOf(
    NavTabItem(ScreenTab.HOME, "Home", Icons.Filled.Home, Icons.Outlined.Home),
    NavTabItem(ScreenTab.ATTENDANCE, "Attendance", Icons.Filled.CheckCircle, Icons.Outlined.CheckCircle),
    NavTabItem(ScreenTab.TIMETABLE, "Timetable", Icons.Filled.CalendarMonth, Icons.Outlined.CalendarMonth),
    NavTabItem(ScreenTab.EXPENSES, "Expenses", Icons.Filled.Payments, Icons.Outlined.Payments),
    NavTabItem(ScreenTab.MORE, "More", Icons.Filled.Menu, Icons.Outlined.Menu)
  )

  // When a sub-screen is active, render it directly
  if (activeSubScreen != SubScreen.NONE) {
    when (activeSubScreen) {
      SubScreen.TASKS -> TasksScreen(viewModel = viewModel, onBack = { viewModel.closeSubScreen() })
      SubScreen.BOOKS -> BooksScreen(viewModel = viewModel, onBack = { viewModel.closeSubScreen() })
      SubScreen.NOTES -> NotesScreen(viewModel = viewModel, onBack = { viewModel.closeSubScreen() })
      SubScreen.PROFILE -> ProfileScreen(viewModel = viewModel, onBack = { viewModel.closeSubScreen() })
      SubScreen.ID_CARD -> IdCardViewerScreen(viewModel = viewModel, onBack = { viewModel.closeSubScreen() })
      SubScreen.ADDONS -> AddonsScreen(viewModel = viewModel, onBack = { viewModel.closeSubScreen() })
      SubScreen.HOLIDAYS -> HolidaysScreen(viewModel = viewModel, onBack = { viewModel.closeSubScreen() })
      SubScreen.SEARCH -> SearchScreen(viewModel = viewModel, onBack = { viewModel.closeSubScreen() })
      else -> Unit
    }
  } else {
    Scaffold(
      modifier = modifier.fillMaxSize(),
      topBar = {
        CampusHeader(
          profile = profile,
          onProfileClick = { viewModel.navigateToSubScreen(SubScreen.PROFILE) },
          onSearchClick = { viewModel.navigateToSubScreen(SubScreen.SEARCH) }
        )
      },
      bottomBar = {
        NavigationBar(
          tonalElevation = 6.dp,
          containerColor = MaterialTheme.colorScheme.surface,
          modifier = Modifier.testTag("bottom_navigation_bar")
        ) {
          navItems.forEach { item ->
            val isSelected = currentTab == item.tab
            NavigationBarItem(
              selected = isSelected,
              onClick = { viewModel.selectTab(item.tab) },
              icon = {
                Icon(
                  imageVector = if (isSelected) item.selectedIcon else item.unselectedIcon,
                  contentDescription = item.label
                )
              },
              label = {
                Text(
                  text = item.label,
                  style = MaterialTheme.typography.labelSmall
                )
              },
              colors = NavigationBarItemDefaults.colors(
                selectedIconColor = MaterialTheme.colorScheme.primary,
                selectedTextColor = MaterialTheme.colorScheme.primary,
                indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
              ),
              modifier = Modifier.testTag("nav_tab_${item.label.lowercase()}")
            )
          }
        }
      }
    ) { innerPadding ->
      Box(
        modifier = Modifier
          .fillMaxSize()
          .padding(innerPadding)
      ) {
        when (currentTab) {
          ScreenTab.HOME -> HomeScreen(viewModel = viewModel)
          ScreenTab.ATTENDANCE -> AttendanceScreen(viewModel = viewModel)
          ScreenTab.TIMETABLE -> TimetableScreen(viewModel = viewModel)
          ScreenTab.EXPENSES -> ExpensesScreen(viewModel = viewModel)
          ScreenTab.MORE -> MoreScreen(viewModel = viewModel)
        }
      }
    }
  }
}
