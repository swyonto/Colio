package com.example.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import com.example.data.local.dao.AddonDao
import com.example.data.local.dao.AttendanceDao
import com.example.data.local.dao.DocumentDao
import com.example.data.local.dao.ExpenseDao
import com.example.data.local.dao.HolidayDao
import com.example.data.local.dao.NoteDao
import com.example.data.local.dao.ProfileDao
import com.example.data.local.dao.QuickExpenseDao
import com.example.data.local.dao.SubjectDao
import com.example.data.local.dao.SyncQueueDao
import com.example.data.local.dao.TaskDao
import com.example.data.local.dao.TimetableDao
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
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

@Database(
  entities = [
    SubjectEntity::class,
    AttendanceSessionEntity::class,
    HolidayEntity::class,
    TimetableEntryEntity::class,
    ExpenseEntity::class,
    QuickExpenseEntity::class,
    TaskEntity::class,
    AcademicDocumentEntity::class,
    NoteEntity::class,
    StudentProfileEntity::class,
    SyncQueueEntity::class,
    AddonEntity::class
  ],
  version = 1,
  exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
  abstract fun subjectDao(): SubjectDao
  abstract fun attendanceDao(): AttendanceDao
  abstract fun holidayDao(): HolidayDao
  abstract fun timetableDao(): TimetableDao
  abstract fun expenseDao(): ExpenseDao
  abstract fun quickExpenseDao(): QuickExpenseDao
  abstract fun taskDao(): TaskDao
  abstract fun documentDao(): DocumentDao
  abstract fun noteDao(): NoteDao
  abstract fun profileDao(): ProfileDao
  abstract fun syncQueueDao(): SyncQueueDao
  abstract fun addonDao(): AddonDao

  companion object {
    @Volatile
    private var INSTANCE: AppDatabase? = null

    fun getDatabase(context: Context, scope: CoroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)): AppDatabase {
      return getInstance(context, scope)
    }

    fun getInstance(context: Context, scope: CoroutineScope): AppDatabase {
      return INSTANCE ?: synchronized(this) {
        val instance = Room.databaseBuilder(
          context.applicationContext,
          AppDatabase::class.java,
          "campusos_database"
        )
          .fallbackToDestructiveMigration(dropAllTables = true)
          .addCallback(DatabaseCallback(scope))
          .build()
        INSTANCE = instance
        instance
      }
    }
  }

  private class DatabaseCallback(private val scope: CoroutineScope) : RoomDatabase.Callback() {
    override fun onCreate(db: SupportSQLiteDatabase) {
      super.onCreate(db)
      INSTANCE?.let { database ->
        scope.launch(Dispatchers.IO) {
          seedInitialData(database)
        }
      }
    }
  }
}

suspend fun seedInitialData(db: AppDatabase) {
  // 1. Profile
  db.profileDao().insertProfile(
    StudentProfileEntity(
      id = 1L,
      name = "Suraj Maurya",
      collegeName = "National Institute of Technology",
      course = "B.Tech Computer Science & Engineering",
      semester = "Semester 5",
      rollNumber = "2024CS042",
      branch = "CSE",
      validThru = "2027-06-30",
      targetAttendance = 75.0f
    )
  )

  // 2. Subjects
  val math = SubjectEntity(id = 1, name = "Mathematics", code = "MTH301", teacher = "Dr. Raman", credits = 4, colorHex = "#4F46E5", targetAttendancePercent = 75.0f)
  val cs = SubjectEntity(id = 2, name = "Computer Science", code = "CS302", teacher = "Prof. Arvind", credits = 4, colorHex = "#0EA5E9", targetAttendancePercent = 75.0f)
  val eng = SubjectEntity(id = 3, name = "English", code = "ENG101", teacher = "Dr. Priya", credits = 2, colorHex = "#10B981", targetAttendancePercent = 75.0f)
  val phy = SubjectEntity(id = 4, name = "Physics", code = "PHY201", teacher = "Prof. Verma", credits = 3, colorHex = "#F59E0B", targetAttendancePercent = 75.0f)
  val subjects = listOf(math, cs, eng, phy)
  db.subjectDao().insertAll(subjects)

  // 3. Quick Expenses
  val quickList = listOf(
    QuickExpenseEntity(id = 1, name = "Ticket", amount = 30.0, category = "Transport", icon = "🎫"),
    QuickExpenseEntity(id = 2, name = "Tea", amount = 20.0, category = "Food", icon = "☕"),
    QuickExpenseEntity(id = 3, name = "Metro", amount = 40.0, category = "Transport", icon = "🚇"),
    QuickExpenseEntity(id = 4, name = "Lunch", amount = 80.0, category = "Food", icon = "🍛"),
    QuickExpenseEntity(id = 5, name = "Printout", amount = 10.0, category = "College", icon = "🖨️")
  )
  db.quickExpenseDao().insertAll(quickList)

  // 4. Initial Sample Expenses for current month
  val sampleExpenses = listOf(
    ExpenseEntity(id = 1, amount = 120.0, category = "Food", description = "Lunch & Coffee", expenseDate = "2026-09-15"),
    ExpenseEntity(id = 2, amount = 40.0, category = "Transport", description = "Metro to Campus", expenseDate = "2026-09-15"),
    ExpenseEntity(id = 3, amount = 80.0, category = "Books", description = "Lab Notebook", expenseDate = "2026-09-14"),
    ExpenseEntity(id = 4, amount = 1450.0, category = "Food", description = "Canteen Monthly Pass", expenseDate = "2026-09-02"),
    ExpenseEntity(id = 5, amount = 780.0, category = "College", description = "Tech Fest Registration", expenseDate = "2026-09-08"),
    ExpenseEntity(id = 6, amount = 950.0, category = "Books", description = "Algorithms & Data Structures", expenseDate = "2026-09-05")
  )
  db.expenseDao().insertAll(sampleExpenses)

  // 5. Timetable entries (Days 1 to 6 = Mon to Sat)
  val timetableList = listOf(
    // Monday (1)
    TimetableEntryEntity(subjectId = 1, dayOfWeek = 1, startTime = "09:00", endTime = "10:00", room = "Room 204", teacher = "Dr. Raman", colorHex = "#4F46E5"),
    TimetableEntryEntity(subjectId = 2, dayOfWeek = 1, startTime = "10:00", endTime = "11:00", room = "Lab 2", teacher = "Prof. Arvind", colorHex = "#0EA5E9"),
    TimetableEntryEntity(subjectId = 3, dayOfWeek = 1, startTime = "12:00", endTime = "13:00", room = "Room 103", teacher = "Dr. Priya", colorHex = "#10B981"),
    // Tuesday (2)
    TimetableEntryEntity(subjectId = 2, dayOfWeek = 2, startTime = "09:00", endTime = "10:00", room = "Lab 2", teacher = "Prof. Arvind", colorHex = "#0EA5E9"),
    TimetableEntryEntity(subjectId = 1, dayOfWeek = 2, startTime = "10:00", endTime = "11:00", room = "Room 204", teacher = "Dr. Raman", colorHex = "#4F46E5"),
    TimetableEntryEntity(subjectId = 4, dayOfWeek = 2, startTime = "11:00", endTime = "12:00", room = "Physics Lab", teacher = "Prof. Verma", colorHex = "#F59E0B"),
    // Wednesday (3)
    TimetableEntryEntity(subjectId = 1, dayOfWeek = 3, startTime = "09:00", endTime = "10:00", room = "Room 204", teacher = "Dr. Raman", colorHex = "#4F46E5"),
    TimetableEntryEntity(subjectId = 2, dayOfWeek = 3, startTime = "11:00", endTime = "12:00", room = "Lab 2", teacher = "Prof. Arvind", colorHex = "#0EA5E9"),
    TimetableEntryEntity(subjectId = 3, dayOfWeek = 3, startTime = "12:00", endTime = "13:00", room = "Room 103", teacher = "Dr. Priya", colorHex = "#10B981"),
    // Thursday (4)
    TimetableEntryEntity(subjectId = 4, dayOfWeek = 4, startTime = "09:00", endTime = "10:00", room = "Room 301", teacher = "Prof. Verma", colorHex = "#F59E0B"),
    TimetableEntryEntity(subjectId = 2, dayOfWeek = 4, startTime = "10:00", endTime = "11:00", room = "Lab 2", teacher = "Prof. Arvind", colorHex = "#0EA5E9"),
    TimetableEntryEntity(subjectId = 1, dayOfWeek = 4, startTime = "12:00", endTime = "13:00", room = "Room 204", teacher = "Dr. Raman", colorHex = "#4F46E5"),
    // Friday (5)
    TimetableEntryEntity(subjectId = 3, dayOfWeek = 5, startTime = "09:00", endTime = "10:00", room = "Room 103", teacher = "Dr. Priya", colorHex = "#10B981"),
    TimetableEntryEntity(subjectId = 4, dayOfWeek = 5, startTime = "10:00", endTime = "11:00", room = "Physics Lab", teacher = "Prof. Verma", colorHex = "#F59E0B"),
    TimetableEntryEntity(subjectId = 2, dayOfWeek = 5, startTime = "11:00", endTime = "12:00", room = "Lab 2", teacher = "Prof. Arvind", colorHex = "#0EA5E9"),
    // Saturday (6)
    TimetableEntryEntity(subjectId = 1, dayOfWeek = 6, startTime = "10:00", endTime = "12:00", room = "Room 204", teacher = "Dr. Raman", colorHex = "#4F46E5")
  )
  db.timetableDao().insertAll(timetableList)

  // 6. Attendance Sessions (Initial records reflecting realistic PRD numbers: ~78.4% overall)
  // Math: 41 Present, 9 Absent -> 82%
  val sessions = mutableListOf<AttendanceSessionEntity>()
  for (i in 1..41) {
    val dayStr = String.format("%02d", (i % 28) + 1)
    val monthStr = if (i <= 20) "08" else "09"
    sessions.add(AttendanceSessionEntity(subjectId = 1, date = "2026-$monthStr-$dayStr", timeSlot = "09:00 - 10:00", status = "PRESENT", source = "MANUAL"))
  }
  for (i in 1..9) {
    val dayStr = String.format("%02d", (i * 3) % 28 + 1)
    sessions.add(AttendanceSessionEntity(subjectId = 1, date = "2026-08-$dayStr", timeSlot = "09:00 - 10:00", status = "ABSENT", source = "MANUAL"))
  }
  // CS: 26 Present, 9 Absent -> 74%
  for (i in 1..26) {
    val dayStr = String.format("%02d", (i % 28) + 1)
    sessions.add(AttendanceSessionEntity(subjectId = 2, date = "2026-09-$dayStr", timeSlot = "10:00 - 11:00", status = "PRESENT", source = "MANUAL"))
  }
  for (i in 1..9) {
    val dayStr = String.format("%02d", (i * 2) % 28 + 1)
    sessions.add(AttendanceSessionEntity(subjectId = 2, date = "2026-08-$dayStr", timeSlot = "10:00 - 11:00", status = "ABSENT", source = "MANUAL"))
  }
  // English: 20 Present, 2 Absent -> 91%
  for (i in 1..20) {
    val dayStr = String.format("%02d", (i % 28) + 1)
    sessions.add(AttendanceSessionEntity(subjectId = 3, date = "2026-09-$dayStr", timeSlot = "12:00 - 13:00", status = "PRESENT", source = "MANUAL"))
  }
  for (i in 1..2) {
    sessions.add(AttendanceSessionEntity(subjectId = 3, date = "2026-08-1$i", timeSlot = "12:00 - 13:00", status = "ABSENT", source = "MANUAL"))
  }
  // Physics: 20 Present, 9 Absent -> 69%
  for (i in 1..20) {
    val dayStr = String.format("%02d", (i % 28) + 1)
    sessions.add(AttendanceSessionEntity(subjectId = 4, date = "2026-09-$dayStr", timeSlot = "11:00 - 12:00", status = "PRESENT", source = "MANUAL"))
  }
  for (i in 1..9) {
    val dayStr = String.format("%02d", (i * 2) % 28 + 1)
    sessions.add(AttendanceSessionEntity(subjectId = 4, date = "2026-08-$dayStr", timeSlot = "11:00 - 12:00", status = "ABSENT", source = "MANUAL"))
  }
  db.attendanceDao().insertAll(sessions)

  // 7. Holidays
  val holidays = listOf(
    HolidayEntity(date = "2026-08-15", title = "Independence Day", type = "COLLEGE_HOLIDAY"),
    HolidayEntity(date = "2026-10-02", title = "Gandhi Jayanti", type = "COLLEGE_HOLIDAY"),
    HolidayEntity(date = "2026-10-20", title = "Diwali Semester Break", type = "SEMESTER_BREAK")
  )
  db.holidayDao().insertAll(holidays)

  // 8. Tasks
  val sampleTasks = listOf(
    TaskEntity(id = 1, subjectId = 2, title = "Submit Python assignment", description = "Complete lab problem set 4 on NumPy & Matplotlib", dueDate = "2026-09-15", priority = "HIGH", completed = false),
    TaskEntity(id = 2, subjectId = 2, title = "Complete practical file", description = "Get lab code signed by Prof. Arvind", dueDate = "2026-09-15", priority = "MEDIUM", completed = false),
    TaskEntity(id = 3, subjectId = 1, title = "Read Mathematics Chapter 4", description = "Eigenvalues and Eigenvectors theorems", dueDate = "2026-09-16", priority = "MEDIUM", completed = false),
    TaskEntity(id = 4, subjectId = 4, title = "Prepare seminar presentation", description = "Quantum tunneling application slides", dueDate = "2026-09-18", priority = "LOW", completed = false),
    TaskEntity(id = 5, subjectId = 3, title = "Technical Report Drafting", description = "Executive summary of communication project", dueDate = "2026-09-10", priority = "MEDIUM", completed = true)
  )
  db.taskDao().insertAll(sampleTasks)

  // 9. Academic Documents / Books
  val sampleDocs = listOf(
    AcademicDocumentEntity(id = 1, subjectId = 2, title = "Computer System Architecture (CSA)", description = "Patterson & Hennessy 5th Edition PDF", docType = "BOOK", fileSize = "14.2 MB", pageCount = 680),
    AcademicDocumentEntity(id = 2, subjectId = 1, title = "Higher Engineering Mathematics Vol. 1", description = "B.S. Grewal calculus & differential equations", docType = "BOOK", fileSize = "22.5 MB", pageCount = 1200),
    AcademicDocumentEntity(id = 3, subjectId = 1, title = "Mathematics Practice Problem Set 2", description = "Tutorial questions with step-by-step solutions", docType = "ASSIGNMENT", fileSize = "1.8 MB", pageCount = 24),
    AcademicDocumentEntity(id = 4, subjectId = 2, title = "OS & Kernel Architecture Notes", description = "Lecture 1-12 summary notes by Topper", docType = "LECTURE_NOTES", fileSize = "3.4 MB", pageCount = 52),
    AcademicDocumentEntity(id = 5, subjectId = 4, title = "Semiconductor Physics Lab Manual", description = "Apparatus diagrams and experiment procedures", docType = "LAB_PRACTICAL", fileSize = "4.1 MB", pageCount = 38)
  )
  db.documentDao().insertAll(sampleDocs)

  // 10. Notes
  val sampleNotes = listOf(
    NoteEntity(id = 1, subjectId = 1, title = "Fourier Series Quick Formulae", content = "f(x) = a0/2 + Sum(an cos(nx) + bn sin(nx))\nEven functions: bn = 0\nOdd functions: a0 = 0, an = 0"),
    NoteEntity(id = 2, subjectId = 2, title = "Process Scheduling Algorithms", content = "FCFS: Non-preemptive, suffers convoy effect\nSJF: Optimal average waiting time\nRound Robin: Preemptive with time quantum q\nPriority: Risk of starvation -> solve with aging"),
    NoteEntity(id = 3, subjectId = 4, title = "Heisenberg Uncertainty Principle", content = "Delta x * Delta p >= hbar / 2\nCannot simultaneously measure position and momentum with arbitrary precision.", hasPhotoAttachment = true)
  )
  db.noteDao().insertAll(sampleNotes)

  // 11. Add-ons configuration
  val defaultAddons = listOf(
    AddonEntity(id = "cgpa_calc", name = "CGPA Calculator", description = "Calculate cumulative GPA across semesters with credit weighting", icon = "📊", category = "ACADEMIC", isEnabled = true),
    AddonEntity(id = "attendance_calc", name = "Attendance Goal Calculator", description = "Find out how many consecutive classes you need to attend or can safely skip", icon = "🎯", category = "ACADEMIC", isEnabled = true),
    AddonEntity(id = "pomodoro_timer", name = "Study Timer & Pomodoro", description = "Focused 25-minute academic sprints with break intervals", icon = "⏱️", category = "PRODUCTIVITY", isEnabled = true),
    AddonEntity(id = "sgpa_calc", name = "SGPA Subject Calculator", description = "Calculate semester GPA from grades (O, A+, A, B, etc.) and credits", icon = "📝", category = "ACADEMIC", isEnabled = true),
    AddonEntity(id = "date_calc", name = "Academic Calendar Countdown", description = "Days left until end-sem examinations and project submissions", icon = "⏳", category = "UTILITY", isEnabled = true)
  )
  db.addonDao().insertAll(defaultAddons)
}
