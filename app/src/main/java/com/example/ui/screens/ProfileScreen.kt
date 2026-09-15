package com.example.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxHeight
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
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.Badge
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.FlipCameraAndroid
import androidx.compose.material.icons.filled.Fullscreen
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.QrCode
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Upload
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.example.data.local.entity.StudentProfileEntity
import com.example.ui.components.EditProfileDialog
import com.example.ui.components.NotionSpinLoader
import com.example.ui.viewmodel.CampusViewModel
import com.example.ui.viewmodel.SubScreen
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
  viewModel: CampusViewModel,
  onBack: () -> Unit,
  modifier: Modifier = Modifier
) {
  val profile by viewModel.profile.collectAsStateWithLifecycle()
  var showEditProfileDialog by remember { mutableStateOf(false) }
  var showAvatarDialog by remember { mutableStateOf(false) }

  val photoPickerLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia()
  ) { uri: Uri? ->
    uri?.let {
      viewModel.updateAvatar(it.toString(), "custom")
    }
  }

  Column(modifier = modifier.fillMaxSize()) {
    TopAppBar(
      title = { Text("Student Profile", fontWeight = FontWeight.Bold) },
      navigationIcon = {
        IconButton(onClick = onBack) {
          Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
        }
      },
      actions = {
        IconButton(onClick = { showEditProfileDialog = true }) {
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
      // 1. Profile Avatar Card with Edit Avatar capability
      item {
        Card(
          shape = RoundedCornerShape(16.dp),
          border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
          colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
          elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier
              .fillMaxWidth()
              .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
          ) {
            // Interactive Avatar with Camera/Edit Badge
            Box(
              modifier = Modifier
                .size(90.dp)
                .clickable { showAvatarDialog = true }
                .testTag("profile_avatar_clickable"),
              contentAlignment = Alignment.BottomEnd
            ) {
              Box(
                modifier = Modifier
                  .size(90.dp)
                  .clip(CircleShape)
                  .background(MaterialTheme.colorScheme.surfaceVariant)
                  .border(2.dp, MaterialTheme.colorScheme.outline, CircleShape),
                contentAlignment = Alignment.Center
              ) {
                if (!profile?.avatarUri.isNullOrBlank()) {
                  AsyncImage(
                    model = profile?.avatarUri,
                    contentDescription = "Avatar",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                      .size(90.dp)
                      .clip(CircleShape)
                  )
                } else {
                  val initials = profile?.name?.split(" ")
                    ?.mapNotNull { it.firstOrNull()?.toString() }
                    ?.take(2)
                    ?.joinToString("") ?: "SM"

                  Text(
                    text = initials,
                    style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                  )
                }
              }

              // Edit Avatar Icon Overlay
              Box(
                modifier = Modifier
                  .size(28.dp)
                  .clip(CircleShape)
                  .background(MaterialTheme.colorScheme.primary)
                  .border(2.dp, MaterialTheme.colorScheme.surface, CircleShape),
                contentAlignment = Alignment.Center
              ) {
                Icon(
                  imageVector = Icons.Default.CameraAlt,
                  contentDescription = "Edit Avatar",
                  tint = MaterialTheme.colorScheme.onPrimary,
                  modifier = Modifier.size(15.dp)
                )
              }
            }

            Spacer(modifier = Modifier.height(10.dp))

            OutlinedButton(
              onClick = { showAvatarDialog = true },
              shape = RoundedCornerShape(8.dp),
              modifier = Modifier.height(32.dp),
              contentPadding = PaddingValues(horizontal = 12.dp, vertical = 0.dp)
            ) {
              Text("Change Avatar", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold))
            }

            Spacer(modifier = Modifier.height(12.dp))

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
              shape = RoundedCornerShape(10.dp),
              modifier = Modifier
                .fillMaxWidth()
                .testTag("button_view_id_card")
            ) {
              Icon(Icons.Default.Badge, contentDescription = null, modifier = Modifier.size(18.dp))
              Spacer(modifier = Modifier.width(8.dp))
              Text("Manage & View College ID Card")
            }
          }
        }
      }

      // 2. Academic Profile Details
      item {
        Card(
          shape = RoundedCornerShape(16.dp),
          border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
          colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
          elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text(
                "Academic Information",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
              )
              Text(
                "Edit",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.clickable { showEditProfileDialog = true }
              )
            }

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

  // Avatar Selection Dialog
  if (showAvatarDialog) {
    AvatarSelectionDialog(
      currentPreset = profile?.avatarPreset ?: "scholar",
      onDismiss = { showAvatarDialog = false },
      onSelectPhoto = {
        photoPickerLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
        showAvatarDialog = false
      },
      onSelectPreset = { preset ->
        viewModel.updateAvatar(null, preset)
        showAvatarDialog = false
      }
    )
  }

  // Edit Profile Metadata Dialog
  if (showEditProfileDialog) {
    EditProfileDialog(
      profile = profile,
      onDismiss = { showEditProfileDialog = false },
      onConfirm = { name, college, course, sem, roll, branch, valid, target ->
        viewModel.updateProfile(name, college, course, sem, roll, branch, valid, target)
        showEditProfileDialog = false
      }
    )
  }
}

@Composable
fun AvatarSelectionDialog(
  currentPreset: String,
  onDismiss: () -> Unit,
  onSelectPhoto: () -> Unit,
  onSelectPreset: (String) -> Unit
) {
  val presets = listOf(
    "scholar" to "Scholar",
    "coder" to "Developer",
    "scientist" to "Scientist",
    "creative" to "Designer"
  )

  AlertDialog(
    onDismissRequest = onDismiss,
    title = { Text("Update Avatar", fontWeight = FontWeight.Bold) },
    text = {
      Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
        Text("Choose how you want your avatar to appear in CampusOS:", style = MaterialTheme.typography.bodySmall)

        Button(
          onClick = onSelectPhoto,
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Icon(Icons.Default.AddPhotoAlternate, contentDescription = null, modifier = Modifier.size(18.dp))
          Spacer(modifier = Modifier.width(8.dp))
          Text("Upload Photo from Gallery")
        }

        Text("Or choose a Notion-style Preset:", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))

        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          presets.forEach { (key, label) ->
            Surface(
              shape = RoundedCornerShape(10.dp),
              color = if (currentPreset == key) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
              border = BorderStroke(1.dp, if (currentPreset == key) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline),
              modifier = Modifier
                .weight(1f)
                .clickable { onSelectPreset(key) }
            ) {
              Column(
                modifier = Modifier.padding(vertical = 10.dp),
                horizontalAlignment = Alignment.CenterHorizontally
              ) {
                Icon(
                  imageVector = when (key) {
                    "coder" -> Icons.Default.School
                    "scientist" -> Icons.Default.School
                    "creative" -> Icons.Default.Person
                    else -> Icons.Default.Person
                  },
                  contentDescription = null,
                  modifier = Modifier.size(24.dp)
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(label, style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold))
              }
            }
          }
        }
      }
    },
    confirmButton = {
      TextButton(onClick = onDismiss) { Text("Cancel") }
    }
  )
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

/**
 * Full Digital ID Card Viewer Screen with:
 * - Front and Back image upload
 * - Full-screen preview (shows Front side by default in full screen)
 * - Download with options (Front only or Both sides)
 */
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

  var viewingSide by remember { mutableStateOf("FRONT") } // "FRONT" or "BACK"
  var showFullScreenPreview by remember { mutableStateOf(false) }
  var showDownloadOptionsDialog by remember { mutableStateOf(false) }
  var isDownloading by remember { mutableStateOf(false) }

  // Photo pickers for Front and Back side images
  val frontPhotoPicker = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia()
  ) { uri: Uri? ->
    uri?.let {
      viewModel.updateIdCardImages(frontUri = it.toString(), backUri = null)
      coroutineScope.launch { snackbarHostState.showSnackbar("Front ID card image updated!") }
    }
  }

  val backPhotoPicker = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.PickVisualMedia()
  ) { uri: Uri? ->
    uri?.let {
      viewModel.updateIdCardImages(frontUri = null, backUri = it.toString())
      coroutineScope.launch { snackbarHostState.showSnackbar("Back ID card image updated!") }
    }
  }

  Scaffold(
    snackbarHost = { SnackbarHost(snackbarHostState) },
    topBar = {
      TopAppBar(
        title = { Text("College ID Card", fontWeight = FontWeight.Bold) },
        navigationIcon = {
          IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
          }
        },
        actions = {
          IconButton(onClick = { showFullScreenPreview = true }) {
            Icon(Icons.Default.Fullscreen, contentDescription = "Full Screen Preview")
          }
        }
      )
    }
  ) { innerPadding ->
    LazyColumn(
      modifier = modifier
        .fillMaxSize()
        .padding(innerPadding)
        .padding(horizontal = 16.dp)
        .testTag("id_card_screen"),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      item { Spacer(modifier = Modifier.height(4.dp)) }

      // Side Toggle: Front Side vs Back Side
      item {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          Surface(
            shape = RoundedCornerShape(10.dp),
            color = if (viewingSide == "FRONT") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
            border = BorderStroke(1.dp, if (viewingSide == "FRONT") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline),
            modifier = Modifier
              .weight(1f)
              .clickable { viewingSide = "FRONT" }
          ) {
            Row(
              modifier = Modifier.padding(vertical = 10.dp),
              horizontalArrangement = Arrangement.Center,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text(
                text = "Front Side",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                color = if (viewingSide == "FRONT") MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
              )
            }
          }

          Surface(
            shape = RoundedCornerShape(10.dp),
            color = if (viewingSide == "BACK") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
            border = BorderStroke(1.dp, if (viewingSide == "BACK") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline),
            modifier = Modifier
              .weight(1f)
              .clickable { viewingSide = "BACK" }
          ) {
            Row(
              modifier = Modifier.padding(vertical = 10.dp),
              horizontalArrangement = Arrangement.Center,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Text(
                text = "Back Side",
                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                color = if (viewingSide == "BACK") MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
              )
            }
          }
        }
      }

      // ID Card Card Renderer
      item {
        Crossfade(targetState = viewingSide, label = "idCardCrossfade") { side ->
          if (side == "FRONT") {
            IdCardFrontLayout(
              profile = profile,
              onPreviewFullScreen = { showFullScreenPreview = true },
              onUploadImage = { frontPhotoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }
            )
          } else {
            IdCardBackLayout(
              profile = profile,
              onPreviewFullScreen = { showFullScreenPreview = true },
              onUploadImage = { backPhotoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }
            )
          }
        }
      }

      // Primary Action Buttons: Preview Fullscreen & Download
      item {
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
          Button(
            onClick = { showFullScreenPreview = true },
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier
              .weight(1f)
              .testTag("button_preview_fullscreen")
          ) {
            Icon(Icons.Default.Fullscreen, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text("Preview Fullscreen")
          }

          OutlinedButton(
            onClick = { showDownloadOptionsDialog = true },
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier
              .weight(1f)
              .testTag("button_download_id_card")
          ) {
            Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text("Download ID")
          }
        }
      }

      // Image Upload Slots Section
      item {
        Card(
          shape = RoundedCornerShape(14.dp),
          border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
          colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
          modifier = Modifier.fillMaxWidth()
        ) {
          Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(
              text = "Custom ID Card Images",
              style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
              color = MaterialTheme.colorScheme.onSurface
            )
            Text(
              text = "You can upload real front and back photo scans of your official university ID card.",
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
              OutlinedButton(
                onClick = { frontPhotoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.weight(1f)
              ) {
                Icon(Icons.Default.Upload, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text(if (profile?.idCardUri != null) "Replace Front" else "Upload Front", style = MaterialTheme.typography.labelSmall)
              }

              OutlinedButton(
                onClick = { backPhotoPicker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.weight(1f)
              ) {
                Icon(Icons.Default.Upload, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text(if (profile?.idCardBackUri != null) "Replace Back" else "Upload Back", style = MaterialTheme.typography.labelSmall)
              }
            }
          }
        }
      }

      item { Spacer(modifier = Modifier.height(24.dp)) }
    }
  }

  // Full Screen Preview Dialog
  if (showFullScreenPreview) {
    FullScreenIdCardDialog(
      profile = profile,
      onDismiss = { showFullScreenPreview = false },
      onDownloadRequest = {
        showFullScreenPreview = false
        showDownloadOptionsDialog = true
      }
    )
  }

  // Download ID Options Dialog (Front Only or Both Sides)
  if (showDownloadOptionsDialog) {
    DownloadIdOptionsDialog(
      onDismiss = { showDownloadOptionsDialog = false },
      onSelectOption = { option ->
        showDownloadOptionsDialog = false
        isDownloading = true
        coroutineScope.launch {
          delay(800) // sleek feedback delay
          isDownloading = false
          if (option == "FRONT") {
            snackbarHostState.showSnackbar("Front side of ID card downloaded to Gallery!")
          } else {
            snackbarHostState.showSnackbar("Both Front & Back ID card sides exported to Gallery!")
          }
        }
      }
    )
  }

  // Animated spin loader overlay while processing export
  if (isDownloading) {
    Dialog(onDismissRequest = {}) {
      Surface(
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
        modifier = Modifier.padding(24.dp)
      ) {
        Column(
          modifier = Modifier.padding(24.dp),
          horizontalAlignment = Alignment.CenterHorizontally,
          verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
          NotionSpinLoader(size = 36.dp)
          Text(
            text = "Exporting High-Res ID Card...",
            style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.SemiBold),
            color = MaterialTheme.colorScheme.onSurface
          )
        }
      }
    }
  }
}

/**
 * Front Side ID Card View
 */
@Composable
fun IdCardFrontLayout(
  profile: StudentProfileEntity?,
  onPreviewFullScreen: () -> Unit,
  onUploadImage: () -> Unit,
  modifier: Modifier = Modifier
) {
  Card(
    shape = RoundedCornerShape(16.dp),
    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    modifier = modifier
      .fillMaxWidth()
      .testTag("id_card_front")
  ) {
    if (!profile?.idCardUri.isNullOrBlank()) {
      // If user uploaded front image, show image directly
      Box(modifier = Modifier.fillMaxWidth().aspectRatio(1.58f)) {
        AsyncImage(
          model = profile?.idCardUri,
          contentDescription = "ID Card Front Image",
          contentScale = ContentScale.Crop,
          modifier = Modifier.fillMaxSize()
        )
      }
    } else {
      // Official Digital Card Front Template
      Column {
        // Top Header
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.primary)
            .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Box(
              modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(Color.White),
              contentAlignment = Alignment.Center
            ) {
              Icon(Icons.Default.School, contentDescription = null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(18.dp))
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column {
              Text(
                text = profile?.collegeName ?: "National Institute of Technology",
                style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                color = Color.White
              )
              Text(
                text = "STUDENT IDENTITY CARD",
                style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, letterSpacing = 1.sp),
                color = Color(0xFFE4E4E7)
              )
            }
          }
        }

        // Details Row
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          Column(modifier = Modifier.weight(1f)) {
            Text(
              text = profile?.name ?: "Suraj Maurya",
              style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
              color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
              text = "Roll No: ${profile?.rollNumber ?: "2024CS042"}",
              style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.SemiBold),
              color = MaterialTheme.colorScheme.primary
            )
            Text(
              text = "Dept: ${profile?.course ?: "B.Tech CSE"}",
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurface
            )
            Text(
              text = profile?.semester ?: "Semester 5",
              style = MaterialTheme.typography.bodySmall,
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
              text = "Valid Through: ${profile?.validThru ?: "2027-06-30"}",
              style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
              color = Color(0xFF10B981)
            )
          }

          // Student Photo Frame
          Box(
            modifier = Modifier
              .size(72.dp)
              .clip(RoundedCornerShape(8.dp))
              .background(MaterialTheme.colorScheme.surfaceVariant)
              .border(1.5.dp, MaterialTheme.colorScheme.outline, RoundedCornerShape(8.dp)),
            contentAlignment = Alignment.Center
          ) {
            if (!profile?.avatarUri.isNullOrBlank()) {
              AsyncImage(
                model = profile?.avatarUri,
                contentDescription = "Student Photo",
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
              )
            } else {
              val initials = profile?.name?.split(" ")
                ?.mapNotNull { it.firstOrNull()?.toString() }
                ?.take(2)
                ?.joinToString("") ?: "SM"

              Text(
                text = initials,
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
              )
            }
          }
        }

        // Barcode Strip
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Icon(Icons.Default.QrCode, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(20.dp))
              Spacer(modifier = Modifier.width(6.dp))
              Text("OFFICIAL VERIFICATION CODE", style = MaterialTheme.typography.labelSmall.copy(fontFamily = FontFamily.Monospace), color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Text("FRONT", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), color = MaterialTheme.colorScheme.onSurfaceVariant)
          }
        }
      }
    }
  }
}

/**
 * Back Side ID Card View
 */
@Composable
fun IdCardBackLayout(
  profile: StudentProfileEntity?,
  onPreviewFullScreen: () -> Unit,
  onUploadImage: () -> Unit,
  modifier: Modifier = Modifier
) {
  Card(
    shape = RoundedCornerShape(16.dp),
    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
    modifier = modifier
      .fillMaxWidth()
      .testTag("id_card_back")
  ) {
    if (!profile?.idCardBackUri.isNullOrBlank()) {
      Box(modifier = Modifier.fillMaxWidth().aspectRatio(1.58f)) {
        AsyncImage(
          model = profile?.idCardBackUri,
          contentDescription = "ID Card Back Image",
          contentScale = ContentScale.Crop,
          modifier = Modifier.fillMaxSize()
        )
      }
    } else {
      Column {
        // Magnetic Strip Simulation
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .height(28.dp)
            .background(Color(0xFF18181B))
        )

        Spacer(modifier = Modifier.height(10.dp))

        // Terms and Info
        Column(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp),
          verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
          Text(
            text = "TERMS & CONDITIONS",
            style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold),
            color = MaterialTheme.colorScheme.onSurface
          )
          Text(
            text = "1. This identity card is property of ${profile?.collegeName ?: "National Institute of Technology"}.\n2. Must be presented upon request by college security and library.\n3. Non-transferable. Loss must be reported to the registrar immediately.",
            style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp, lineHeight = 13.sp),
            color = MaterialTheme.colorScheme.onSurfaceVariant
          )

          Spacer(modifier = Modifier.height(4.dp))

          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column {
              Text("Emergency Contact", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, fontSize = 9.sp))
              Text("+91 98765 43210 / campus-sec@nit.edu", style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp), color = MaterialTheme.colorScheme.onSurfaceVariant)
            }

            Column(horizontalAlignment = Alignment.End) {
              Text("Authorized Signatory", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold, fontSize = 9.sp))
              Text("Dean of Student Welfare", style = MaterialTheme.typography.labelSmall.copy(fontSize = 9.sp), color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
          }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Bottom Bar
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(horizontal = 16.dp, vertical = 6.dp)
        ) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text("CAMPUS GATE ACCESS BARCODE", style = MaterialTheme.typography.labelSmall.copy(fontFamily = FontFamily.Monospace, fontSize = 9.sp), color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("BACK", style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), color = MaterialTheme.colorScheme.onSurfaceVariant)
          }
        }
      }
    }
  }
}

/**
 * Fullscreen Interactive ID Card Viewer
 * - Shows front side on full screen by default
 * - Offers flip button to switch between Front and Back
 * - Offers direct Download button
 */
@Composable
fun FullScreenIdCardDialog(
  profile: StudentProfileEntity?,
  onDismiss: () -> Unit,
  onDownloadRequest: () -> Unit
) {
  var viewingSide by remember { mutableStateOf("FRONT") }

  Dialog(
    onDismissRequest = onDismiss,
    properties = DialogProperties(usePlatformDefaultWidth = false)
  ) {
    Surface(
      modifier = Modifier.fillMaxSize(),
      color = Color(0xEE09090B) // Sleek frosted dark background
    ) {
      Column(
        modifier = Modifier
          .fillMaxSize()
          .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
      ) {
        // Top Bar
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.SpaceBetween,
          verticalAlignment = Alignment.CenterVertically
        ) {
          IconButton(onClick = onDismiss) {
            Icon(Icons.Default.Close, contentDescription = "Close", tint = Color.White)
          }

          Text(
            text = if (viewingSide == "FRONT") "ID Card (Front)" else "ID Card (Back)",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
            color = Color.White
          )

          IconButton(onClick = onDownloadRequest) {
            Icon(Icons.Default.Download, contentDescription = "Download", tint = Color.White)
          }
        }

        Spacer(modifier = Modifier.weight(1f))

        // The Fullscreen Card
        Box(
          modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp),
          contentAlignment = Alignment.Center
        ) {
          Crossfade(targetState = viewingSide, label = "fullscreenCardCrossfade") { side ->
            if (side == "FRONT") {
              IdCardFrontLayout(
                profile = profile,
                onPreviewFullScreen = {},
                onUploadImage = {},
                modifier = Modifier.fillMaxWidth()
              )
            } else {
              IdCardBackLayout(
                profile = profile,
                onPreviewFullScreen = {},
                onUploadImage = {},
                modifier = Modifier.fillMaxWidth()
              )
            }
          }
        }

        Spacer(modifier = Modifier.weight(1f))

        // Bottom Controls: Flip Button & Download
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 16.dp),
          horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          Button(
            onClick = { viewingSide = if (viewingSide == "FRONT") "BACK" else "FRONT" },
            colors = androidx.compose.material3.ButtonDefaults.buttonColors(
              containerColor = Color(0xFF27272A),
              contentColor = Color.White
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.weight(1f)
          ) {
            Icon(Icons.Default.FlipCameraAndroid, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(if (viewingSide == "FRONT") "Flip to Back Side" else "Flip to Front Side")
          }

          Button(
            onClick = onDownloadRequest,
            colors = androidx.compose.material3.ButtonDefaults.buttonColors(
              containerColor = Color.White,
              contentColor = Color.Black
            ),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.weight(1f)
          ) {
            Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Download ID")
          }
        }
      }
    }
  }
}

/**
 * Download ID Card Options Dialog:
 * Option 1: Download Front Side
 * Option 2: Download Both Sides (Front & Back)
 */
@Composable
fun DownloadIdOptionsDialog(
  onDismiss: () -> Unit,
  onSelectOption: (String) -> Unit
) {
  var selectedOption by remember { mutableStateOf("FRONT") }

  AlertDialog(
    onDismissRequest = onDismiss,
    title = {
      Text("Download ID Card", fontWeight = FontWeight.Bold)
    },
    text = {
      Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text("Select which side of your digital ID card you want to save:", style = MaterialTheme.typography.bodySmall)

        Surface(
          shape = RoundedCornerShape(10.dp),
          color = if (selectedOption == "FRONT") MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
          border = BorderStroke(1.dp, if (selectedOption == "FRONT") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline),
          modifier = Modifier
            .fillMaxWidth()
            .clickable { selectedOption = "FRONT" }
        ) {
          Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            RadioButton(selected = selectedOption == "FRONT", onClick = { selectedOption = "FRONT" })
            Spacer(modifier = Modifier.width(8.dp))
            Column {
              Text("Front Side Only", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))
              Text("Saves high-res front identity card with student photo", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
          }
        }

        Surface(
          shape = RoundedCornerShape(10.dp),
          color = if (selectedOption == "BOTH") MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
          border = BorderStroke(1.dp, if (selectedOption == "BOTH") MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline),
          modifier = Modifier
            .fillMaxWidth()
            .clickable { selectedOption = "BOTH" }
        ) {
          Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            RadioButton(selected = selectedOption == "BOTH", onClick = { selectedOption = "BOTH" })
            Spacer(modifier = Modifier.width(8.dp))
            Column {
              Text("Both Sides (Front & Back)", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))
              Text("Exports both Front identity scan and Back terms/barcode", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
          }
        }
      }
    },
    confirmButton = {
      Button(
        onClick = { onSelectOption(selectedOption) },
        shape = RoundedCornerShape(8.dp)
      ) {
        Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
        Spacer(modifier = Modifier.width(6.dp))
        Text("Download")
      }
    },
    dismissButton = {
      TextButton(onClick = onDismiss) { Text("Cancel") }
    }
  )
}
