package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Fastfood
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.PieChart
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
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
import com.example.ui.components.AddExpenseDialog
import com.example.ui.components.AddQuickExpensePresetDialog
import com.example.ui.components.AppIcons
import com.example.ui.viewmodel.CampusViewModel

@Composable
fun ExpensesScreen(
  viewModel: CampusViewModel,
  modifier: Modifier = Modifier
) {
  val monthTotal by viewModel.currentMonthTotal.collectAsStateWithLifecycle()
  val allExpenses by viewModel.expenses.collectAsStateWithLifecycle()
  val quickExpenses by viewModel.quickExpenses.collectAsStateWithLifecycle()
  val categoryBreakdown by viewModel.categoryBreakdown.collectAsStateWithLifecycle()

  var showAddExpenseDialog by remember { mutableStateOf(false) }
  var showAddQuickPresetDialog by remember { mutableStateOf(false) }

  Box(modifier = modifier.fillMaxSize()) {
    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .testTag("expenses_screen_list"),
      contentPadding = PaddingValues(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 96.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      // 1. Monthly Total Card (PRD Section 19)
      item {
        Card(
          shape = RoundedCornerShape(16.dp),
          border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
          colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
          elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
        ) {
          Column(modifier = Modifier.padding(20.dp)) {
            Text(
              text = "Total Spending This Month",
              style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(10.dp))

            Text(
              text = "₹${String.format("%,.0f", monthTotal)}",
              style = MaterialTheme.typography.displayMedium.copy(
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = (-1).sp
              ),
              color = MaterialTheme.colorScheme.onSurface
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Category Distribution Breakdown (PRD Section 24: Analytics)
            Text(
              text = "Category Breakdown",
              style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
              color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(8.dp))

            if (categoryBreakdown.isEmpty()) {
              Text("No expenses logged yet this month.", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            } else {
              Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                categoryBreakdown.entries.sortedByDescending { it.value }.forEach { (cat, amt) ->
                  val fraction = if (monthTotal > 0) (amt / monthTotal).toFloat() else 0f
                  Column {
                    Row(
                      modifier = Modifier.fillMaxWidth(),
                      horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                      Text(cat, style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Medium))
                      Text("₹${amt.toInt()} (${(fraction * 100).toInt()}%)", style = MaterialTheme.typography.bodySmall.copy(fontWeight = FontWeight.Bold))
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    LinearProgressIndicator(
                      progress = { fraction },
                      modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp)),
                      color = when (cat) {
                        "Food" -> Color(0xFFF59E0B)
                        "Transport" -> Color(0xFF0EA5E9)
                        "Books" -> Color(0xFF10B981)
                        "College" -> Color(0xFF8B5CF6)
                        else -> MaterialTheme.colorScheme.primary
                      },
                      trackColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                  }
                }
              }
            }
          }
        }
      }

      // 2. Quick Expenses Row (PRD Section 22 & 23: 1-Tap Logging Presets)
      item {
        Column {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text(
              text = "Quick Expenses (1-tap log)",
              style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
              color = MaterialTheme.colorScheme.onSurface
            )

            Text(
              text = "+ New Preset",
              style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
              color = MaterialTheme.colorScheme.primary,
              modifier = Modifier.clickable { showAddQuickPresetDialog = true }
            )
          }

          Spacer(modifier = Modifier.height(10.dp))

          Row(
            modifier = Modifier
              .fillMaxWidth()
              .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
          ) {
            quickExpenses.forEach { quick ->
              Surface(
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.surface,
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                modifier = Modifier
                  .clickable { viewModel.logQuickExpense(quick) }
                  .testTag("expenses_quick_${quick.id}")
              ) {
                Row(
                  modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                  verticalAlignment = Alignment.CenterVertically
                ) {
                  Icon(
                    imageVector = AppIcons.getQuickExpenseIcon(quick.icon),
                    contentDescription = null,
                    modifier = Modifier.size(18.dp),
                    tint = MaterialTheme.colorScheme.primary
                  )
                  Spacer(modifier = Modifier.width(8.dp))
                  Column {
                    Text(
                      text = quick.name,
                      style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold),
                      color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                      text = "₹${quick.amount.toInt()}",
                      style = MaterialTheme.typography.bodySmall,
                      color = MaterialTheme.colorScheme.primary
                    )
                  }
                }
              }
            }
          }
        }
      }

      // 3. Expense History (PRD Section 21)
      item {
        Text(
          text = "History (${allExpenses.size} entries)",
          style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
          color = MaterialTheme.colorScheme.onSurface
        )
      }

      items(allExpenses, key = { it.id }) { expense ->
        Card(
          shape = RoundedCornerShape(14.dp),
          border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
          colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
          elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
          modifier = Modifier.fillMaxWidth()
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
              Box(
                modifier = Modifier
                  .size(38.dp)
                  .clip(CircleShape)
                  .background(MaterialTheme.colorScheme.surfaceVariant),
                contentAlignment = Alignment.Center
              ) {
                Icon(
                  imageVector = AppIcons.getExpenseCategoryIcon(expense.category),
                  contentDescription = null,
                  modifier = Modifier.size(20.dp),
                  tint = MaterialTheme.colorScheme.primary
                )
              }

              Spacer(modifier = Modifier.width(12.dp))

              Column {
                Text(
                  text = expense.description,
                  style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
                  color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                  text = "${expense.category} • ${expense.expenseDate}",
                  style = MaterialTheme.typography.bodySmall,
                  color = MaterialTheme.colorScheme.onSurfaceVariant
                )
              }
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
              Text(
                text = "₹${expense.amount.toInt()}",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold),
                color = MaterialTheme.colorScheme.onSurface
              )

              IconButton(
                onClick = { viewModel.deleteExpense(expense.id) },
                modifier = Modifier.size(32.dp)
              ) {
                Icon(
                  imageVector = Icons.Default.Delete,
                  contentDescription = "Delete expense",
                  tint = MaterialTheme.colorScheme.onSurfaceVariant,
                  modifier = Modifier.size(16.dp)
                )
              }
            }
          }
        }
      }
    }

    // Add Expense FAB
    FloatingActionButton(
      onClick = { showAddExpenseDialog = true },
      modifier = Modifier
        .align(Alignment.BottomEnd)
        .padding(end = 16.dp, bottom = 96.dp)
        .testTag("fab_add_expense"),
      containerColor = MaterialTheme.colorScheme.primary,
      contentColor = Color.White
    ) {
      Icon(Icons.Default.Add, contentDescription = "Add Expense")
    }
  }

  if (showAddExpenseDialog) {
    AddExpenseDialog(
      onDismiss = { showAddExpenseDialog = false },
      onConfirm = { amt, cat, desc, date ->
        viewModel.addExpense(amt, cat, desc, date)
        showAddExpenseDialog = false
      }
    )
  }

  if (showAddQuickPresetDialog) {
    AddQuickExpensePresetDialog(
      onDismiss = { showAddQuickPresetDialog = false },
      onConfirm = { name, amt, cat, icon ->
        viewModel.addQuickExpensePreset(name, amt, cat, icon)
        showAddQuickPresetDialog = false
      }
    )
  }
}
