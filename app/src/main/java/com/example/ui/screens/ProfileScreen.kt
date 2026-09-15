package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.ui.components.EditProfileDialog
import com.example.ui.viewmodel.CampusViewModel
import com.example.ui.viewmodel.SubScreen
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
  viewModel: CampusViewModel,
  onBack: () -> Unit,
  modifier: Modifier = Modifier
) {
  val profile by viewModel.profile.collectAsStateWithLifecycle()
  var showEditDialog by remember { mutableStateOf(false) }

  Column(modifier = modifier.fillMaxSize()) {
    TopAppBar(
      title = { Text("Student Profile", fontWeight = FontWeight.Bold) },
      navigationIcon = {
        IconButton(onClick = onBack) {
          Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
        }
      },
      actions = {
        IconButton(onClick = { showEditDialog = true }) {
          Icon(Icons.Default.Edit, contentDescription = "Edit Profile")
        }
      }
    )

    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .testTag("profile_screen"),
      contentPadding = PaddingValues(16.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      // Profile Avatar Card
      item {
        Card(
          shape = RoundedCornerShape(20.dp),
          colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
          elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier
              .fillMaxWidth()
              .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            val initials = profile?.name?.split(" ")
              ?.mapNotNull { it.firstOrNull()?.toString() }
              ?.take(2)
              ?.joinToString("") ?: "SM"

            Box(
              modifier = Modifier
                .size(80.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.primaryContainer)
                .border(2.dp, MaterialTheme.colorScheme.primary, CircleShape),
              contentAlignment = Alignment.Center
            ) {
              Text(
                text = initials,
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onPrimaryContainer
              )
            }

            Spacer(modifier = Modifier.height(14.dp))

            Text(
              text = profile?.name ?: "Student Name",
              style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
              color = MaterialTheme.colorScheme.onSurface
            )

            Text(
              text = profile?.collegeName ?: "National Institute of Technology",
              style = MaterialTheme.typography.bodyMedium,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(16.dp))

            Button(
              onClick = { viewModel.navigateToSubScreen(SubScreen.ID_CARD) },
              modifier = Modifier.fillMaxWidth().testTag("button_view_id_card")
            ) {
              Icon(Icons.Default.Badge, contentDescription = null)
              Spacer(modifier = Modifier.width(8.dp))
              Text("View Digital ID Card")
            }
          }
        }
      }

      // Academic Profile Details
      item {
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
          elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text("Academic Details", style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold))

            ProfileDetailRow(label = "Roll Number", value = profile?.rollNumber ?: "2024CS042")
            ProfileDetailRow(label = "Course & Degree", value = profile?.course ?: "B.Tech CSE")
            ProfileDetailRow(label = "Department / Branch", value = profile?.branch ?: "Computer Science")
            ProfileDetailRow(label = "Current Semester", value = profile?.semester ?: "Semester 5")
            ProfileDetailRow(label = "Target Attendance", value = "${(profile?.targetAttendance ?: 75f).toInt()}%")
            ProfileDetailRow(label = "Valid Through", value = profile?.validThru ?: "2027-06-30")
          }
        }
      }
    }
  }

  if (showEditDialog) {
    EditProfileDialog(
      profile = profile,
      onDismiss = { showEditDialog = false },
      onConfirm = { name, college, course, sem, roll, branch, valid, target ->
        viewModel.updateProfile(name, college, course, sem, roll, branch, valid, target)
        showEditDialog = false
      }
    )
  }
}

@Composable
private fun ProfileDetailRow(label: String, value: String) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.CenterVertically
  ) {
    Text(label, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
    Text(value, style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Bold), color = MaterialTheme.colorScheme.onSurface)
  }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun IdCardViewerScreen(
  viewModel: CampusViewModel,
  onBack: () -> Unit,
  modifier: Modifier = Modifier
) {
  val profile by viewModel.profile.collectAsStateWithLifecycle()
  val snackbarHostState = remember { SnackbarHostState() }
  val coroutineScope = rememberCoroutineScope()

  Scaffold(
    snackbarHost = { SnackbarHost(snackbarHostState) },
    topBar = {
      TopAppBar(
        title = { Text("College ID Card", fontWeight = FontWeight.Bold) },
        navigationIcon = {
          IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
          }
        }
      )
    }
  ) { innerPadding ->
    Column(
      modifier = modifier
        .fillMaxSize()
        .padding(innerPadding)
        .padding(16.dp)
        .testTag("id_card_screen"),
      horizontalAlignment = Alignment.CenterHorizontally
    ) {
      Spacer(modifier = Modifier.height(8.dp))

      // The Digital ID Card Layout (PRD Section 39-42)
      Card(
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
        modifier = Modifier
          .fillMaxWidth()
          .testTag("digital_id_card")
      ) {
        Column {
          // Top Header Banner with College Logo & Title
          Box(
            modifier = Modifier
              .fillMaxWidth()
              .background(MaterialTheme.colorScheme.primary)
              .padding(16.dp)
          ) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Box(
                modifier = Modifier
                  .size(36.dp)
                  .clip(CircleShape)
                  .background(Color.White),
                contentAlignment = Alignment.Center
              ) {
                Icon(Icons.Default.School, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(22.dp))
              }
              Spacer(modifier = Modifier.width(12.dp))
              Column {
                Text(
                  text = profile?.collegeName ?: "National Institute of Technology",
                  style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                  color = Color.White
                )
                Text(
                  text = "STUDENT IDENTITY CARD",
                  style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 1.sp),
                  color = Color(0xFFEEF2FF)
                )
              }
            }
          }

          // Card Body
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            // Student Info
            Column(modifier = Modifier.weight(1f)) {
              Text(
                text = profile?.name ?: "Student Name",
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.ExtraBold),
                color = MaterialTheme.colorScheme.onSurface
              )
              Spacer(modifier = Modifier.height(6.dp))
              Text(
                text = "ID: ${profile?.rollNumber ?: "2024CS042"}",
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
                color = MaterialTheme.colorScheme.primary
              )
              Text(
                text = "Dept: ${profile?.course ?: "B.Tech CSE"}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface
              )
              Text(
                text = profile?.semester ?: "Semester 5",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
              )
              Spacer(modifier = Modifier.height(8.dp))
              Text(
                text = "Valid Through: ${profile?.validThru ?: "2027-06-30"}",
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
                color = Color(0xFF16A34A)
              )
            }

            // Photo Avatar Frame
            val initials = profile?.name?.split(" ")
              ?.mapNotNull { it.firstOrNull()?.toString() }
              ?.take(2)
              ?.joinToString("") ?: "SM"

            Box(
              modifier = Modifier
                .size(80.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(MaterialTheme.colorScheme.primaryContainer)
                .border(2.dp, MaterialTheme.colorScheme.primary, RoundedCornerShape(12.dp)),
              contentAlignment = Alignment.Center
            ) {
              Text(
                text = initials,
                style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onPrimaryContainer
              )
            }
          }

          // Barcode / Verification Ribbon
          Box(
            modifier = Modifier
              .fillMaxWidth()
              .background(MaterialTheme.colorScheme.surfaceVariant)
              .padding(horizontal = 20.dp, vertical = 10.dp)
          ) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.QrCode, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(24.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("SCAN FOR CAMPUS VERIFICATION", style = MaterialTheme.typography.labelSmall.copy(fontFamily = FontFamily.Monospace), color = MaterialTheme.colorScheme.onSurfaceVariant)
              }
              Text("OFFICIAL", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), color = Color(0xFF16A34A))
            }
          }
        }
      }

      Spacer(modifier = Modifier.height(24.dp))

      // Download / Export Actions
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
      ) {
        Button(
          onClick = {
            coroutineScope.launch {
              snackbarHostState.showSnackbar("Digital ID Card saved to device gallery!")
            }
          },
          modifier = Modifier.weight(1f).testTag("button_save_id_card")
        ) {
          Icon(Icons.Default.Download, contentDescription = null)
          Spacer(modifier = Modifier.width(6.dp))
          Text("Save ID Card")
        }

        OutlinedButton(
          onClick = {
            coroutineScope.launch {
              snackbarHostState.showSnackbar("ID Card link copied for verification!")
            }
          },
          modifier = Modifier.weight(1f)
        ) {
          Icon(Icons.Default.Share, contentDescription = null)
          Spacer(modifier = Modifier.width(6.dp))
          Text("Share ID")
        }
      }
    }
  }
}
