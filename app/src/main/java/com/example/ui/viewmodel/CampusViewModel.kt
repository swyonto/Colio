package com.example.ui.viewmodel

import android.app.Application
import android.content.Context
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
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
import com.example.data.local.entity.TaskEntity
import com.example.data.local.entity.TimetableEntryEntity
import com.example.data.repository.AttendanceSummary
import com.example.data.repository.CampusRepository
import com.example.data.repository.SubjectAttendance
import com.example.ui.theme.AppThemeMode
import com.example.ui.theme.GlassAccent
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

enum class ScreenTab {
  HOME,
  ATTENDANCE,
  TIMETABLE,
  EXPENSES,
  MORE
}

enum class SubScreen {
  NONE,
  TASKS,
  BOOKS,
  NOTES,
  PROFILE,
  ID_CARD,
  ADDONS,
  SEARCH,
  SUBJECT_DETAIL,
  HOLIDAYS
}

data class TodayClassItem(
  val entry: TimetableEntryEntity,
  val subjectName: String,
  val subjectCode: String,
  val colorHex: String,
  val isCurrent: Boolean = false,
  val isNext: Boolean = false,
  val todaySession: AttendanceSessionEntity? = null
)

class CampusViewModel(application: Application) : AndroidViewModel(application) {

  private val database = AppDatabase.getInstance(application, viewModelScope)
  val repository = CampusRepository(database)

  // Theme & Appearance Preferences
  private val themePrefs = application.getSharedPreferences("campusos_theme_prefs", Context.MODE_PRIVATE)

  private val _themeMode = MutableStateFlow(
    try {
      AppThemeMode.valueOf(themePrefs.getString("theme_mode", AppThemeMode.SYSTEM.name) ?: AppThemeMode.SYSTEM.name)
    } catch (e: Exception) {
      AppThemeMode.SYSTEM
    }
  )
  val themeMode: StateFlow<AppThemeMode> = _themeMode

  private val _glassAccent = MutableStateFlow(
    GlassAccent.fromId(themePrefs.getString("glass_accent", GlassAccent.AURORA_INDIGO.id) ?: GlassAccent.AURORA_INDIGO.id)
  )
  val glassAccent: StateFlow<GlassAccent> = _glassAccent

  fun setThemeMode(mode: AppThemeMode) {
    _themeMode.value = mode
    themePrefs.edit().putString("theme_mode", mode.name).apply()
  }

  fun setGlassAccent(accent: GlassAccent) {
    _glassAccent.value = accent
    themePrefs.edit().putString("glass_accent", accent.id).apply()
  }

  // Navigation State
  private val _currentTab = MutableStateFlow(ScreenTab.HOME)
  val currentTab: StateFlow<ScreenTab> = _currentTab

  private val _activeSubScreen = MutableStateFlow(SubScreen.NONE)
  val activeSubScreen: StateFlow<SubScreen> = _activeSubScreen

  private val _selectedSubjectId = MutableStateFlow<Long?>(null)
  val selectedSubjectId: StateFlow<Long?> = _selectedSubjectId

  // Search State
  private val _searchQuery = MutableStateFlow("")
  val searchQuery: StateFlow<String> = _searchQuery

  // Timer / Pomodoro Add-on State
  private val _pomodoroSecondsLeft = MutableStateFlow(25 * 60)
  val pomodoroSecondsLeft: StateFlow<Int> = _pomodoroSecondsLeft

  private val _pomodoroIsRunning = MutableStateFlow(false)
  val pomodoroIsRunning: StateFlow<Boolean> = _pomodoroIsRunning

  private val _pomodoroIsBreak = MutableStateFlow(false)
  val pomodoroIsBreak: StateFlow<Boolean> = _pomodoroIsBreak
  private var pomodoroJob: Job? = null

  // CGPA Add-on State
  data class SemesterGrade(val semName: String, val sgpa: String, val credits: String)
  private val _cgpaSemesters = MutableStateFlow(
    listOf(
      SemesterGrade("Semester 1", "8.2", "24"),
      SemesterGrade("Semester 2", "8.6", "22"),
      SemesterGrade("Semester 3", "8.4", "24"),
      SemesterGrade("Semester 4", "8.8", "22")
    )
  )
  val cgpaSemesters: StateFlow<List<SemesterGrade>> = _cgpaSemesters

  // Core Data Flows
  val subjects: StateFlow<List<SubjectEntity>> = repository.allSubjects
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  val allSessions: StateFlow<List<AttendanceSessionEntity>> = repository.allAttendanceSessions
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  val profile: StateFlow<StudentProfileEntity?> = repository.profile
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

  val timetable: StateFlow<List<TimetableEntryEntity>> = repository.allTimetableEntries
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  val expenses: StateFlow<List<ExpenseEntity>> = repository.allExpenses
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  val quickExpenses: StateFlow<List<QuickExpenseEntity>> = repository.allQuickExpenses
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  val tasks: StateFlow<List<TaskEntity>> = repository.allTasks
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  val documents: StateFlow<List<AcademicDocumentEntity>> = repository.allDocuments
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  val notes: StateFlow<List<NoteEntity>> = repository.allNotes
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  val holidays: StateFlow<List<HolidayEntity>> = repository.allHolidays
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  val addons: StateFlow<List<AddonEntity>> = repository.allAddons
    .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  // Overall Attendance Summary (Calculated reactively)
  val overallAttendanceSummary: StateFlow<AttendanceSummary> = combine(allSessions, profile) { sessions, prof ->
    val target = prof?.targetAttendance ?: 75.0f
    CampusRepository.calculateSummary(sessions, target)
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), AttendanceSummary(0, 0, 0, 0, 100f, 0, 0))

  // Subject-wise Attendance Statistics
  val subjectAttendanceList: StateFlow<List<SubjectAttendance>> = combine(subjects, allSessions, profile) { subs, sess, prof ->
    val target = prof?.targetAttendance ?: 75.0f
    subs.map { sub ->
      val subSessions = sess.filter { it.subjectId == sub.id }
      val summary = CampusRepository.calculateSummary(subSessions, target)
      SubjectAttendance(
        subject = sub,
        presentCount = summary.presentClasses,
        absentCount = summary.absentClasses,
        holidayCount = summary.holidayClasses,
        percentage = summary.overallPercentage,
        neededForTarget = summary.classesNeededForTarget,
        canMiss = summary.classesCanMiss
      )
    }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  // Today's Timetable with Current / Next Class logic
  val todayClasses: StateFlow<List<TodayClassItem>> = combine(timetable, subjects, allSessions) { tt, subs, sess ->
    val cal = Calendar.getInstance()
    // Calendar.MONDAY is 2, SUNDAY is 1. Convert to 1=Mon, ..., 6=Sat, 7=Sun
    val dayOfWeek = when (cal.get(Calendar.DAY_OF_WEEK)) {
      Calendar.MONDAY -> 1
      Calendar.TUESDAY -> 2
      Calendar.WEDNESDAY -> 3
      Calendar.THURSDAY -> 4
      Calendar.FRIDAY -> 5
      Calendar.SATURDAY -> 6
      Calendar.SUNDAY -> 7
      else -> 1
    }

    val todayDateStr = getTodayDateString()
    val todayEntries = tt.filter { it.dayOfWeek == dayOfWeek }.sortedBy { it.startTime }

    val currentHour = cal.get(Calendar.HOUR_OF_DAY)
    val currentMin = cal.get(Calendar.MINUTE)
    val nowMinutes = currentHour * 60 + currentMin

    var foundCurrent = false
    var foundNext = false

    todayEntries.map { entry ->
      val sub = subs.firstOrNull { it.id == entry.subjectId }
      val startMin = parseTimeToMinutes(entry.startTime)
      val endMin = parseTimeToMinutes(entry.endTime)

      var isCur = false
      var isNxt = false

      if (!foundCurrent && nowMinutes in startMin..endMin) {
        isCur = true
        foundCurrent = true
      } else if (!foundNext && nowMinutes < startMin) {
        isNxt = true
        foundNext = true
      }

      val existingSession = sess.firstOrNull { it.subjectId == entry.subjectId && it.date == todayDateStr }

      TodayClassItem(
        entry = entry,
        subjectName = sub?.name ?: "Unknown Subject",
        subjectCode = sub?.code ?: "",
        colorHex = sub?.colorHex ?: entry.colorHex,
        isCurrent = isCur,
        isNext = isNxt,
        todaySession = existingSession
      )
    }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  // Monthly Expenses Total
  val currentMonthTotal: StateFlow<Double> = expenses.combine(MutableStateFlow(getCurrentMonthPrefix())) { expList, prefix ->
    expList.filter { it.expenseDate.startsWith(prefix) }.sumOf { it.amount }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

  // Expenses Category Breakdown
  val categoryBreakdown: StateFlow<Map<String, Double>> = expenses.combine(MutableStateFlow(getCurrentMonthPrefix())) { expList, prefix ->
    val monthExpenses = expList.filter { it.expenseDate.startsWith(prefix) }
    val map = mutableMapOf<String, Double>()
    monthExpenses.forEach {
      map[it.category] = (map[it.category] ?: 0.0) + it.amount
    }
    map
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyMap())

  // Pending & Today's tasks count
  val tasksRemainingCount: StateFlow<Int> = tasks.combine(MutableStateFlow(getTodayDateString())) { tList, _ ->
    tList.count { !it.completed }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

  val tasksDueTodayCount: StateFlow<Int> = tasks.combine(MutableStateFlow(getTodayDateString())) { tList, todayStr ->
    tList.count { !it.completed && it.dueDate == todayStr }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

  // Navigation Handlers
  fun selectTab(tab: ScreenTab) {
    _currentTab.value = tab
    _activeSubScreen.value = SubScreen.NONE
  }

  fun navigateToSubScreen(sub: SubScreen, subjectId: Long? = null) {
    _selectedSubjectId.value = subjectId
    _activeSubScreen.value = sub
  }

  fun closeSubScreen() {
    _activeSubScreen.value = SubScreen.NONE
    _selectedSubjectId.value = null
  }

  fun setSearchQuery(query: String) {
    _searchQuery.value = query
  }

  // Attendance Actions
  fun markQuickAttendance(subjectId: Long, timeSlot: String, status: String) {
    viewModelScope.launch {
      val today = getTodayDateString()
      repository.markAttendance(subjectId, today, timeSlot, status)
    }
  }

  fun markAttendanceForDate(subjectId: Long, date: String, timeSlot: String, status: String, notes: String = "") {
    viewModelScope.launch {
      repository.markAttendance(subjectId, date, timeSlot, status, notes)
    }
  }

  fun deleteAttendanceSession(id: Long) {
    viewModelScope.launch {
      repository.deleteAttendanceSession(id)
    }
  }

  // Subject Actions
  fun addSubject(name: String, code: String, teacher: String, credits: Int, colorHex: String) {
    viewModelScope.launch {
      repository.insertSubject(
        SubjectEntity(
          name = name,
          code = code,
          teacher = teacher,
          credits = credits,
          colorHex = colorHex
        )
      )
    }
  }

  fun deleteSubject(id: Long) {
    viewModelScope.launch {
      repository.deleteSubject(id)
    }
  }

  // Timetable Actions
  fun addTimetableEntry(subjectId: Long, dayOfWeek: Int, startTime: String, endTime: String, room: String, teacher: String, colorHex: String) {
    viewModelScope.launch {
      repository.insertTimetableEntry(
        TimetableEntryEntity(
          subjectId = subjectId,
          dayOfWeek = dayOfWeek,
          startTime = startTime,
          endTime = endTime,
          room = room,
          teacher = teacher,
          colorHex = colorHex
        )
      )
    }
  }

  fun deleteTimetableEntry(id: Long) {
    viewModelScope.launch {
      repository.deleteTimetableEntry(id)
    }
  }

  // Expense Actions
  fun logQuickExpense(quick: QuickExpenseEntity) {
    viewModelScope.launch {
      repository.logQuickExpense(quick, getTodayDateString())
    }
  }

  fun addExpense(amount: Double, category: String, description: String, date: String) {
    viewModelScope.launch {
      repository.insertExpense(
        ExpenseEntity(
          amount = amount,
          category = category,
          description = description,
          expenseDate = date
        )
      )
    }
  }

  fun deleteExpense(id: Long) {
    viewModelScope.launch {
      repository.deleteExpense(id)
    }
  }

  fun addQuickExpensePreset(name: String, amount: Double, category: String, icon: String) {
    viewModelScope.launch {
      repository.insertQuickExpense(
        QuickExpenseEntity(
          name = name,
          amount = amount,
          category = category,
          icon = icon
        )
      )
    }
  }

  fun deleteQuickExpensePreset(id: Long) {
    viewModelScope.launch {
      repository.deleteQuickExpense(id)
    }
  }

  // Task Actions
  fun addTask(title: String, description: String, dueDate: String, priority: String, subjectId: Long?) {
    viewModelScope.launch {
      repository.insertTask(
        TaskEntity(
          title = title,
          description = description,
          dueDate = dueDate,
          priority = priority,
          subjectId = subjectId
        )
      )
    }
  }

  fun toggleTaskCompletion(task: TaskEntity) {
    viewModelScope.launch {
      repository.toggleTaskCompletion(task.id, task.completed)
    }
  }

  fun deleteTask(id: Long) {
    viewModelScope.launch {
      repository.deleteTask(id)
    }
  }

  // Document & Book Actions
  fun addDocument(title: String, description: String, docType: String, fileSize: String, pageCount: Int, subjectId: Long?) {
    viewModelScope.launch {
      repository.insertDocument(
        AcademicDocumentEntity(
          title = title,
          description = description,
          docType = docType,
          fileSize = fileSize,
          pageCount = pageCount,
          subjectId = subjectId
        )
      )
    }
  }

  fun deleteDocument(id: Long) {
    viewModelScope.launch {
      repository.deleteDocument(id)
    }
  }

  // Notes Actions
  fun addNote(title: String, content: String, subjectId: Long?, hasPhoto: Boolean = false) {
    viewModelScope.launch {
      repository.insertNote(
        NoteEntity(
          title = title,
          content = content,
          subjectId = subjectId,
          hasPhotoAttachment = hasPhoto
        )
      )
    }
  }

  fun deleteNote(id: Long) {
    viewModelScope.launch {
      repository.deleteNote(id)
    }
  }

  // Holiday Actions
  fun addHoliday(title: String, date: String, type: String) {
    viewModelScope.launch {
      repository.insertHoliday(
        HolidayEntity(
          title = title,
          date = date,
          type = type
        )
      )
    }
  }

  fun deleteHoliday(id: Long) {
    viewModelScope.launch {
      repository.deleteHoliday(id)
    }
  }

  // Profile Actions
  fun updateProfile(name: String, college: String, course: String, sem: String, roll: String, branch: String, validThru: String, targetAttendance: Float) {
    viewModelScope.launch {
      val cur = profile.value ?: StudentProfileEntity()
      repository.updateProfile(
        cur.copy(
          name = name,
          collegeName = college,
          course = course,
          semester = sem,
          rollNumber = roll,
          branch = branch,
          validThru = validThru,
          targetAttendance = targetAttendance,
          updatedAt = System.currentTimeMillis()
        )
      )
    }
  }

  fun updateAvatar(avatarUri: String?, avatarPreset: String = "scholar") {
    viewModelScope.launch {
      val cur = profile.value ?: StudentProfileEntity()
      repository.updateProfile(
        cur.copy(
          avatarUri = avatarUri,
          avatarPreset = avatarPreset,
          updatedAt = System.currentTimeMillis()
        )
      )
    }
  }

  fun updateIdCardImages(frontUri: String?, backUri: String?) {
    viewModelScope.launch {
      val cur = profile.value ?: StudentProfileEntity()
      repository.updateProfile(
        cur.copy(
          idCardUri = if (frontUri != null) frontUri else cur.idCardUri,
          idCardBackUri = if (backUri != null) backUri else cur.idCardBackUri,
          updatedAt = System.currentTimeMillis()
        )
      )
    }
  }

  // Addon Actions
  fun toggleAddon(id: String, enabled: Boolean) {
    viewModelScope.launch {
      repository.toggleAddon(id, enabled)
    }
  }

  // Pomodoro Actions
  fun togglePomodoro() {
    if (_pomodoroIsRunning.value) {
      pausePomodoro()
    } else {
      startPomodoro()
    }
  }

  private fun startPomodoro() {
    _pomodoroIsRunning.value = true
    pomodoroJob?.cancel()
    pomodoroJob = viewModelScope.launch {
      while (_pomodoroIsRunning.value && _pomodoroSecondsLeft.value > 0) {
        delay(1000)
        _pomodoroSecondsLeft.value -= 1
      }
      if (_pomodoroSecondsLeft.value <= 0) {
        // Toggle mode
        val nextBreak = !_pomodoroIsBreak.value
        _pomodoroIsBreak.value = nextBreak
        _pomodoroSecondsLeft.value = if (nextBreak) 5 * 60 else 25 * 60
        _pomodoroIsRunning.value = false
      }
    }
  }

  private fun pausePomodoro() {
    _pomodoroIsRunning.value = false
    pomodoroJob?.cancel()
  }

  fun resetPomodoro() {
    pausePomodoro()
    _pomodoroIsBreak.value = false
    _pomodoroSecondsLeft.value = 25 * 60
  }

  // CGPA Calculator Actions
  fun updateCgpaSemesters(list: List<SemesterGrade>) {
    _cgpaSemesters.value = list
  }

  fun addCgpaSemester(name: String, sgpa: String, credits: String) {
    _cgpaSemesters.value = _cgpaSemesters.value + SemesterGrade(name, sgpa, credits)
  }

  fun removeCgpaSemester(index: Int) {
    val current = _cgpaSemesters.value.toMutableList()
    if (index in current.indices) {
      current.removeAt(index)
      _cgpaSemesters.value = current
    }
  }

  // Utility Date / Time functions
  companion object {
    fun getTodayDateString(): String {
      val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
      return sdf.format(Date())
    }

    fun getCurrentMonthPrefix(): String {
      val sdf = SimpleDateFormat("yyyy-MM", Locale.getDefault())
      return sdf.format(Date())
    }

    fun parseTimeToMinutes(timeStr: String): Int {
      return try {
        val parts = timeStr.trim().split(":")
        val h = parts[0].toInt()
        val m = parts[1].toInt()
        h * 60 + m
      } catch (e: Exception) {
        0
      }
    }
  }
}

class CampusViewModelFactory(private val application: Application) : ViewModelProvider.Factory {
  @Suppress("UNCHECKED_CAST")
  override fun <T : ViewModel> create(modelClass: Class<T>): T {
    if (modelClass.isAssignableFrom(CampusViewModel::class.java)) {
      return CampusViewModel(application) as T
    }
    throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
  }
}
