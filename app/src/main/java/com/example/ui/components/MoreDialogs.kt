package com.example.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.data.local.entity.StudentProfileEntity
import com.example.data.local.entity.SubjectEntity
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun AddTimetableClassDialog(
  subjects: List<SubjectEntity>,
  initialDay: Int = 1,
  onDismiss: () -> Unit,
  onConfirm: (subjectId: Long, dayOfWeek: Int, startTime: String, endTime: String, room: String, teacher: String, colorHex: String) -> Unit
) {
  var selectedSubject by remember { mutableStateOf(subjects.firstOrNull()) }
  var dayOfWeek by remember { mutableIntStateOf(initialDay) }
  var startTime by remember { mutableStateOf("09:00") }
  var endTime by remember { mutableStateOf("10:00") }
  var room by remember { mutableStateOf("Room 204") }
  var teacher by remember { mutableStateOf("") }
  val days = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat")

  AlertDialog(
    onDismissRequest = onDismiss,
    title = { Text("Add Timetable Class", fontWeight = FontWeight.Bold) },
    text = {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        Text("Day of Week", style = MaterialTheme.typography.labelMedium)
        Row(
          modifier = Modifier.fillMaxWidth(),
          horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
          days.forEachIndexed { index, name ->
            val d = index + 1
            Surface(
              shape = RoundedCornerShape(8.dp),
              color = if (dayOfWeek == d) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant,
              modifier = Modifier
                .weight(1f)
                .clickable { dayOfWeek = d }
            ) {
              Text(
                text = name,
                style = MaterialTheme.typography.labelSmall,
                modifier = Modifier.padding(vertical = 8.dp),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
              )
            }
          }
        }

        if (subjects.isNotEmpty()) {
          Text("Subject", style = MaterialTheme.typography.labelMedium)
          Column {
            subjects.forEach { s ->
              Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.clickable {
                  selectedSubject = s
                  if (teacher.isBlank()) teacher = s.teacher
                }
              ) {
                RadioButton(selected = selectedSubject?.id == s.id, onClick = {
                  selectedSubject = s
                  if (teacher.isBlank()) teacher = s.teacher
                })
                Text(s.name, style = MaterialTheme.typography.bodySmall)
              }
            }
          }
        }

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
          OutlinedTextField(
            value = startTime,
            onValueChange = { startTime = it },
            label = { Text("Start (HH:MM)") },
            modifier = Modifier.weight(1f)
          )
          OutlinedTextField(
            value = endTime,
            onValueChange = { endTime = it },
            label = { Text("End (HH:MM)") },
            modifier = Modifier.weight(1f)
          )
        }

        OutlinedTextField(
          value = room,
          onValueChange = { room = it },
          label = { Text("Room / Lab") },
          modifier = Modifier.fillMaxWidth()
        )

        OutlinedTextField(
          value = teacher,
          onValueChange = { teacher = it },
          label = { Text("Teacher (optional)") },
          modifier = Modifier.fillMaxWidth()
        )
      }
    },
    confirmButton = {
      Button(
        onClick = {
          selectedSubject?.let { sub ->
            onConfirm(sub.id, dayOfWeek, startTime.trim(), endTime.trim(), room.trim(), teacher.trim(), sub.colorHex)
          }
        },
        enabled = selectedSubject != null
      ) {
        Text("Save Class")
      }
    },
    dismissButton = {
      TextButton(onClick = onDismiss) { Text("Cancel") }
    }
  )
}

@Composable
fun AddDocumentDialog(
  subjects: List<SubjectEntity>,
  onDismiss: () -> Unit,
  onConfirm: (title: String, description: String, docType: String, fileSize: String, pageCount: Int, subjectId: Long?) -> Unit
) {
  var title by remember { mutableStateOf("") }
  var description by remember { mutableStateOf("") }
  val docTypes = listOf("BOOK", "LECTURE_NOTES", "SYLLABUS", "ASSIGNMENT", "LAB_PRACTICAL")
  var selectedType by remember { mutableStateOf("BOOK") }
  var selectedSubjectId by remember { mutableStateOf<Long?>(subjects.firstOrNull()?.id) }

  AlertDialog(
    onDismissRequest = onDismiss,
    title = { Text("Add Academic Book / PDF", fontWeight = FontWeight.Bold) },
    text = {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        OutlinedTextField(
          value = title,
          onValueChange = { title = it },
          label = { Text("Document / Book Title *") },
          singleLine = true,
          modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
          value = description,
          onValueChange = { description = it },
          label = { Text("Description / Author") },
          modifier = Modifier.fillMaxWidth()
        )

        Text("Document Type", style = MaterialTheme.typography.labelMedium)
        Column {
          docTypes.forEach { t ->
            Row(
              verticalAlignment = Alignment.CenterVertically,
              modifier = Modifier.clickable { selectedType = t }
            ) {
              RadioButton(selected = selectedType == t, onClick = { selectedType = t })
              Text(t.replace("_", " "), style = MaterialTheme.typography.bodySmall)
            }
          }
        }

        if (subjects.isNotEmpty()) {
          Text("Subject", style = MaterialTheme.typography.labelMedium)
          Column {
            subjects.forEach { s ->
              Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.clickable { selectedSubjectId = s.id }
              ) {
                RadioButton(selected = selectedSubjectId == s.id, onClick = { selectedSubjectId = s.id })
                Text(s.name, style = MaterialTheme.typography.bodySmall)
              }
            }
          }
        }
      }
    },
    confirmButton = {
      Button(
        onClick = {
          if (title.isNotBlank()) {
            onConfirm(title.trim(), description.trim(), selectedType, "4.2 MB", 120, selectedSubjectId)
          }
        },
        enabled = title.isNotBlank()
      ) {
        Text("Save Document")
      }
    },
    dismissButton = {
      TextButton(onClick = onDismiss) { Text("Cancel") }
    }
  )
}

@Composable
fun AddNoteDialog(
  subjects: List<SubjectEntity>,
  onDismiss: () -> Unit,
  onConfirm: (title: String, content: String, subjectId: Long?, hasPhoto: Boolean) -> Unit
) {
  var title by remember { mutableStateOf("") }
  var content by remember { mutableStateOf("") }
  var hasPhoto by remember { mutableStateOf(false) }
  var selectedSubjectId by remember { mutableStateOf<Long?>(subjects.firstOrNull()?.id) }

  AlertDialog(
    onDismissRequest = onDismiss,
    title = { Text("New Note", fontWeight = FontWeight.Bold) },
    text = {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        OutlinedTextField(
          value = title,
          onValueChange = { title = it },
          label = { Text("Note Title *") },
          singleLine = true,
          modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
          value = content,
          onValueChange = { content = it },
          label = { Text("Note Content / Formulae *") },
          minLines = 4,
          modifier = Modifier.fillMaxWidth()
        )

        Row(
          verticalAlignment = Alignment.CenterVertically,
          modifier = Modifier.clickable { hasPhoto = !hasPhoto }
        ) {
          Checkbox(checked = hasPhoto, onCheckedChange = { hasPhoto = it })
          Text("Attach photo of board/handwritten notes", style = MaterialTheme.typography.bodySmall)
        }

        if (subjects.isNotEmpty()) {
          Text("Subject", style = MaterialTheme.typography.labelMedium)
          Column {
            subjects.forEach { s ->
              Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.clickable { selectedSubjectId = s.id }
              ) {
                RadioButton(selected = selectedSubjectId == s.id, onClick = { selectedSubjectId = s.id })
                Text(s.name, style = MaterialTheme.typography.bodySmall)
              }
            }
          }
        }
      }
    },
    confirmButton = {
      Button(
        onClick = {
          if (title.isNotBlank() && content.isNotBlank()) {
            onConfirm(title.trim(), content.trim(), selectedSubjectId, hasPhoto)
          }
        },
        enabled = title.isNotBlank() && content.isNotBlank()
      ) {
        Text("Save Note")
      }
    },
    dismissButton = {
      TextButton(onClick = onDismiss) { Text("Cancel") }
    }
  )
}

@Composable
fun EditProfileDialog(
  profile: StudentProfileEntity?,
  onDismiss: () -> Unit,
  onConfirm: (name: String, college: String, course: String, sem: String, roll: String, branch: String, validThru: String, targetAttendance: Float) -> Unit
) {
  var name by remember { mutableStateOf(profile?.name ?: "Suraj Maurya") }
  var college by remember { mutableStateOf(profile?.collegeName ?: "National Institute of Technology") }
  var course by remember { mutableStateOf(profile?.course ?: "B.Tech CSE") }
  var sem by remember { mutableStateOf(profile?.semester ?: "Semester 5") }
  var roll by remember { mutableStateOf(profile?.rollNumber ?: "2024CS042") }
  var branch by remember { mutableStateOf(profile?.branch ?: "CSE") }
  var targetAttStr by remember { mutableStateOf((profile?.targetAttendance ?: 75.0f).toInt().toString()) }

  AlertDialog(
    onDismissRequest = onDismiss,
    title = { Text("Edit Student Profile", fontWeight = FontWeight.Bold) },
    text = {
      Column(
        modifier = Modifier
          .fillMaxWidth()
          .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(10.dp)
      ) {
        OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Full Name *") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = college, onValueChange = { college = it }, label = { Text("College / University *") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = course, onValueChange = { course = it }, label = { Text("Course / Degree") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = sem, onValueChange = { sem = it }, label = { Text("Current Semester") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = roll, onValueChange = { roll = it }, label = { Text("College ID / Roll No") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = branch, onValueChange = { branch = it }, label = { Text("Department / Branch") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(value = targetAttStr, onValueChange = { targetAttStr = it }, label = { Text("Target Attendance % (default 75)") }, modifier = Modifier.fillMaxWidth())
      }
    },
    confirmButton = {
      Button(
        onClick = {
          val target = targetAttStr.toFloatOrNull() ?: 75.0f
          onConfirm(name.trim(), college.trim(), course.trim(), sem.trim(), roll.trim(), branch.trim(), "2027-06-30", target)
        },
        enabled = name.isNotBlank()
      ) {
        Text("Save Changes")
      }
    },
    dismissButton = {
      TextButton(onClick = onDismiss) { Text("Cancel") }
    }
  )
}
