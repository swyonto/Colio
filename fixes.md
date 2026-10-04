1. Icon dimensions (749x739)	⚪ Low (Cosmetic)	assets/icon.png is 10 pixels off from being a perfect square (749×739 instead of 1024×1024 or 749×749). Android automatically scales it into your app launcher icon anyway.
2. eas-cli in package.json	⚪ Low (Informational)	Expo prefers you run EAS through npx eas rather than listing eas-cli inside devDependencies. It takes up extra space in node_modules but does not affect the APK.
3. Patch version differences	⚪ Low (Normal)	Minor patch differences (e.g. expo is on .24 while .26 is latest; expo-notifications on .20 vs .21). These are tiny weekly maintenance updates that do not break the app.

4. Excel / CSV Timetable Import Structure & Parser:
- **Feature**: Replaced simulated OCR with real Excel / CSV spreadsheet import via `expo-document-picker` and `src/utils/csvTimetableParser.ts`.
- **Required Excel Columns**:
  | Column Name | Required | Supported Formats | Example |
  |-------------|----------|-------------------|---------|
  | `Day` | Yes | `Monday` - `Saturday`, `Mon` - `Sat`, `1` - `6` | `Monday` or `Mon` |
  | `Period` | Yes | Integer `1` - `9` | `1`, `2`, `3` |
  | `StartTime` | Yes | `HH:MM` (24h) or `H:MM AM/PM` (12h) | `08:30` or `8:30 AM` |
  | `EndTime` | Yes | `HH:MM` (24h) or `H:MM AM/PM` (12h) | `09:30` or `9:30 AM` |
  | `Subject` | Yes | Full course name | `Python Programming` |
  | `Code` | Optional | Subject code abbreviation | `PYTH`, `CS101` |
  | `Room` | Optional | Classroom, Lab, or Hall | `Lab 3`, `Room 201` |
  | `Teacher` | Optional | Faculty / Instructor name | `Dr. Sharma` |
- **Delimiters Supported**: Standard comma (`,`), European Excel semicolon (`;`), and tab (`\t`).
- **Exporting from Excel**: `File -> Save As -> CSV (Comma delimited) (*.csv)`.
- **Exporting from Google Sheets**: `File -> Download -> Comma-separated values (.csv)`.
- **In-App Integration**: Integrated on `OnboardingSetupScreen.tsx` with in-app Excel Format Guide, 1-tap template test loader, and direct text paste. Newly detected subjects are automatically registered into the attendance tracker with unique palette colors.

5. Senior QA & Deep Audit Master Fixes (Applied):
- **Home Navigation Loop & Quick-Edit Dialog**:
  - Tapping the Tasks card on `HomeScreen` now routes directly to `TasksScreen` instead of triggering a loop back to `'home'`.
  - Quick-edit long-press dialog on `HomeScreen` stat cards now dispatches real updates to attendance criteria, expenses, tasks, and library documents.
- **In-App PDF Reader & Native Sharing**:
  - Fixed `BooksScreen.tsx` ignoring native PDF files on mobile. Integrated system PDF launch via `Linking.openURL` and native sharing via `Share.share` with in-card quick actions and action banner in the reader.
- **CGPA Calculator Persistence & Mathematical Degree Target Simulator**:
  - Rewrote `CgpaScreen.tsx` with `@colio_cgpa_semesters_v2` and `@colio_cgpa_target_v2` AsyncStorage persistence.
  - Added "+ Add Semester" and delete semester capabilities with customizable credits and SGPA.
  - Built real mathematical Degree Target Simulator computing required SGPA: `Required SGPA = (Target * TotalPlanned - CurrentSum) / RemainingCredits` with color-coded feasibility feedback.
- **Holidays & Duty Leaves Integration**:
  - Added `holidays` to `CloudStudentBackup` and Firebase sync/restore in `firebase.ts` and `CampusContext.tsx`.
  - Factored approved `DUTY_LEAVE` credits directly into attendance formulas (`effectivePresent`, `overallAttendance`, `classesCanMiss`, `classesNeeded`).
  - Added active Duty Leave protection badge in `AttendanceScreen.tsx`.
- **Responsive Navigation Bar**:
  - Migrated `GlassNavBar.tsx` from static `Dimensions.get('window')` to `useWindowDimensions()` to prevent tab misalignment on device rotation, foldables, and tablets.
- **Performance & Context Optimization**:
  - Memoized `CampusContext` provider value with `useMemo`, eliminating full-app re-renders across all tabs during search keystrokes and frequent status updates.
- **Dynamic Matrix Theming**:
  - Replaced hardcoded subject color switch-cases in `TimetableScreen.tsx` with dynamic subject palette extraction.
- **Storage Wrapper Expansion**:
  - Added `multiGet`, `multiSet`, `multiRemove`, and `clear` to `src/utils/storage.ts` for uniform storage across web and native.
*(Note: Per explicit user directive, security and credential configuration files were preserved without modification).*
