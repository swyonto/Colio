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
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
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
import com.example.ui.viewmodel.CampusViewModel

data class SearchResult(
  val type: String,
  val title: String,
  val subtitle: String,
  val color: Color
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
  viewModel: CampusViewModel,
  onBack: () -> Unit,
  modifier: Modifier = Modifier
) {
  var query by remember { mutableStateOf("") }
  val subjects by viewModel.subjects.collectAsStateWithLifecycle()
  val tasks by viewModel.tasks.collectAsStateWithLifecycle()
  val notes by viewModel.notes.collectAsStateWithLifecycle()
  val documents by viewModel.documents.collectAsStateWithLifecycle()
  val expenses by viewModel.expenses.collectAsStateWithLifecycle()

  val searchResults = remember(query, subjects, tasks, notes, documents, expenses) {
    if (query.isBlank()) {
      emptyList()
    } else {
      val q = query.trim().lowercase()
      val list = mutableListOf<SearchResult>()

      subjects.filter { it.name.lowercase().contains(q) || it.code.lowercase().contains(q) }.forEach {
        list.add(SearchResult("Subject", it.name, "${it.code} • ${it.teacher}", Color(0xFF4F46E5)))
      }

      tasks.filter { it.title.lowercase().contains(q) || it.description.lowercase().contains(q) }.forEach {
        list.add(SearchResult("Task", it.title, "Due: ${it.dueDate} • ${it.priority}", Color(0xFF0EA5E9)))
      }

      notes.filter { it.title.lowercase().contains(q) || it.content.lowercase().contains(q) }.forEach {
        list.add(SearchResult("Note", it.title, it.content.take(60), Color(0xFF10B981)))
      }

      documents.filter { it.title.lowercase().contains(q) || it.description.lowercase().contains(q) }.forEach {
        list.add(SearchResult("Document", it.title, "${it.docType} • ${it.fileSize}", Color(0xFFEF4444)))
      }

      expenses.filter { it.description.lowercase().contains(q) || it.category.lowercase().contains(q) }.forEach {
        list.add(SearchResult("Expense", "${it.description} - ₹${it.amount.toInt()}", "${it.category} • ${it.expenseDate}", Color(0xFFF59E0B)))
      }

      list
    }
  }

  Column(modifier = modifier.fillMaxSize()) {
    TopAppBar(
      title = { Text("Campus Search", fontWeight = FontWeight.Bold) },
      navigationIcon = {
        IconButton(onClick = onBack) {
          Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
        }
      }
    )

    // Search bar input
    OutlinedTextField(
      value = query,
      onValueChange = { query = it },
      modifier = Modifier
        .fillMaxWidth()
        .padding(horizontal = 16.dp, vertical = 8.dp)
        .testTag("search_input"),
      placeholder = { Text("Search subjects, notes, tasks, expenses...") },
      leadingIcon = {
        Icon(Icons.Default.Search, contentDescription = null, tint = MaterialTheme.colorScheme.onSurfaceVariant)
      },
      trailingIcon = {
        if (query.isNotEmpty()) {
          IconButton(onClick = { query = "" }) {
            Icon(Icons.Default.Clear, contentDescription = "Clear")
          }
        }
      },
      singleLine = true,
      shape = RoundedCornerShape(16.dp)
    )

    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .testTag("search_results_list"),
      contentPadding = PaddingValues(16.dp),
      verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
      if (query.isNotBlank() && searchResults.isEmpty()) {
        item {
          Box(
            modifier = Modifier
              .fillMaxWidth()
              .padding(top = 40.dp),
            contentAlignment = Alignment.Center
          ) {
            Text("No matching results for \"$query\"", color = MaterialTheme.colorScheme.onSurfaceVariant)
          }
        }
      } else {
        items(searchResults) { result ->
          Card(
            shape = RoundedCornerShape(14.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
            modifier = Modifier.fillMaxWidth()
          ) {
            Row(
              modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                  Box(
                    modifier = Modifier
                      .clip(RoundedCornerShape(6.dp))
                      .background(result.color.copy(alpha = 0.15f))
                      .padding(horizontal = 6.dp, vertical = 2.dp)
                  ) {
                    Text(result.type, style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.Bold), color = result.color)
                  }
                  Spacer(modifier = Modifier.width(8.dp))
                  Text(result.title, style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold))
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(result.subtitle, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
              }
            }
          }
        }
      }
    }
  }
}
