# Colio (CampusOS) — Master Implementation Plan & Task Tracker

## 📌 Overview
This document tracks all required bug fixes, feature enhancements, and system upgrades requested for **Colio v2.0**.

---

## 📋 Task Breakdown

### 1. Attendance Marking UI State & Duplicate Prevention
- [ ] **Track Daily Slot Attendance in Context**:
  - Add `dailyAttendanceLogs: Record<string, 'present' | 'absent'>` (stored in `@colio_attendance_logs_v2`).
  - Key format: `${dateStr}_${slotId}` to isolate attendance per slot per day.
  - Implement `recordSlotAttendance(dateStr, slotKey, subjectId, targetStatus)`:
    - First tap: records status, increments present/absent (+1).
    - Tapping same status: safely unmarks (decrements count -1, clears log) to prevent accidental double-marking.
    - Switching status (Present ↔ Absent): adjusts counts (+1 / -1) and updates state cleanly without inflating totals.
  - **STATUS: ✅ DONE** — `CampusContext.tsx` now has `dailyAttendanceLogs` state, `recordSlotAttendance()` function, and AsyncStorage persistence under `@colio_attendance_logs_v2`.
- [ ] **Timetable Card UI Dynamic Transformation**:
  - Update `TimetableScreen.tsx` class cards to visually reflect marked state:
    - Attended: Green accent border, glowing "✓ Attended" badge, active button style.
    - Absent: Red accent border, "✕ Absent" badge, active button style.
    - Unmarked: Standard neutral state with default action buttons.
- [ ] **Attendance Screen Edit Attendance**:
  - Add edit pen icon (`Feather name="edit-2"`) on each subject card header/action row in `AttendanceScreen.tsx`.
  - Connect to existing `handleOpenEdit(subj)` dialog so users can manually adjust total present/absent counts at any time.

---

### 2. Push Notifications, Channel Sound & Triggers
- [ ] **Android Notification Channel Audio & Priority**:
  - Update `src/services/notifications.ts`:
    - Ensure all channels (`colio_lectures`, `colio_attendance`, `colio_briefing`, `colio_alerts`) have `sound: 'default'`.
    - Set importance to `MAX` / `HIGH` with vibration patterns.
- [ ] **Auto-Schedule Reminders on App Boot**:
  - Trigger `syncAllTimetableReminders` automatically on cold start after loading timetable and subjects.
- [ ] **Notification Triggers in More Screen**:
  - Add 3 test buttons in `MoreScreen.tsx` with clear audio alerts:
    1. Test Class Reminder (10 min lead alert with sound)
    2. Test 75% Attendance Safeguard Warning with sound
    3. Test Morning Daily Briefing with sound

---

### 3. Authentication, Onboarding Setup, Google Login & Logout
- [x] **Sign Up with Email & 6-Digit OTP Verification**:
  - Validates name, email, and password (min 6 characters, password strength meter).
  - Generates 6-digit OTP code stored in Firestore (`otps/{cleanEmail}`) with 10-minute expiry.
  - Dedicated 6-digit OTP input view with auto-focus, backspace navigation, paste support, and auto-fill banner.
  - "Resend Code" countdown timer (30s).
  - Upon verification, hashes password with cryptographic salt and persists in Firestore `users/{cleanEmail}`.
  - **STATUS: ✅ DONE** — Full flow implemented in `authService.ts` and `AuthScreen.tsx`.
- [x] **Cryptographic Password Hashing & Security**:
  - Passwords hashed using SHA-256 with unique 16-character random salt (`authService.ts`).
  - Strict route guard: unauthenticated users cannot access user data or main screens.
  - Demo/Guest buttons and legacy auto-login removed completely.
  - **STATUS: ✅ DONE**.
- [x] **Forgot Password & Account Recovery**:
  - Step 1: User enters email, generates 6-digit recovery code stored in Firestore (`password_resets/{cleanEmail}`).
  - Step 2: User enters recovery code and sets new password with confirmation and strength meter.
  - Re-hashes password with fresh salt, updates Firestore, and allows immediate login.
  - **STATUS: ✅ DONE**.
- [x] **Official Google Authentication**:
  - Rendered with official 4-color SVG Google "G" logo (`GoogleLogo.tsx`), replacing distorted 4-quadrant icon.
  - Single button handles both Login and Signup: creates new verified user if not found, or logs into existing account.
  - **STATUS: ✅ DONE**.
- [x] **Slide Animation & UI Experience**:
  - Horizontal slide transitions and fade animations between Login, Sign Up, OTP Verification, and Forgot Password modes.
  - Animated top tab pill indicator with spring physics.
  - **STATUS: ✅ DONE**.
- [x] **Logout Flow**:
  - Prominent "Log Out" button with confirmation prompt in both `ProfileScreen.tsx` and `MoreScreen.tsx`.
  - Clears session and returns cleanly to `AuthScreen`.
  - **STATUS: ✅ DONE**.
- [x] **Automated Unit & Integration Tests**:
  - 23 unit tests covering hashing, OTP generation, verification, login, recovery, and Google sign-in.
  - **85/85 total project tests passing** (`npm test`).
  - **STATUS: ✅ DONE**.

---

### 4. Books & Study Material Upgrades
- [ ] **Subject Filter Bar**:
  - Add horizontal filter chips ("All", "PYTH", "CSA", "MC", "VAC1", "SEC1", "GE1", "LANG1", etc.) at the top of `BooksScreen.tsx`.
  - Filter document list dynamically based on selected subject chip.
- [ ] **Real PDF File Opening on Mobile**:
  - Fix issue where clicking PDF showed simulated markdown text instead of opening actual file.
  - Add "Open in System PDF Viewer" button using `Linking.openURL(doc.uri)` or native intent launcher to view real PDFs externally.

---

### 5. Academic Calendar & Holidays Color / Theme Fix
- [x] **Fix Invisible Text**:
  - In `HolidaysScreen.tsx`, fix `dateBadgeMonth` missing text color (causes black-on-dark invisible text).
  - Ensure all holiday date badges, cards, and text use dynamic `currentTheme` color tokens.
  - **STATUS: ✅ DONE** — `dateBadgeMonth` now uses `{ color: badgeColor }` matching the day number.

---

### 6. Android Hardware Back Button Handling
- [x] **Back Button Navigation in `App.tsx`**:
  - Register `BackHandler` listener:
    - If in any sub-screen (Profile, Books, etc.) ➔ close sub-screen and return to tab.
    - If on any tab other than 'home' (Attend, Timetable, Expenses, More) ➔ switch to 'home' tab.
    - If already on 'home' tab ➔ allow standard app exit / minimize behavior.
  - **STATUS: ✅ DONE** — BackHandler wired in App.tsx.

---

### 7. Profile Screen Avatar Size Setting Cleanup
- [ ] **Profile Screen Cleanup**:
  - In `ProfileScreen.tsx`, remove `avatarSizePillsContainer` (Small, Standard, Large pills) to keep standard avatar size without unnecessary UI clutter.

---

### 8. Theme Flash Glitch & Device Light/Dark Appearance Sync
- [ ] **Eliminate Cold-Start Green Flash**:
  - In `CampusContext.tsx`, prevent defaulting to `dark-emerald` before AsyncStorage loads. Initialize theme state synchronously to device appearance or cached preference.
- [x] **Device Light/Dark Appearance Sync**:
  - Support `useColorScheme()` from React Native.
  - Automatically update app theme when user toggles device system dark/light mode if set to system preference.
  - **STATUS: ✅ DONE** — `themePreference` state and `setThemePreference()` added to `CampusContext.tsx`.

---

### 9. Timetable UI & Layout Fixes
- [x] **Day Selector Overlap Fix**:
  - In `TimetableScreen.tsx`, give the days `<ScrollView>` `style={{ flex: 1 }}` — **STATUS: ✅ DONE**.
- [x] **Matrix Full Week Badge Overflow Fix**:
  - In `matrixHeaderRow`, added `flex: 1` and `marginRight: 8` to the title container — **STATUS: ✅ DONE**.
- [x] **Grid-Mode Subject Cell Overflow Fix**:
  - `matrixOccupiedCell` now has `overflow: 'hidden', maxWidth: 72`. Cell text elements have `width: 68` — **STATUS: ✅ DONE**.
- [x] **Free Slot "Assign Class" Button Overflow Fix**:
  - `listEmptyLeft` is now `flex: 1, marginRight: 8, overflow: 'hidden'` and `listEmptyPeriodText` has `flex: 1, numberOfLines={1}` — **STATUS: ✅ DONE**.

---

### 10. Expenses Screen Improvements
- [x] **Remove Brackets in Preset Header**:
  - Changed `QUICK LOG PRESETS (LONG-PRESS TO EDIT)` → `QUICK LOG PRESETS` — **STATUS: ✅ DONE**.
- [x] **Persist View Mode in Expenses**:
  - `historyViewMode` now persisted via `AsyncStorage` under `@colio_expenses_view_mode`. Loaded on mount. — **STATUS: ✅ DONE**.

---

### 11. Header Search Expand Animation & Home Schedule Dynamic Window
- [x] **Search Bar Expand Animation**:
  - `GlassHeader.tsx` fully rewritten with `Animated.spring` + `Animated.timing`. Brand logo fades out, search bar grows with spring physics. Close collapses in reverse — **STATUS: ✅ DONE**.
- [x] **Home "Today's Schedule" Dynamic Upcoming Classes Window**:
  - `TimetableSummaryCard.tsx` now slides the visible window forward as time passes. If 10:30 & 11:30 are over, the card shows 12:30 + next 2 upcoming. Header pill shows remaining upcoming count — **STATUS: ✅ DONE**.

---

## 🧪 Testing & Verification Plan
- [x] Run `npx tsc --noEmit` — **0 TypeScript errors** ✅
- [x] Run `npm test` — **85/85 tests passing** (27 suites) ✅
- [x] Test Auth workflow (Login / 6-digit OTP Sign Up / Google Auth / Password Recovery / Logout) ✅
- [x] Verify Back button navigation behavior (`BackHandler` wired) ✅
- [ ] Test Attendance marking toggles (Present ➔ Attended card state ➔ Tap again unmarks ➔ Absent state).
- [ ] Test Books filter chips & PDF viewer opening.

---

## 🔄 Remaining Tasks (Priority Order)
1. **Timetable card attendance UI states** (Task 1 — visual card transformation on mark)
2. **Edit attendance pen icon** (Task 1 — AttendanceScreen.tsx)
3. **Notification channel sound fix** (Task 2 — audio alert channels)
4. **Books filter chips + PDF opener** (Task 4)
