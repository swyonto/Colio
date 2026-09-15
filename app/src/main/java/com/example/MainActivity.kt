package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
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
      CampusOSTheme {
        CampusApp(viewModel = viewModel)
      }
    }
  }
}
