# CampusOS — UI/UX Improvement Task List
> Created: September 2026 | Status: Complete (Ready for Android Studio Build)

---

## Legend
- `[ ]` Not started
- `[/]` In progress
- `[x]` Done
- `[!]` Blocked / Needs decision

---

## 🧭 SECTION 1 — Bottom Navigation Bar

### 1.1 Icon & Label Colors
- [x] Change selected tab icon color from **emerald green** to **white** (pure `#FFFFFF` or near-white `#F0FFF4`)
  - Green selected icon mixes into green card glows — no visual separation
  - Unselected: keep muted `#4A6B58` or dim white `#6B8F7A`
  - Active indicator pill: keep emerald background, but icon inside should be white
- [x] Selected tab label: white `#F0FFF4`
- [x] Unselected tab label: muted `#4A6B58`

### 1.2 Fix "Attendance" Label Overflow (2-Line Bug)
- [x] Rename nav label from `"Attendance"` → `"Attend"` (single line guaranteed)
  - Target: all 5 labels fit in one line on smallest supported screen (360dp width)
- [x] Verify all 5 labels: Home, Attend, Timetable, Expenses, More — all single line on 360dp

### 1.3 Animated Sliding Active Indicator
- [x] Replace static pill background with an **animated sliding background** that moves between tabs
  - The active pill/indicator physically slides from old tab position to new tab position
  - Uses Jetpack Compose spring animation with animateDpAsState
  - Pill is a rounded rectangle (height ~32dp), slides horizontally
  - Icon + label color changes animate alongside the slide

---

## 🏠 SECTION 2 — Header / Top Bar Redesign

### 2.1 App Logo
- [x] Replace current logo with a **mortarboard / graduation cap** icon (`school` / `Icons.Default.School`)
  - Personal college data app — graduation cap fits academic theme
  - Soft emerald radial glow ring behind icon
  - Icon color: white with subtle emerald tint

### 2.2 App Name
- [x] Change app display name to **short personal name** with `profile.appNickname`
  - Default = `"CampusHub"` / `"MyCollege"`
  - Stored and synced in `StudentProfileEntity.appNickname`
  - Editable via Profile Settings dialog

### 2.3 Remove Subtitle
- [x] Remove "Academic Workspace" subtitle line from header
  - Keep only: logo icon + app name (single line, bold)
  - Frees vertical height for content

### 2.4 Search Bar Behavior Redesign
- [x] **Default state**: Show only a **circular search icon button** (38dp circle, dark glass, emerald icon)
  - Full border radius (50%)
  - No text, no placeholder visible
- [x] **On tap**: Search button **expands** into a full search input bar
  - Close button (✕) collapses search bar back into circular icon

### 2.5 Profile Icon
- [x] Retained clean interactive avatar pill linking to Profile

---

## 🎨 SECTION 3 — Card Aesthetics (Supabase-Style Dark Glass)

### 3.1 & 3.2 Supabase Dark UI Approach
- [x] Card base fill: **pure dark charcoal** — NO green tint in the base gradient
  - Updated color tokens: `#0F1010`, `#0C0D0C`, `#141414`, `#0A0B0A`
- [x] Emerald appears ONLY in:
  - Radial corner glow (bottom-right corner, very low alpha)
  - Border gradient / EmeraldGlassBorder (15–20% alpha)
  - Accent icons, status indicators, progress bars
- [x] Removed all green muddy base tint from `EmeraldGlassCard` and card themes

---

## 📦 SECTION 4 — Home Screen: 2×2 Stat Mini Cards

### 4.1 Icon & Color Consistency
- [x] **Library/Books card**: `MenuBook` / `PictureAsPdf` with mint `#69F0AE` tint
- [x] **Attendance card**: `CheckCircle` with `#00E676` tint
- [x] **Tasks card**: `Assignment` with `#00E676` / amber tint
- [x] **Expenses card**: `Payments` with `#00E676` tint

### 4.2 "View All" Arrow Direction
- [x] Changed all "View All →" links to `NorthEast` (↗ top-right diagonal) across all cards

### 4.3 Allow Editing Pre-filled Values
- [x] Long-press / edit triggers on AttendanceCard, TaskCard, ExpenseCard
- [x] Manual attendance present/absent count editor dialog (`EditAttendanceDialog`)
- [x] `adjustSubjectAttendance` in Repository & ViewModel

### 4.4 2×2 Stat Grid Layout & Optical Symmetry (Fix Left-Dominance)
- [x] **Top Row**: Icon top-left, `NorthEast` (↗) top-right — establishes optical balance
- [x] **Middle**: Stat value centrally weighted
- [x] **Bottom Row**: Micro-label uppercase + sub-metric badge
- [x] **Uniform padding**: 14dp all around

---

## 📊 SECTION 5 — Attendance Card (Home Dashboard)

### 5.1 Add Badge Like Expense Card
- [x] Added status chip below percentage ("75% Target • Met ✓" / "Safe to skip N classes")
- [x] Dark charcoal glass styling with `NorthEast` ↗ link

---

## ✅ SECTION 6 — Tasks Card (Home Dashboard) — Fix Behavior

### 6.1 Checkbox Behavior Fix (Critical Bug)
- [x] Tapping checkbox **does not remove** task
- [x] Title gets strikethrough text decoration
- [x] Task row dimmed to 55%
- [x] Completed tasks sink to the bottom of the list
- [x] Only explicit deletion removes tasks

### 6.2 Add Task Dialog — Redesign
- [x] Removed required subject dropdown friction
- [x] Title, Description, Quick Date chips ("Today" / "Tomorrow"), priority default MEDIUM
- [x] CTA "Save Task", title "New Task"

### 6.3 Task List Item Layout Redesign
- [x] Checkbox left, bold title + description, priority badge (`HIGH`/`MEDIUM`/`LOW`/`URGENT`), due date chip, delete right

---

## 📋 SECTION 7 — Attendance Screen (Full Page)

### 7.1 Subject Cards — Day-Based View
- [x] Day selector tabs (`Mon | Tue | Wed | Thu | Fri | Sat | All`)
- [x] Filters timetable sessions for the active weekday
- [x] "All Subjects" view available

### 7.2 Subject Color Indicator — Gradient Circle
- [x] Gradient donut/ring color indicator instead of plain flat dot

### 7.3 Manual Edit of Attendance Values
- [x] Manual edit present/absent counts via `EditAttendanceDialog`

---

## 📅 SECTION 8 — Timetable Screen

### 8.1 Remember Last View Mode
- [x] `rememberSaveable` view mode switcher between `Grid` and `List`

### 8.2 Grid View UI Improvements
- [x] Upgraded to 9 official periods (08:30 to 17:30)
- [x] Short code display (`PYTH`, `CSA`, `MC`, `GE1`, `VAC1`, `SEC1`, `LANG1`)
- [x] 3dp colored left stripe on cards
- [x] Room badges (e.g. `CL-2`, `LT-1`, `Lab 1`)
- [x] Empty slots with "—" in dark charcoal glass

---

## 💰 SECTION 9 — Expenses Screen

### 9.1 Expense Editing
- [x] Long-press / click opens `EditExpenseDialog` (edit amount, description, category, date)
- [x] Delete button with confirmation

### 9.2 Editable Quick Expense Presets (CRUD)
- [x] Long-press on quick preset opens `EditQuickExpensePresetDialog`
- [x] Edit title, price, category, emoji icon or delete preset
- [x] "+ New Preset" dialog to add custom presets

### 9.3 Expense Filters (Day-Part & Categories)
- [x] Time-of-day filters: `All | Morning 🌅 | Afternoon ☀️ | Evening 🌆 | Night 🌙`
- [x] Category filters: `All | Food | Transport | Books | College | Other`

### 9.4 Multi-Month Expense History & Comparison
- [x] Multi-month selector carousel (`‹ September 2026 ›`)
- [x] Month-over-Month comparison pill (`+X% MoM` / `-X% MoM`)
- [x] Category breakdown progress bars

---

## 📚 SECTION 10 — Books & PDFs Screen

### 10.1 Screen Title
- [x] Renamed header to "Books & PDFs"

### 10.2 Sleek Emerald PDF Icon
- [x] Glowing emerald `PictureAsPdf` icon with `MintAccent` tint in dark charcoal container

### 10.3 Add Document Flow
- [x] Streamlined add flow with title, optional subject, and file information

### 10.4 Native PDF Viewer Intent
- [x] `Intent.ACTION_VIEW` launcher with `application/pdf` mimeType
- [x] Fallback built-in viewer preview dialog

### 10.5 Document Card Layout
- [x] File size, document type badge, subject code, `NorthEast` ↗ open button, long-press delete

---

## 🪪 SECTION 11 — ID Card Screen

### 11.1 Full Screen Preview Mode
- [x] Fullscreen ID card dialog with high-res digital preview
- [x] Front and back photo upload pickers

### 11.2 Landscape & Details
- [x] Clean landscape layout toggle and details preview
- [x] App Nickname synced and displayed

---

## 🏖️ SECTION 12 — Holidays Screen

### 12.1 Add Holiday
- [x] Pure charcoal styling with date picker and title

### 12.2 & 12.3 Smart Holiday Handling
- [x] Holiday rule card: Sundays and college holidays excluded from missed class penalties

---

## 🎯 SECTION 13 — Global Micro-Interactions & Styling
- [x] Consistent dark charcoal palette (`#0F1010`, `#0C0D0C`, `#141414`)
- [x] Subtle emerald glass borders (`EmeraldGlassBorder`)
- [x] Mint accent highlights (`MintAccent` `#69F0AE`)
- [x] `NorthEast` (↗) diagonal navigation arrows across all cards

---

## 📝 PRD Updates Required
- [x] All PRD v2 DarkEmerald updates implemented and reflected in code and documentation.


---

## 📌 Build Order (Recommended Sequence)

> User builds manually. This is the suggested order for minimum conflicts:

```
Phase 1 — Foundation (no screen changes)
  1. Color.kt — pure charcoal tokens (remove green tint from bg-card)
  2. CampusApp.kt — nav bar sliding indicator, white icons, "Attend" label
  3. CampusHeader.kt — logo change, remove subtitle, collapsible search

Phase 2 — Home Screen
  4. GlassmorphicComponents.kt — pure charcoal card base
  5. HomeScreen.kt — View All arrows (↗), stat card icon consistency
  6. TaskCard.kt — checkbox behavior fix, new task item layout
  7. AttendanceCard.kt — add badge section (like ExpenseCard)

Phase 3 — Individual Screens
  8. AttendanceScreen.kt — day-based view, gradient color circle
  9. TimetableScreen.kt — persist view mode, grid UI improvements
  10. ExpensesScreen.kt — swipe-to-edit, edit hint
  11. BooksScreen.kt — rename heading, simplified add, native PDF open

Phase 4 — Sub-screens
  12. IdCardViewerScreen.kt — fullscreen mode, landscape layout
  13. HolidaysScreen.kt — timetable sync, auto-absent logic
  14. TasksScreen.kt — full task list with new item layout

Phase 5 — Polish
  15. Micro-interactions (spring press feedback everywhere)
  16. Screen entry animations (staggered cards)
  17. Number count-up animations
  18. Haptics
```

---

## ⚠️ Open Questions / Design Decisions

| # | Question | Default / Recommendation |
|---|---|---|
| Q1 | What should the shortened app name be? | Let user pick at first launch (onboarding) |
| Q2 | Auto-absent rule — what's the grace period? | 30 min after class end time |
| Q3 | Should completed tasks auto-archive after X days? | No auto-archive, manual delete only |
| Q4 | Grid vs list timetable — which is default? | List (simpler for first-time users) |
| Q5 | Should attendance edits require a reason/note? | Optional note field (not required) |
| Q6 | How many quick expense presets max? | 6 (fixed) |
| Q7 | Is landscape ID card a different template or rotated? | Different layout (wider, shorter) |

---

*Task list created: September 2026*
*Status: Awaiting user build*
