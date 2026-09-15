package com.example.ui.screens

import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.data.local.entity.AcademicDocumentEntity
import com.example.ui.components.AddDocumentDialog
import com.example.ui.viewmodel.CampusViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BooksScreen(
  viewModel: CampusViewModel,
  onBack: () -> Unit,
  modifier: Modifier = Modifier
) {
  val documents by viewModel.documents.collectAsStateWithLifecycle()
  val subjects by viewModel.subjects.collectAsStateWithLifecycle()

  val filters = listOf("All", "Books", "Lecture Notes", "Assignments", "Lab Manuals")
  var selectedFilter by remember { mutableStateOf("All") }

  var showAddDialog by remember { mutableStateOf(false) }
  var viewingDoc by remember { mutableStateOf<AcademicDocumentEntity?>(null) }

  val filteredDocs = remember(documents, selectedFilter) {
    when (selectedFilter) {
      "Books" -> documents.filter { it.docType == "BOOK" }
      "Lecture Notes" -> documents.filter { it.docType == "LECTURE_NOTES" }
      "Assignments" -> documents.filter { it.docType == "ASSIGNMENT" }
      "Lab Manuals" -> documents.filter { it.docType == "LAB_PRACTICAL" }
      else -> documents
    }
  }

  Box(modifier = modifier.fillMaxSize()) {
    Column(modifier = Modifier.fillMaxSize()) {
      TopAppBar(
        title = { Text("Books & Academic PDFs", fontWeight = FontWeight.Bold) },
        navigationIcon = {
          IconButton(onClick = onBack) {
            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
          }
        }
      )

      // Filter chips
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
      ) {
        filters.take(3).forEach { filter ->
          val isSelected = selectedFilter == filter
          Surface(
            shape = RoundedCornerShape(12.dp),
            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant,
            modifier = Modifier.clickable { selectedFilter = filter }
          ) {
            Text(
              text = filter,
              style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
              color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface,
              modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
            )
          }
        }
      }

      LazyColumn(
        modifier = Modifier
          .fillMaxSize()
          .testTag("books_list"),
        contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 8.dp, bottom = 96.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        items(filteredDocs, key = { it.id }) { doc ->
          val sub = subjects.firstOrNull { it.id == doc.subjectId }

          Card(
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
            modifier = Modifier
              .fillMaxWidth()
              .clickable { viewingDoc = doc }
          ) {
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
              ) {
                Box(
                  modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFFFEE2E2)),
                  contentAlignment = Alignment.Center
                ) {
                  Icon(
                    imageVector = Icons.Default.PictureAsPdf,
                    contentDescription = null,
                    tint = Color(0xFFDC2626),
                    modifier = Modifier.size(24.dp)
                  )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                  Text(
                    text = doc.title,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = MaterialTheme.colorScheme.onSurface
                  )
                  Text(
                    text = "${doc.docType.replace("_", " ")}${if (sub != null) " • ${sub.name}" else ""} • ${doc.fileSize}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                  )
                }
              }

              Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = { viewingDoc = doc }) {
                  Icon(Icons.Default.Visibility, contentDescription = "Read", tint = MaterialTheme.colorScheme.primary)
                }
                IconButton(onClick = { viewModel.deleteDocument(doc.id) }) {
                  Icon(Icons.Default.Delete, contentDescription = "Delete", tint = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(18.dp))
                }
              }
            }
          }
        }
      }
    }

    FloatingActionButton(
      onClick = { showAddDialog = true },
      modifier = Modifier
        .align(Alignment.BottomEnd)
        .padding(16.dp)
        .testTag("fab_add_book"),
      containerColor = MaterialTheme.colorScheme.primary,
      contentColor = Color.White
    ) {
      Icon(Icons.Default.Add, contentDescription = "Add Document")
    }
  }

  // Document Reader Viewer Dialog
  viewingDoc?.let { doc ->
    val sub = subjects.firstOrNull { it.id == doc.subjectId }
    AlertDialog(
      onDismissRequest = { viewingDoc = null },
      title = { Text(doc.title, fontWeight = FontWeight.Bold) },
      text = {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
          Text(doc.description, style = MaterialTheme.typography.bodyMedium)
          Box(
            modifier = Modifier
              .fillMaxWidth()
              .clip(RoundedCornerShape(12.dp))
              .background(MaterialTheme.colorScheme.surfaceVariant)
              .padding(16.dp),
            contentAlignment = Alignment.Center
          ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
              Icon(Icons.Default.PictureAsPdf, contentDescription = null, tint = Color(0xFFDC2626), modifier = Modifier.size(36.dp))
              Spacer(modifier = Modifier.height(6.dp))
              Text("PDF Preview Active", style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold))
              Text("${doc.pageCount} pages • ${doc.fileSize} • Ready to read", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
          }
        }
      },
      confirmButton = {
        TextButton(onClick = { viewingDoc = null }) { Text("Close") }
      }
    )
  }

  if (showAddDialog) {
    AddDocumentDialog(
      subjects = subjects,
      onDismiss = { showAddDialog = false },
      onConfirm = { title, desc, type, size, pages, subId ->
        viewModel.addDocument(title, desc, type, size, pages, subId)
        showAddDialog = false
      }
    )
  }
}
