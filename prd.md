Absolutely. Below is a **complete implementation-ready PRD** consolidating everything we discussed. I’ve written it so an AI coding agent/builder can use it as the primary product and technical specification rather than having to infer the architecture.

# Product Requirements Document — College Companion App

**Working name:** CampusOS
**Platform:** Mobile application
**Primary user:** Individual college student
**Architecture:** Offline-first, cloud-synced
**Recommended stack:** React Native + Expo + TypeScript + Supabase/PostgreSQL + SQLite

---

# 1. Product Overview

CampusOS is a personal college-management mobile application designed to keep a student's everyday college information in one place.

The application should combine:

* Attendance
* Timetable
* Expenses
* Tasks
* Books/PDFs
* Notes
* Student profile
* ID card
* Optional college utility tools/add-ons

The application should feel like a **personal college operating system**, not like a traditional college ERP.

The core philosophy is:

> **Simple UI, fast interactions, offline-first data entry, reliable cloud synchronization, and strongly connected academic data.**

---

# 2. Problem

Students normally maintain college information across multiple applications:

* Attendance in a notebook/calculator
* Timetable in WhatsApp or screenshots
* Expenses in notes
* PDFs in Google Drive
* Notes in different apps
* Tasks in another to-do application
* ID card in the gallery
* CGPA calculations in a calculator

This application consolidates those workflows.

---

# 3. Product Goals

### Primary goals

1. Make attendance tracking extremely fast.
2. Provide a customizable timetable.
3. Track daily/monthly expenses.
4. Organize academic PDFs/books.
5. Provide flexible notes.
6. Manage college tasks.
7. Store student information and ID card.
8. Provide optional college utility tools.
9. Work without internet.
10. Synchronize important data to the cloud.
11. Keep the dashboard useful without overwhelming the user.

---

# 4. Non-Goals for MVP

Do **not** turn the first version into a huge platform.

Avoid initially implementing:

* Social network
* Student-to-student chat
* College-wide collaboration
* Marketplace
* Gmail integration
* WhatsApp integration
* AI assistant
* Automatic college attendance integration
* Complex LMS
* University ERP integration
* Excessive analytics

These can be future features.

---

# 5. Application Information Architecture

## Primary navigation

Use a bottom navigation bar.

```text
┌─────────────────────────────────┐
│                                 │
│            CONTENT              │
│                                 │
├─────────────────────────────────┤
│ Home │ Attendance │ Timetable │ More │
└─────────────────────────────────┘
```

Expenses can either be a primary tab if usage warrants it, or accessed prominently from Home/More. For the MVP, the preferred navigation is:

```text
Home
Attendance
Timetable
Expenses
More
```

### More

Contains:

```text
Tasks
Books
Notes
Documents
Add-ons
Profile
Settings
```

Do not create a separate bottom-tab for every feature.

---

# 6. Home Dashboard

The Home screen is the application's primary dashboard.

## Header

Header must contain:

### Left

Application title/logo.

Example:

```text
CampusOS
```

Do **not** display:

> Good morning
> Good evening
> Welcome back

The user specifically does not want a greeting message.

### Right

Circular profile/avatar button.

```text
┌───────────────────────────────┐
│ CampusOS                 (○)  │
└───────────────────────────────┘
```

The avatar can display:

* Uploaded profile image
* User-selected avatar
* Initials if no image exists

Clicking it opens the profile.

---

# 7. Dashboard Card Order

Recommended Home order:

```text
Header

Attendance Card

Expense Card

Tasks Card

Books Card

[Additional useful card]

Today's Timetable

Quick Actions (optional)

Bottom Navigation
```

The sixth/additional card should remain configurable during implementation. It can eventually represent another useful feature such as Notes, upcoming assignment, or an academic summary.

---

# 8. Attendance Card

The attendance card is the most important dashboard card.

Example:

```text
┌───────────────────────────────┐
│ Attendance                    │
│                               │
│          78.4%                │
│                               │
│ Present 58    Absent 16       │
│                               │
│ View Attendance →             │
└───────────────────────────────┘
```

The card should summarize overall attendance.

Clicking it opens the Attendance dashboard.

---

# 9. Attendance System

Attendance must be **subject-based**.

Example subjects:

```text
Mathematics
Computer Science
English
Physics
```

Each subject maintains independent attendance.

Example:

```text
Mathematics
82%

Present: 41
Absent: 9
Total: 50
```

---

# 10. Attendance Dashboard

The Attendance screen should display:

```text
Overall Attendance

78.4%

Subjects

Mathematics       82%
Computer Science  74%
English           91%
Physics           69%
```

Each subject is clickable.

---

# 11. Attendance Table

Subject attendance history:

```text
Mathematics

Date        Status
15 Sep      Present
14 Sep      Absent
13 Sep      Present
12 Sep      Present
11 Sep      Holiday
```

Possible status values:

```text
PRESENT
ABSENT
HOLIDAY
```

---

# 12. Attendance Rules

This is a critical business rule.

## Default status

If the student does not manually mark attendance for a scheduled class, it should eventually be treated as:

**Absent**

This prevents missing entries from artificially increasing attendance.

However, the system must distinguish between:

```text
No attendance record yet
```

and:

```text
Automatically resolved to absent
```

This allows the UI to show appropriate pending states before the day/class has actually occurred.

---

# 13. Holidays

The student can manually add holidays.

Examples:

```text
Festival
College Holiday
Semester Break
Personal Holiday
College Event
```

When a holiday is marked, scheduled classes on that day should not count as absent.

---

# 14. Sundays

Every Sunday should automatically be treated as a holiday/non-class day.

The system should not require the user to manually mark Sunday.

Attendance calculations must exclude Sundays.

---

# 15. Attendance Auto-Absent Logic

For each scheduled class:

```text
Class scheduled
      ↓
Class time passes
      ↓
Was attendance marked?
   ┌──┴──┐
  Yes    No
   │      │
 Keep   Absent
```

But:

```text
Is date a holiday?
      ↓
    Yes
      ↓
Exclude from attendance
```

And:

```text
Is Sunday?
   ↓
 Yes
   ↓
Holiday
```

---

# 16. Attendance Calculations

Basic attendance:

```text
attendance =
present_classes /
(present_classes + absent_classes)
× 100
```

Holiday classes must not count toward the denominator.

Example:

```text
Present = 40
Absent = 10
Holiday = 3

Attendance = 40 / 50 × 100
           = 80%
```

---

# 17. Attendance Prediction

This should be supported in the attendance dashboard.

Example:

```text
Current attendance
72%

You must attend
6 consecutive classes

to reach 75%.
```

And:

```text
You can miss
2 more classes

before falling below 75%.
```

The target percentage should ideally be configurable.

Default:

```text
75%
```

---

# 18. Attendance Quick Interaction

The user should be able to mark attendance with minimum friction.

Example:

```text
Computer Science

[ ✓ Present ]

[ ✕ Absent ]

[ Holiday ]
```

Potentially support swipe/tap interaction later.

---

# 19. Expense Card

Dashboard expense card:

```text
┌───────────────────────────────┐
│ Expenses                      │
│                               │
│ ₹3,420                        │
│ This Month                    │
│                               │
│ View Expenses →               │
└───────────────────────────────┘
```

Clicking opens Expense Management.

---

# 20. Expense Management

Expense entry:

```text
Amount
₹120

Category
Food

Description
Lunch

Date
15 September

[Save Expense]
```

Categories:

* Food
* Transport
* Books
* College
* Fees
* Shopping
* Entertainment
* Other

Allow categories to be extended later.

---

# 21. Expense CRUD

Support:

* Create
* Read
* Update
* Delete

Expense history:

```text
15 Sep
Food
Lunch
₹120

15 Sep
Transport
Metro
₹40

14 Sep
Books
Notebook
₹80
```

---

# 22. Quick Expenses

This is an important custom feature.

Users frequently spend the same amount on recurring small purchases.

Example:

```text
Quick Expenses

🎫 Ticket ₹30
☕ Tea ₹20
🚇 Metro ₹40
```

When the user taps:

```text
Ticket ₹30
```

the app immediately records:

```text
Amount: ₹30
Category: Transport
Description: Ticket
Date: Today
```

No manual form required.

---

# 23. Quick Expense Management

Users should be able to:

* Create quick expense
* Edit quick expense
* Delete quick expense
* Change amount
* Change category
* Change icon/name

Example:

```text
+ Add Quick Expense

Name: Ticket
Amount: ₹30
Category: Transport
Icon: 🎫
```

---

# 24. Expense Analytics

Basic analytics:

```text
This Month

₹4,280

Food       ₹1,450
Transport    ₹820
Books        ₹700
Other      ₹1,310
```

Future:

* Daily average
* Weekly spending
* Monthly comparison
* Category chart
* Highest spending day

---

# 25. Task Card

Dashboard:

```text
┌───────────────────────────────┐
│ Tasks                         │
│                               │
│ 4 remaining                   │
│                               │
│ 2 due today                   │
│                               │
│ View Tasks →                  │
└───────────────────────────────┘
```

---

# 26. Task System

Tasks must support basic CRUD.

Fields:

```text
id
user_id
title
description
subject_id
due_date
priority
completed
created_at
updated_at
```

Priority:

```text
Low
Medium
High
```

Future types:

```text
Assignment
Exam
Project
Personal
```

---

# 27. Task UI

```text
Tasks

Today

☐ Submit Python assignment
  Python
  Due today

☐ Complete practical
  Computer Science
  Due today

Tomorrow

☐ Read Mathematics Chapter 4
```

Completed tasks can be displayed separately or collapsed.

---

# 28. Books Card

Dashboard:

```text
┌───────────────────────────────┐
│ Books                         │
│                               │
│ 3 books                       │
│ 12 documents                  │
│                               │
│ View Books →                  │
└───────────────────────────────┘
```

The Books feature is primarily intended as an academic resource/document organizer rather than a sophisticated book-reading platform.

---

# 29. Books Organization

Example:

```text
Books

Computer Science

CSA
 └── CSA Book.pdf

Mathematics

Maths
 ├── Mathematics Book 1.pdf
 └── Mathematics Book 2.pdf
```

A book/document can have:

```text
Title
Subject
Description
File
```

The user can add PDFs.

---

# 30. PDF Storage

Do **not** store PDF binary data directly inside PostgreSQL.

Use object storage.

Recommended:

```text
Supabase Storage
```

Database stores metadata:

```text
documents

id
user_id
subject_id
title
storage_path
file_type
file_size
created_at
updated_at
```

Actual file:

```text
Storage

/user/{user_id}/documents/...
```

---

# 31. Document Security

Documents should be private.

Do not expose ID cards and personal PDFs through permanent public URLs.

Use authenticated access/signed URLs where appropriate.

---

# 32. Today's Timetable

Below the dashboard cards, display:

```text
Today's Timetable

09:00 – 10:00
Mathematics
Room 204

10:00 – 11:00
Computer Science
Lab 2

12:00 – 01:00
English
Room 103

View More →
```

The list must be dynamically generated from the complete timetable.

---

# 33. Current / Next Class

The application should determine the current class based on:

```text
Current date
+
Current time
+
Timetable
```

Example:

```text
CURRENT CLASS

Computer Science
10:00 – 11:00

Lab 2
```

After it ends:

```text
NEXT CLASS

English
12:00 – 01:00
```

The current class should have a visually distinct state.

---

# 34. Complete Timetable

The timetable must be editable and customizable.

The desired layout is:

```text
             09:00   10:00   11:00   12:00

Monday        Math    CS      —       English

Tuesday       CS      Math    Physics —

Wednesday     Math    —       CS      English
```

Days should be represented along the left side.

Time slots should be displayed across the top.

---

# 35. Timetable Entry

Each timetable block should contain:

```text
Subject
Start time
End time
Room
Teacher (optional)
Color
Day
```

Example:

```text
Mathematics
09:00–10:00
Room 204
```

---

# 36. Timetable Customization

User can:

* Add class
* Edit class
* Delete class
* Change time
* Change room
* Change subject
* Change color
* Configure days

Each subject can have its own color.

Example:

```text
Mathematics → Color A
Computer Science → Color B
English → Color C
```

The exact visual colors should be configurable rather than hardcoded.

---

# 37. Notes

Notes should **not** be limited to a traditional text editor.

Support:

### Text notes

```text
Title
Subject
Content
```

### Image notes

The user can upload photographs of handwritten notes.

Example:

```text
Mathematics

[image]
[image]
[image]
```

Potential future support:

* Multiple images
* Text + images in the same note
* Markdown
* Checklists
* Code blocks
* Attachments

---

# 38. Notes Database

```text
notes

id
user_id
subject_id
title
content
created_at
updated_at
```

For images:

```text
note_attachments

id
note_id
storage_path
file_type
created_at
```

Actual image files belong in object storage.

---

# 39. Profile

The profile is opened by tapping the circular avatar in the Home header.

Profile should display:

```text
Profile

[Profile Photo]

Name
Suraj Maurya

College
...

Course
...

Current Semester
...

College ID
...

[View ID Card]
```

---

# 40. ID Card

The user can upload their college ID card.

The application stores the actual image in object storage.

Database stores:

```text
id_card_storage_path
```

---

# 41. ID Card Viewer

When selecting:

**View ID Card**

open a dedicated card viewer.

Features:

* Full-screen view
* Zoom
* Front/back support if required
* Download/export

---

# 42. ID Card Download

The application should allow the user to download/export their ID card.

Possible output:

```text
ID Card image
```

Future option:

```text
PDF ID Card
```

The application must not claim to generate an official college ID. It simply exports the user's uploaded ID card representation.

---

# 43. Add-ons

Add-ons are optional mini-tools.

They should **not clutter the primary navigation**.

Possible tools:

### Academic

* CGPA Calculator
* SGPA Calculator
* GPA Calculator
* Percentage Calculator
* Marks Calculator
* Grade Calculator
* Attendance Calculator
* Class Skip Calculator
* Required Attendance Calculator

### Productivity

* Pomodoro
* Study Timer
* Exam Countdown

### Utility

* Calculator
* Date Calculator
* Unit Converter
* Currency Converter

---

# 44. Add-on Management

Users should be able to choose which add-ons they want.

Example:

```text
Add-ons

Enabled

[ CGPA Calculator ]
[ Attendance Calculator ]
[ Pomodoro ]

Available

[ SGPA Calculator ]
[ Marks Calculator ]
[ Exam Countdown ]

+ Add
```

The main Home dashboard should not automatically display every tool.

---

# 45. CGPA Calculator

Example:

```text
CGPA Calculator

Semester 1
SGPA: 8.2
Credits: 24

Semester 2
SGPA: 8.6
Credits: 22

[Calculate]

CGPA
8.39
```

The calculation system should be configurable because grading systems vary between institutions.

---

# 46. Search

A global search feature is strongly recommended.

Search:

```text
Python
```

Could return:

```text
Subjects
Python Programming

Notes
Python Functions

Documents
Python Practical.pdf

Tasks
Complete Python Assignment
```

Search should eventually cover:

* Subjects
* Notes
* Tasks
* Books
* Documents

---

# 47. Semester System

Semester must be a core database concept.

Example:

```text
Academic Year
2026–2027

Semester 1
 ├── Mathematics
 ├── Computer Science
 ├── English
 └── ...

Semester 2
 ├── ...
```

Historical semester data must not be deleted automatically when the user moves to a new semester.

---

# 48. Subject-Centric Data Model

Subjects should connect the academic features.

```text
Subject
 │
 ├── Attendance
 ├── Timetable
 ├── Notes
 ├── Documents
 ├── Books
 ├── Tasks
 └── Marks (future)
```

This relationship is fundamental to the application.

---

# 49. Future Academic Modules

Future versions can add:

### Exams

```text
Mathematics
25 October
12 days remaining
```

### Marks

```text
Internal
Mid-sem
Final
```

### Syllabus

```text
Matrices ✓
Determinants ✓
Calculus ○
Probability ○
```

### GPA

```text
Estimated CGPA
8.1
```

These should be designed so they can integrate with the existing Subject/Semester structure.

---

# 50. Database Recommendation

## Recommended solution: Supabase

Use:

```text
Supabase
```

with:

```text
PostgreSQL
+
Authentication
+
Storage
+
Row Level Security
+
Realtime where needed
```

Important distinction:

**Supabase is not itself a database type.**

It is a backend platform.

Its primary database is **PostgreSQL**.

Architecture:

```text
React Native
      │
      ▼
Supabase
 ┌────┼───────────────┐
 │    │               │
Auth PostgreSQL     Storage
 │      │              │
 │      │              ├── PDFs
 │      │              ├── Images
 │      │              └── ID Card
 │      │
 │      ├── Attendance
 │      ├── Subjects
 │      ├── Timetable
 │      ├── Expenses
 │      ├── Tasks
 │      ├── Notes
 │      └── Books
```

---

# 51. Why PostgreSQL Over MongoDB?

For this particular application, PostgreSQL is preferable.

There are many relationships:

```text
User
 ↓
Semester
 ↓
Subject
 ↓
Attendance

Subject
 ↓
Timetable

Subject
 ↓
Notes

Subject
 ↓
Documents
```

Relational data fits naturally into PostgreSQL.

You also get:

* Foreign keys
* Constraints
* Transactions
* SQL queries
* Aggregations
* Strong data consistency

MongoDB would work, but there isn't a strong reason to choose it here.

---

# 52. Why Not Firebase as the First Choice?

Firebase is also viable.

However, for this application, PostgreSQL/Supabase provides a cleaner relational model.

The application has many relationships:

```text
subject → attendance
subject → timetable
subject → notes
subject → books
subject → tasks
semester → subjects
```

PostgreSQL makes these relationships straightforward.

Firebase would be more attractive if the application were heavily dependent on Firebase's ecosystem or realtime document-oriented architecture.

---

# 53. Cloud vs Local Database

Do not make the application cloud-only.

Use:

```text
Cloud
+
Local
```

### Cloud

Source of truth / synchronization:

```text
Supabase PostgreSQL
```

### Local

Offline access:

```text
SQLite
```

---

# 54. Offline-First Architecture

Example:

```text
User marks attendance
        ↓
Write to SQLite
        ↓
UI immediately updates
        ↓
Add operation to sync queue
        ↓
Internet available
        ↓
Sync with Supabase
```

The user should never have to wait for the server just to mark attendance.

---

# 55. Sync Queue

Create a local sync queue.

Example:

```text
sync_queue

id
entity_type
entity_id
operation
payload
created_at
retry_count
synced
```

Operations:

```text
CREATE
UPDATE
DELETE
```

Example:

```text
attendance
ID: abc123
operation: CREATE
```

Once synchronization succeeds:

```text
synced = true
```

Old queue entries can be cleaned up safely.

---

# 56. Conflict Handling

For MVP, use a simple strategy.

For most personal data:

```text
last-write-wins
```

However, the sync layer should use:

```text
updated_at
```

timestamps.

For attendance specifically, avoid silently overwriting a user's manual change.

Manual attendance should have higher priority than automatic default resolution.

---

# 57. Automatic Attendance Job

Automatic absent resolution should not blindly execute immediately after every app launch.

A scheduled/local process or server-side process should determine:

```text
Class finished?
Attendance missing?
Holiday?
Sunday?
```

Then resolve the class appropriately.

A safe rule:

```text
Before class → pending
During class → pending
After class → absent if not marked
Holiday → excluded
Sunday → excluded
```

---

# 58. Database Schema

Recommended core tables:

```text
profiles

academic_years

semesters

subjects

attendance_sessions

holidays

timetable_entries

expenses

quick_expenses

tasks

books

documents

notes

note_attachments

add_ons

user_add_ons
```

---

# 59. Profiles

```text
profiles
---------
id
user_id
name
college_name
course
semester_id
college_id
avatar_storage_path
id_card_storage_path
created_at
updated_at
```

`user_id` references the authenticated user.

---

# 60. Academic Years

```text
academic_years
--------------
id
user_id
name
start_date
end_date
created_at
```

Example:

```text
2026–2027
```

---

# 61. Semesters

```text
semesters
---------
id
academic_year_id
name
number
start_date
end_date
created_at
```

---

# 62. Subjects

```text
subjects
--------
id
semester_id
user_id
name
code
teacher
credits
color
created_at
updated_at
```

---

# 63. Attendance Sessions

```text
attendance_sessions
-------------------
id
user_id
subject_id
timetable_entry_id
date
start_time
end_time
status
source
created_at
updated_at
```

Status:

```text
present
absent
holiday
```

Source:

```text
manual
automatic
```

---

# 64. Holidays

```text
holidays
--------
id
user_id
date
title
type
created_at
```

Example:

```text
15 Aug
Independence Day
College Holiday
```

Sundays do not necessarily need individual database records because they can be calculated from the date.

---

# 65. Timetable

```text
timetable_entries
-----------------
id
user_id
subject_id
day_of_week
start_time
end_time
room
teacher
color
created_at
updated_at
```

---

# 66. Expenses

```text
expenses
--------
id
user_id
amount
category
description
expense_date
quick_expense_id
created_at
updated_at
```

Use a numeric/decimal-compatible database type for monetary amounts.

Do not use floating-point calculations for financial values where avoidable.

---

# 67. Quick Expenses

```text
quick_expenses
--------------
id
user_id
name
amount
category
icon
created_at
updated_at
```

---

# 68. Tasks

```text
tasks
-----
id
user_id
subject_id
title
description
due_date
priority
completed
created_at
updated_at
```

---

# 69. Books

```text
books
-----
id
user_id
subject_id
title
description
storage_path
file_type
created_at
updated_at
```

Books can represent uploaded academic PDFs.

---

# 70. Documents

If Books and Documents are kept separate, use:

```text
documents
---------
id
user_id
subject_id
title
storage_path
file_type
file_size
created_at
updated_at
```

A document can be categorized as:

```text
book
lecture
syllabus
assignment
practical
other
```

---

# 71. Notes

```text
notes
-----
id
user_id
subject_id
title
content
created_at
updated_at
```

---

# 72. Note Attachments

```text
note_attachments
----------------
id
note_id
storage_path
file_type
file_size
created_at
```

---

# 73. Add-ons

```text
add_ons
-------
id
name
description
icon
category
version
```

User-enabled tools:

```text
user_add_ons
------------
id
user_id
addon_id
enabled
created_at
```

---

# 74. Storage Structure

Use private storage buckets.

Example:

```text
avatars/
  {user_id}/profile.jpg

id-cards/
  {user_id}/front.jpg
  {user_id}/back.jpg

documents/
  {user_id}/{document_id}/file.pdf

notes/
  {user_id}/{note_id}/image-1.jpg

books/
  {user_id}/{book_id}/book.pdf
```

---

# 75. Security

Use Supabase Auth.

Every user-owned table must have:

```text
user_id
```

and appropriate Row Level Security policies.

The fundamental rule:

> A user can only read/write their own data.

Storage policies must follow the same principle.

Especially protect:

* ID cards
* Profile images
* PDFs
* Handwritten notes
* Personal documents

---

# 76. Recommended Mobile Stack

```text
React Native
Expo
TypeScript
Expo Router
```

---

# 77. UI Stack

A component system should be created rather than styling every screen independently.

Potential:

```text
React Native
+
NativeWind
```

or a custom design system.

The AI builder should prioritize consistency over adding a large UI library unnecessarily.

---

# 78. State Management

Recommended:

```text
Zustand
```

for application state.

Use:

```text
TanStack Query
```

for server synchronization/cache where useful.

Local database should remain the primary offline data layer.

---

# 79. Local Database

Use SQLite.

Potential implementation:

```text
expo-sqlite
```

Local schema should mirror the important cloud entities.

The application should not make the UI dependent on a network request.

---

# 80. Application Architecture

Recommended:

```text
React Native UI
       ↓
Feature hooks
       ↓
Repositories
       ↓
Local SQLite
       ↓
Sync Engine
       ↓
Supabase
```

Avoid directly calling Supabase from every component.

Bad:

```text
AttendanceScreen
   ↓
supabase.from(...)
```

Better:

```text
AttendanceScreen
      ↓
useAttendance()
      ↓
AttendanceRepository
      ↓
Local DB
      ↓
Sync layer
```

---

# 81. Folder Structure

Recommended feature-based architecture:

```text
src/
│
├── app/
│   ├── (auth)/
│   ├── (tabs)/
│   │   ├── index.tsx
│   │   ├── attendance.tsx
│   │   ├── timetable.tsx
│   │   ├── expenses.tsx
│   │   └── more.tsx
│   │
│   └── _layout.tsx
│
├── features/
│   │
│   ├── attendance/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── repository/
│   │   ├── types.ts
│   │   └── calculations.ts
│   │
│   ├── timetable/
│   ├── expenses/
│   ├── tasks/
│   ├── books/
│   ├── documents/
│   ├── notes/
│   ├── profile/
│   └── addons/
│
├── database/
│   ├── sqlite/
│   ├── migrations/
│   ├── repositories/
│   └── sync/
│
├── components/
│   ├── ui/
│   ├── cards/
│   ├── buttons/
│   ├── inputs/
│   └── layout/
│
├── services/
│   ├── auth/
│   ├── storage/
│   ├── notifications/
│   └── network/
│
├── store/
│
├── lib/
│   ├── supabase.ts
│   ├── sqlite.ts
│   └── query-client.ts
│
├── utils/
│
├── constants/
│
├── types/
│
└── theme/
```

---

# 82. Component System

Create reusable components such as:

```text
AppHeader
AvatarButton
DashboardCard
AttendanceCard
ExpenseCard
TaskCard
BooksCard
TimetableCard
SubjectBadge
AttendanceBadge
EmptyState
LoadingState
ErrorState
BottomSheet
Modal
SearchBar
PrimaryButton
IconButton
Input
DatePicker
TimePicker
```

---

# 83. UI Design Principles

The interface should be:

* Clean
* Modern
* Minimal
* Mobile-first
* Touch-friendly
* Fast
* Consistent

Avoid excessive:

* borders
* gradients
* shadows
* tiny text
* unnecessary animations
* nested menus

---

# 84. Dashboard UX

The dashboard should prioritize information density without becoming crowded.

The user should be able to answer within seconds:

```text
What's my attendance?
How much have I spent?
What tasks are pending?
What books/PDFs do I have?
What class is next?
```

---

# 85. Empty States

Every module needs a useful empty state.

Example:

```text
No subjects yet.

Add your first subject to start
tracking attendance and timetable.

[Add Subject]
```

Documents:

```text
No documents yet.

Upload your first college PDF.

[Upload PDF]
```

---

# 86. Loading States

Use skeleton loaders rather than blank screens where appropriate.

Avoid showing:

```text
Loading...
```

for every tiny operation.

Local data should appear immediately whenever available.

---

# 87. Error Handling

Errors should be human-readable.

Bad:

```text
PGRST116
```

Good:

> Couldn't sync your attendance. Your changes are saved locally and will sync when you're online.

This is especially important for offline operation.

---

# 88. Offline UX

The application should not feel broken without internet.

Optional small status indicator:

```text
● Synced
```

or:

```text
↻ Syncing...
```

or:

```text
Offline — changes saved locally
```

Do not block normal data entry because of network failure.

---

# 89. Authentication Flow

First launch:

```text
Splash
 ↓
Authentication
 ↓
Create account / Login
 ↓
Profile setup
 ↓
Academic setup
 ↓
Home
```

---

# 90. Initial Setup

After account creation:

```text
Your name
↓
College
↓
Course
↓
Academic year
↓
Current semester
↓
Add subjects
↓
Create timetable
```

Allow users to skip nonessential setup and complete it later.

---

# 91. Notifications

Future/optional MVP feature.

Possible notifications:

```text
Your next class starts in 30 minutes.

Python assignment is due tomorrow.

Your Mathematics attendance is below 75%.
```

Notifications should be user-configurable.

---

# 92. Accessibility

The app should support:

* readable font sizes
* sufficient contrast
* accessible touch targets
* screen reader labels
* no information conveyed by color alone

Attendance status should use text/icon in addition to color.

---

# 93. Performance Requirements

Target:

* Dashboard opens quickly from local database.
* Attendance marking feels instant.
* Expense quick actions execute immediately.
* Timetable scrolling remains smooth.
* PDF lists load without blocking the UI.
* Large documents/images should not be unnecessarily loaded into memory.

Use lazy loading for large lists and images.

---

# 94. Data Validation

Examples:

### Expense

```text
amount > 0
```

### Timetable

```text
start_time < end_time
```

### Subject

```text
name required
```

### Task

```text
title required
```

### Attendance

```text
status must be valid enum
```

---

# 95. Important Data Integrity Rules

### Attendance

Never count holidays as absent.

### Sunday

Automatically treated as holiday.

### Duplicate attendance

A subject/class/date combination should not accidentally create duplicate attendance records.

### Expenses

Deleting an expense should actually remove it from totals.

### Timetable

Deleting a timetable entry must not delete the subject.

### Subject deletion

Should warn the user because related attendance/notes/documents may exist.

---

# 96. Dashboard Data Relationships

The Home screen should pull information from the underlying systems.

Example:

```text
Today's date
     ↓
Timetable
     ↓
Today's classes
     ↓
Current time
     ↓
Current/next class
```

Attendance:

```text
Subjects
   ↓
Attendance records
   ↓
Attendance calculation
   ↓
Dashboard percentage
```

Expenses:

```text
Expenses
   ↓
Current month
   ↓
SUM(amount)
   ↓
Expense card
```

Tasks:

```text
Tasks
   ↓
completed = false
   ↓
Remaining count
```

---

# 97. Future AI Integration

Do not implement initially, but design the data layer so AI can eventually query structured information.

Future queries:

> "What classes do I have tomorrow?"

> "How many classes can I miss?"

> "What assignments are due this week?"

> "How much did I spend on food this month?"

> "Show me everything related to Python."

The AI should operate on the user's structured data with strict authorization.

---

# 98. Future Smart Dashboard

Eventually the Home screen could intelligently show:

```text
Next class
↓
Attendance warning
↓
Task due today
↓
Expense summary
```

For example:

> "You have Computer Science in 45 minutes. Your current attendance is 73%."

This is a future enhancement, not MVP.

---

# 99. MVP Acceptance Criteria

The first production-ready version is successful if:

### Authentication

* User can register/login.
* Session persists.

### Profile

* User can edit profile.
* Avatar can be uploaded.
* ID card can be uploaded/viewed.

### Subjects

* User can create/edit/delete subjects.
* Subjects belong to a semester.

### Attendance

* User can mark Present.
* User can mark Absent.
* User can mark holidays.
* Sundays are automatically excluded.
* Missing completed classes become Absent.
* Attendance percentage is accurate.
* Attendance works offline.
* Attendance syncs to cloud.

### Timetable

* User can add/edit/delete classes.
* Subject colors work.
* Today's schedule is generated automatically.
* Current/next class is calculated.

### Expenses

* User can add/edit/delete expenses.
* Monthly total works.
* Quick expenses work.

### Tasks

* Create/read/update/delete.
* Completion state works.

### Books/Documents

* PDFs can be uploaded.
* PDFs can be listed.
* PDFs can be opened.
* Metadata is stored in PostgreSQL.
* Actual files are stored in object storage.

### Notes

* Text notes work.
* Images can be attached.
* Notes can be associated with subjects.

### Add-ons

* User can enable tools.
* CGPA calculator works.
* Additional tools can be added later without modifying the core navigation.

---

# 100. Development Phases

## Phase 1 — Foundation

```text
Expo
React Native
TypeScript
Navigation
Theme
Supabase
Authentication
SQLite
```

---

## Phase 2 — Academic Core

```text
Profile
Academic year
Semester
Subjects
```

---

## Phase 3 — Attendance

```text
Attendance UI
Attendance calculations
Holiday system
Sunday handling
Automatic absent logic
Offline attendance
Cloud synchronization
```

---

## Phase 4 — Timetable

```text
Timetable editor
Subject colors
Today's timetable
Current class
Next class
```

---

## Phase 5 — Productivity

```text
Tasks
Expenses
Quick expenses
```

---

## Phase 6 — Academic Resources

```text
Books
PDFs
Documents
Notes
Image notes
```

---

## Phase 7 — Dashboard

Connect all modules:

```text
Attendance
Expenses
Tasks
Books
Today's timetable
```

---

## Phase 8 — Add-ons

Start with:

```text
CGPA
SGPA
Attendance calculator
Class skip calculator
```

Then expand.

---

## Phase 9 — Polish

```text
Animations
Empty states
Error states
Offline indicators
Performance
Accessibility
Notifications
Security review
```

---

# 101. GitHub Development Strategy

Break implementation into issues rather than giving the AI builder one giant coding task.

Example:

```text
#001 Initialize Expo project
#002 Configure TypeScript
#003 Configure Supabase
#004 Configure authentication
#005 Create database migrations
#006 Implement SQLite
#007 Implement sync engine
#008 Create profile
#009 Create semesters
#010 Create subjects
#011 Build attendance
#012 Attendance calculations
#013 Holiday system
#014 Build timetable
#015 Today's timetable
#016 Expense tracker
#017 Quick expenses
#018 Task manager
#019 Books
#020 Document storage
#021 Notes
#022 Dashboard
#023 Add-ons
#024 Search
#025 Notifications
#026 Security review
#027 Offline testing
#028 Production build
```

---

# 102. Critical Instruction for the AI Builder

The AI builder should **not invent additional major features** without keeping them isolated from the MVP.

It should:

1. Follow the database relationships.
2. Use TypeScript strictly.
3. Keep features modular.
4. Avoid duplicated business logic.
5. Keep UI components reusable.
6. Make local storage the first read/write layer for offline-capable data.
7. Synchronize with Supabase in the background.
8. Never store PDFs/images directly in PostgreSQL.
9. Use private storage for personal documents.
10. Enforce user-level security.
11. Keep attendance calculations in a dedicated service.
12. Never calculate attendance differently in different screens.

---

# 103. Final Architecture

The complete system should conceptually look like:

```text
                         CAMPUSOS
                            │
                   React Native + Expo
                            │
             ┌──────────────┴──────────────┐
             │                             │
        UI / Screens                  Local SQLite
             │                             │
        Feature Hooks                Offline Data
             │                             │
        Repositories                Sync Queue
             │                             │
             └──────────────┬──────────────┘
                            │
                      Sync Engine
                            │
                            ▼
                       SUPABASE
                            │
          ┌─────────────────┼──────────────────┐
          │                 │                  │
     PostgreSQL            Auth             Storage
          │                                    │
          ├── Profiles                         ├── PDFs
          ├── Semesters                        ├── ID Cards
          ├── Subjects                         ├── Note Images
          ├── Attendance                       ├── Book Files
          ├── Timetable                        └── Avatars
          ├── Expenses
          ├── Tasks
          ├── Notes
          └── Books
```

---

# 104. Product Philosophy

The final application should follow one simple rule:

> **Everything that is repetitive in college should take as few taps as possible.**

Mark attendance → one tap.

Record a ₹30 ticket → one tap.

Check next class → open Home.

Open a Maths PDF → two taps.

Check pending assignments → open Home.

Check attendance → open Attendance.

Calculate CGPA → open Add-ons.

The application should feel like **your personal college companion**, not a database interface.

---

## Recommended final stack

**Frontend**

```text
React Native
Expo
TypeScript
Expo Router
NativeWind/custom UI
Zustand
TanStack Query
```

**Local**

```text
SQLite
Offline-first repository layer
Sync queue
```

**Backend**

```text
Supabase
PostgreSQL
Supabase Auth
Supabase Storage
Row Level Security
```

**Future**

```text
Edge Functions
Push Notifications
AI assistant
Analytics
Exam/Marks/GPA
Calendar integration
```

This is the architecture I would use for the project. It gives you a relatively simple MVP while leaving enough structure to grow it into a much more capable **personal college OS** without having to rebuild the database or application architecture later.
