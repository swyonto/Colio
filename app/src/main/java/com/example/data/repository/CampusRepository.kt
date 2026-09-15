package com.example.data.repository

import com.example.data.local.AppDatabase
import com.example.data.local.entity.AcademicDocumentEntity
import com.example.data.local.entity.AddonEntity
import com.example.data.local.entity.AttendanceSessionEntity
import com.example.data.local.entity.ExpenseEntity
import com.example.data.local.entity.HolidayEntity
import com.example.data.local.entity.NoteEntity
import com.example.data.local.entity.QuickExpenseEntity
import com.example.data.local.entity.StudentProfileEntity
import com.example.data.local.entity.SubjectEntity
import com.example.data.local.entity.SyncQueueEntity
import com.example.data.local.entity.TaskEntity
import com.example.data.local.entity.TimetableEntryEntity
import kotlinx.coroutines.flow.Flow
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.max

data class AttendanceSummary(
  val totalClasses: Int,
  val presentClasses: Int,
  val absentClasses: Int,
  val holidayClasses: Int,
  val overallPercentage: Float,
  val classesNeededForTarget: Int,
  val classesCanMiss: Int,
  val targetPercentage: Float = 75.0f
)

data class SubjectAttendance(
  val subject: SubjectEntity,
  val presentCount: Int,
  val absentCount: Int,
  val holidayCount: Int,
  val percentage: Float,
  val neededForTarget: Int,
  val canMiss: Int
)

class CampusRepository(private val db: AppDatabase) {

  // Subjects
  val allSubjects: Flow<List<SubjectEntity>> = db.subjectDao().getAllSubjects()
  suspend fun insertSubject(subject: SubjectEntity): Long {
    val id = db.subjectDao().insertSubject(subject)
    enqueueSync("SUBJECT", id.toString(), "CREATE")
    return id
  }
  suspend fun updateSubject(subject: SubjectEntity) {
    db.subjectDao().updateSubject(subject)
    enqueueSync("SUBJECT", subject.id.toString(), "UPDATE")
  }
  suspend fun deleteSubject(id: Long) {
    db.subjectDao().deleteSubjectById(id)
    db.timetableDao().deleteBySubjectId(id)
    enqueueSync("SUBJECT", id.toString(), "DELETE")
  }

  // Attendance
  val allAttendanceSessions: Flow<List<AttendanceSessionEntity>> = db.attendanceDao().getAllSessions()
  fun getSessionsForSubject(subjectId: Long): Flow<List<AttendanceSessionEntity>> =
    db.attendanceDao().getSessionsBySubject(subjectId)

  suspend fun markAttendance(
    subjectId: Long,
    date: String,
    timeSlot: String,
    status: String,
    notes: String = ""
  ) {
    // Check if Sunday or Holiday
    val isSun = isSunday(date)
    val resolvedStatus = if (isSun) "HOLIDAY" else status
    val existing = db.attendanceDao().getSessionBySubjectAndDate(subjectId, date)
    if (existing != null) {
      val updated = existing.copy(
        status = resolvedStatus,
        timeSlot = timeSlot,
        notes = notes,
        updatedAt = System.currentTimeMillis()
      )
      db.attendanceDao().updateSession(updated)
      enqueueSync("ATTENDANCE", updated.id.toString(), "UPDATE")
    } else {
      val newSession = AttendanceSessionEntity(
        subjectId = subjectId,
        date = date,
        timeSlot = timeSlot,
        status = resolvedStatus,
        source = "MANUAL",
        notes = notes
      )
      val id = db.attendanceDao().insertSession(newSession)
      enqueueSync("ATTENDANCE", id.toString(), "CREATE")
    }
  }

  suspend fun deleteAttendanceSession(id: Long) {
    db.attendanceDao().deleteSessionById(id)
    enqueueSync("ATTENDANCE", id.toString(), "DELETE")
  }

  // Timetable
  val allTimetableEntries: Flow<List<TimetableEntryEntity>> = db.timetableDao().getAllEntries()
  fun getTimetableForDay(dayOfWeek: Int): Flow<List<TimetableEntryEntity>> =
    db.timetableDao().getEntriesForDay(dayOfWeek)

  suspend fun insertTimetableEntry(entry: TimetableEntryEntity): Long {
    val id = db.timetableDao().insertEntry(entry)
    enqueueSync("TIMETABLE", id.toString(), "CREATE")
    return id
  }
  suspend fun deleteTimetableEntry(id: Long) {
    db.timetableDao().deleteEntryById(id)
    enqueueSync("TIMETABLE", id.toString(), "DELETE")
  }

  // Expenses
  val allExpenses: Flow<List<ExpenseEntity>> = db.expenseDao().getAllExpenses()
  val allQuickExpenses: Flow<List<QuickExpenseEntity>> = db.quickExpenseDao().getAllQuickExpenses()

  suspend fun insertExpense(expense: ExpenseEntity): Long {
    val id = db.expenseDao().insertExpense(expense)
    enqueueSync("EXPENSE", id.toString(), "CREATE")
    return id
  }

  suspend fun logQuickExpense(quickExpense: QuickExpenseEntity, dateStr: String) {
    val expense = ExpenseEntity(
      amount = quickExpense.amount,
      category = quickExpense.category,
      description = quickExpense.name,
      expenseDate = dateStr,
      quickExpenseId = quickExpense.id
    )
    insertExpense(expense)
  }

  suspend fun deleteExpense(id: Long) {
    db.expenseDao().deleteExpenseById(id)
    enqueueSync("EXPENSE", id.toString(), "DELETE")
  }

  suspend fun insertQuickExpense(quickExpense: QuickExpenseEntity): Long {
    return db.quickExpenseDao().insertQuickExpense(quickExpense)
  }

  suspend fun deleteQuickExpense(id: Long) {
    db.quickExpenseDao().deleteQuickExpenseById(id)
  }

  // Tasks
  val allTasks: Flow<List<TaskEntity>> = db.taskDao().getAllTasks()
  val pendingTasks: Flow<List<TaskEntity>> = db.taskDao().getPendingTasks()

  suspend fun insertTask(task: TaskEntity): Long {
    val id = db.taskDao().insertTask(task)
    enqueueSync("TASK", id.toString(), "CREATE")
    return id
  }

  suspend fun toggleTaskCompletion(id: Long, currentCompleted: Boolean) {
    db.taskDao().updateCompletion(id, !currentCompleted)
    enqueueSync("TASK", id.toString(), "UPDATE")
  }

  suspend fun deleteTask(id: Long) {
    db.taskDao().deleteTaskById(id)
    enqueueSync("TASK", id.toString(), "DELETE")
  }

  // Documents & Books
  val allDocuments: Flow<List<AcademicDocumentEntity>> = db.documentDao().getAllDocuments()
  suspend fun insertDocument(doc: AcademicDocumentEntity): Long {
    val id = db.documentDao().insertDocument(doc)
    enqueueSync("DOCUMENT", id.toString(), "CREATE")
    return id
  }
  suspend fun deleteDocument(id: Long) {
    db.documentDao().deleteDocumentById(id)
    enqueueSync("DOCUMENT", id.toString(), "DELETE")
  }

  // Notes
  val allNotes: Flow<List<NoteEntity>> = db.noteDao().getAllNotes()
  suspend fun insertNote(note: NoteEntity): Long {
    val id = db.noteDao().insertNote(note)
    enqueueSync("NOTE", id.toString(), "CREATE")
    return id
  }
  suspend fun deleteNote(id: Long) {
    db.noteDao().deleteNoteById(id)
    enqueueSync("NOTE", id.toString(), "DELETE")
  }

  // Profile
  val profile: Flow<StudentProfileEntity?> = db.profileDao().getProfile()
  suspend fun updateProfile(profile: StudentProfileEntity) {
    db.profileDao().updateProfile(profile)
    enqueueSync("PROFILE", profile.id.toString(), "UPDATE")
  }

  // Holidays
  val allHolidays: Flow<List<HolidayEntity>> = db.holidayDao().getAllHolidays()
  suspend fun insertHoliday(holiday: HolidayEntity): Long {
    return db.holidayDao().insertHoliday(holiday)
  }
  suspend fun deleteHoliday(id: Long) {
    db.holidayDao().deleteHolidayById(id)
  }

  // Addons
  val allAddons: Flow<List<AddonEntity>> = db.addonDao().getAllAddons()
  suspend fun toggleAddon(id: String, enabled: Boolean) {
    db.addonDao().setEnabled(id, enabled)
  }

  // Sync Queue
  val syncQueue: Flow<List<SyncQueueEntity>> = db.syncQueueDao().getAllQueue()
  private suspend fun enqueueSync(type: String, id: String, op: String) {
    db.syncQueueDao().insert(
      SyncQueueEntity(
        entityType = type,
        entityId = id,
        operation = op,
        payload = "",
        isSynced = true
      )
    )
  }

  // Calculations & Rules Helper
  companion object {
    fun calculateSummary(
      sessions: List<AttendanceSessionEntity>,
      targetPercent: Float = 75.0f
    ): AttendanceSummary {
      var present = 0
      var absent = 0
      var holiday = 0

      for (s in sessions) {
        when (s.status.uppercase()) {
          "PRESENT" -> present++
          "ABSENT" -> absent++
          "HOLIDAY" -> holiday++
        }
      }

      val denominator = present + absent
      val overallPercentage = if (denominator > 0) {
        (present.toFloat() / denominator.toFloat()) * 100f
      } else {
        100f
      }

      // Prediction calculations
      // Target formula:
      // (present + x) / (total + x) >= target/100  =>  x >= (target*total - 100*present) / (100 - target)
      val needed = if (overallPercentage < targetPercent && targetPercent < 100f) {
        val num = (targetPercent * denominator) - (100f * present)
        val den = 100f - targetPercent
        max(0, ceil(num / den).toInt())
      } else {
        0
      }

      // Safe miss formula:
      // present / (total + y) >= target/100 => y <= (100*present - target*total) / target
      val canMiss = if (overallPercentage >= targetPercent && targetPercent > 0f) {
        val num = (100f * present) - (targetPercent * denominator)
        max(0, floor(num / targetPercent).toInt())
      } else {
        0
      }

      return AttendanceSummary(
        totalClasses = denominator,
        presentClasses = present,
        absentClasses = absent,
        holidayClasses = holiday,
        overallPercentage = overallPercentage,
        classesNeededForTarget = needed,
        classesCanMiss = canMiss,
        targetPercentage = targetPercent
      )
    }

    fun isSunday(dateStr: String): Boolean {
      return try {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val date = sdf.parse(dateStr) ?: return false
        val cal = Calendar.getInstance().apply { time = date }
        cal.get(Calendar.DAY_OF_WEEK) == Calendar.SUNDAY
      } catch (e: Exception) {
        false
      }
    }
  }
}
