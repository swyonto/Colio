package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.CampusApp
import com.example.ui.theme.CampusOSTheme
import com.example.ui.viewmodel.CampusViewModel
import com.example.ui.viewmodel.CampusViewModelFactory

class MainActivity : ComponentActivity() {

  private val viewModel: CampusViewModel by viewModels {
    CampusViewModelFactory(application)
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    setContent {
      val themeMode by viewModel.themeMode.collectAsStateWithLifecycle()
      val glassAccent by viewModel.glassAccent.collectAsStateWithLifecycle()

      CampusOSTheme(
        themeMode = themeMode,
        glassAccent = glassAccent
      ) {
        CampusApp(viewModel = viewModel)
      }
    }
  }
}
