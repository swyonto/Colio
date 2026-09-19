# CampusOS — Product Requirements Document
### Version 2.1 · Dark Emerald Edition · React Native Expo

> **Changelog v2.1** (September 2026):
> - **Navigation Bar**: Animated sliding indicator pill (`react-native-reanimated`), pure white selected icons (`#FFFFFF`), muted unselected (`#4A6B58`), and label renamed from `"Attendance"` → `"Attend"` (guaranteed single-line on 360dp screens).
> - **Header Bar**: Graduation cap logo (`school` icon with soft emerald glow ring), user-customizable app nickname from onboarding profile (default: `"MyCollege"`), removed subtitle, and collapsible 38dp search icon button that smoothly expands into a full search bar.
> - **Card Aesthetics (Supabase Dark Mode)**: Pure dark charcoal card fill (`#0F1010` / `#141414`) with **zero green mixing** in base background, allowing bottom-right emerald ambient glows and subtle borders to pop crisply.
> - **2×2 Stat Grid Optical Symmetry**: Symmetrical and centered layout fixing left-dominance (icon top-left, `ArrowOutward` ↗ top-right, centered value, centered micro-label + badge).
> - **Editable Values**: Manual override and editing for pre-filled numbers (overall attendance %, subject present/absent counts).
> - **Task Card Fix**: Checkbox toggles strike-through and dims row to 55% opacity, sinks to bottom without deleting. Simplified New Task modal (no subject friction).
> - **Attendance Screen**: Day-based timetable class view with horizontal day tabs (Mon–Sat), gradient circle/donut indicator, and manual counts edit modal.
> - **Timetable Screen**: Persisted view mode (`grid` vs `list` in AsyncStorage) and enhanced dark glass grid cells with subject color stripe.
> - **Expenses System**: Swipe-to-edit interaction + first-time hint, editable/customizable quick expense presets (CRUD: change title, amount, icon, delete/add), time-of-day filters (Morning 🌅, Afternoon ☀️, Evening 🌆, Night 🌙) + category filters, and multi-month expense archiving with month-over-month comparison view.
> - **Books & PDFs**: Renamed to `"Books & PDFs"`, empty library default (no fake PDFs), simplified add flow (auto pre-filled title from filename + optional subject), native OS PDF viewer via share intent.
> - **ID Card**: Fullscreen overlay preview mode with pinch-to-zoom and landscape layout mode.
> - **Holidays & Auto-Absent Logic**: Timetable day integration, automatic absent marking for past unmarked classes (30m buffer) with retroactive edit override, and holiday exclusion from attendance math.
> - **Global Micro-Interactions & Haptics**: Standardized spring press feedback (cards scale 0.985, buttons 0.96), count-up animations, and tactile haptic mappings.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Vision & Goals](#2-vision--goals)
3. [Target Audience](#3-target-audience)
4. [Design Philosophy](#4-design-philosophy)
5. [Visual Design System](#5-visual-design-system)
6. [Component Library](#6-component-library)
7. [Navigation Architecture](#7-navigation-architecture)
8. [Screen Requirements](#8-screen-requirements)
9. [User Flows](#9-user-flows)
10. [Data Requirements](#10-data-requirements)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Accessibility](#12-accessibility)
13. [Platform & Tech Constraints](#13-platform--tech-constraints)
14. [Appendices](#appendices)

---

## 1. Product Overview

**CampusOS** is a premium, offline-first academic companion app for college students in India. It consolidates all essential academic tools — attendance tracking, timetable management, expense logging, task deadlines, library documents, CGPA calculation, and class notes — into a single, beautifully designed interface.

The app functions as a student's personal academic operating system, built around a philosophy of elegance, speed, and simplicity. Everything works offline with local storage as the primary data layer.

### 1.1 App Identity

| Property | Value |
|---|---|
| **App Name** | User-defined at first launch (onboarding), stored in `student_profile.app_nickname`. Default suggestions: `"MyCollege"`, `"CollegeKit"`, `"AcadLog"` |
| **Logo Icon** | Graduation Cap / Mortarboard (`school` icon) — pure white with soft emerald radial glow ring behind it |
| **Tagline** | *(Removed — no subtitle line under app title in header to save vertical space)* |
| **Personality** | Premium · Focused · Intelligent · Calm · Clutter-Free |
| **Visual Identity** | Supabase-Style Dark Emerald Glassmorphism (pure charcoal base fill + corner ambient glows) |
| **Platform** | React Native (Expo) — iOS & Android |
| **Primary Market** | Indian College Students (UG/PG) |
| **Offline Support** | Full — all features available without internet |

---

## 2. Vision & Goals

### 2.1 Vision Statement
> Build the most elegant and useful academic companion for college students — an app that is so well-designed it feels premium even without a paid subscription, and so complete it replaces 6 separate apps with one.

### 2.2 Primary Goals

| Goal | Success Metric |
|---|---|
| Replace Attendance App | User logs ≥3 attendance entries in first week |
| Replace Expense Tracker | User creates ≥1 quick expense per day |
| Replace Calendar/Tasks | User creates ≥2 tasks per week |
| Replace Timetable App | User views timetable every weekday |
| Achieve Premium Feel | Rating ≥ 4.5 stars on app stores |
| Fast Performance | All screens load in < 200ms |

### 2.3 Anti-Goals
- This is **not** a social or collaborative platform
- This is **not** a cloud-first app — local data is the source of truth
- This is **not** a notes-taking app (supports photo notes only, not rich text editing)
- This does **not** require user authentication or account creation

---

## 3. Target Audience

### 3.1 Primary User
**Indian college student, age 18–25**, enrolled in a UG/PG program (Engineering, Commerce, Arts, Medicine, Law, MBA). Likely has:
- 5–8 subjects per semester
- A tight budget
- Classes 5–6 days a week
- 75% minimum attendance requirement enforced by college
- Peer pressure to track CGPA precisely

### 3.2 User Personas

**Persona 1 — "The Tracker"**
- Engineering student, Semester 5
- Anxious about attendance — checks it obsessively
- Wants to know exactly how many classes they can miss
- Respects numbers and data

**Persona 2 — "The Planner"**
- MBA student, needs to juggle assignments, exams, and presentations
- Lives by deadlines and task lists
- Willing to spend 2 minutes setting up timetable once and use it for 6 months

**Persona 3 — "The Budget Student"**
- Lives on a monthly budget from parents
- Tracks every chai and canteen bill
- Wants quick-tap expense logging, not manual entry every time

---

## 4. Design Philosophy

### 4.1 Core Design Principle
> **"Dark glass + emerald ambient lighting + soft gradient illumination + deep black depth"**
>
> NOT: **"Bright neon green cyberpunk"**

The interface is predominantly **black and deep charcoal**, with emerald green appearing **only as natural illumination** — like soft light reflecting through dark glass. The green should feel atmospheric and cinematic, not synthetic or harsh.

### 4.2 The Six Design Laws

**Law 1 — Restraint over abundance**
Every element must earn its presence. If it doesn't serve a functional purpose or reinforce hierarchy, remove it. No decorative noise.

**Law 2 — Depth through layering**
Depth is created by stacking translucent surfaces, not by using borders or shadows alone. Surfaces should feel like dark glass panels floating in space.

**Law 3 — Emerald is light, not paint**
Emerald green is used to simulate light — radial glows, progress indicators, active states, icons — never as a background fill for large areas.

**Law 4 — Typography is the primary communication tool**
The quality of information hierarchy depends on font weight, size, and color contrast — not on decorative elements. Bold white numbers on dark surfaces communicate without ornament.

**Law 5 — Every interaction must feel physical**
Buttons scale down on press (spring bounce back), cards animate on tap, progress bars animate smoothly. The app should feel satisfying to touch.

**Law 6 — Speed is a feature**
Transitions between screens should complete in 250ms or less. No loading spinners for local data. Skeleton screens if anything takes more than 100ms.

### 4.3 Aesthetic Reference
The visual design is inspired by:
- Premium dark SaaS dashboards (Linear, Vercel, Raycast)
- High-end smartwatch UIs (Apple Watch Ultra, Garmin)
- Cinematic dark glass interfaces seen in sci-fi productions
- The CampusHub reference design shown (dark emerald dashboard with glass cards)

---

## 5. Visual Design System

### 5.1 Color Palette

#### 5.1.1 Background Layers

| Token | Hex | Usage |
|---|---|---|
| `bg-base` | `#050907` | App background — deep near-black charcoal |
| `bg-surface` | `#0C0D0C` | Near-black surface for dark glass panels |
| `bg-card` | `#0F1010` | Pure dark charcoal card fill (**zero green mixing** in base) |
| `bg-elevated` | `#141414` | Dialogs, modals, higher layers (pure dark charcoal) |
| `bg-inner` | `#0A0B0A` | Inner rows, list item backgrounds |
| `bg-rim` | `#181818` | Nav bar, header glass surface |

> **Design Law:** Card background fills must use **pure dark charcoal** (`#0F1010` to `#141414`), NEVER green-tinted gradients. Green appears strictly through localized radial glows, borders, and interactive accents. This gives cards a crisp Supabase-tier dark appearance.

#### 5.1.2 Emerald Accent System

| Token | Hex | Usage |
|---|---|---|
| `emerald-primary` | `#00E676` | Icons, active states, primary CTAs, progress bars |
| `emerald-secondary` | `#00C853` | Secondary accents, buttons |
| `emerald-highlight` | `#69F0AE` | Soft mint highlights, subtle accents |
| `emerald-dim` | `#00796B` | Muted teal — borders, subtle elements |
| `emerald-deep` | `#004D40` | Very deep emerald — chip backgrounds |

#### 5.1.3 Glow / Ambient Colors
These are `emerald-primary` used at very low alpha values for radial gradient effects:

| Alpha | Visual Effect |
|---|---|
| `6%` | Atmospheric background orbs |
| `10–13%` | Card localized bottom-right glow |
| `18–22%` | Active state glow, selected card glow |

> **Rule:** Ambient glows are always `radialGradient`, never `linearGradient` or flat color fills.

#### 5.1.4 Typography Colors

| Token | Hex | Usage |
|---|---|---|
| `text-primary` | `#F0FFF4` | Headings, key numbers, primary text |
| `text-secondary` | `#B2DFDB` | Supporting text, card subtitles |
| `text-muted` | `#6B8F7A` | Labels, timestamps, category text |
| `text-disabled` | `#3D5247` | Disabled/placeholder text |

#### 5.1.5 Status Colors

| Token | Hex | Usage |
|---|---|---|
| `status-present` | `#00E676` | Attendance present, success states |
| `status-present-bg` | `#052810` | Present chip background |
| `status-absent` | `#FF5252` | Attendance absent, error states |
| `status-absent-bg` | `#2A0808` | Absent chip background |
| `status-holiday` | `#FFC107` | Holiday indicators |
| `status-pending` | `#FFAB40` | Due-today tasks, warning states |

#### 5.1.6 Border Colors

| Token | Hex | Usage |
|---|---|---|
| `border-subtle` | `#1F3028` | Default card border, very dark |
| `border-emerald` | `#2D5040` | Emerald-tinted border |

All card borders use a **gradient brush**, not a flat color:
- Start: `White 8–10% alpha`
- Mid: `emerald-dim 20–28% alpha`
- End: `White 4–6% alpha`

#### 5.1.7 Colors to NEVER Use
The following colors are **banned** from the UI to preserve the emerald identity:

- Purple (`#8B5CF6`, `#6366F1`, etc.)
- Pink / Fuchsia (`#EC4899`, `#D946EF`)
- Blue (`#3B82F6`, `#0EA5E9`)
- Orange (`#EA580C`, `#F97316`) — except `#FFAB40` for status-pending only
- Rainbow multi-color gradients on background or cards

---

### 5.2 Typography

#### 5.2.1 Font Family
**Primary Font:** `Inter` (Google Fonts)
- Loaded via `@expo-google-fonts/inter`
- All weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold), 900 (Black)

**Fallback:** System default sans-serif

#### 5.2.2 Type Scale

| Token | Size | Line Height | Weight | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `display-xl` | 57sp | 64sp | Black 900 | -1.5sp | Hero numbers |
| `display-lg` | 45sp | 52sp | Bold 700 | -1.0sp | Stat card values |
| `display-md` | 36sp | 44sp | Bold 700 | -0.5sp | Large counters |
| `headline-lg` | 32sp | 40sp | SemiBold 600 | -0.3sp | Section heroes |
| `headline-md` | 28sp | 36sp | SemiBold 600 | -0.2sp | Screen titles |
| `headline-sm` | 24sp | 32sp | SemiBold 600 | -0.1sp | Card headers |
| `title-lg` | 22sp | 28sp | Bold 700 | -0.2sp | Card section titles |
| `title-md` | 16sp | 24sp | SemiBold 600 | -0.1sp | Card titles |
| `title-sm` | 14sp | 20sp | SemiBold 600 | 0sp | Sub-card titles |
| `body-lg` | 16sp | 24sp | Regular 400 | 0.15sp | Main body text |
| `body-md` | 14sp | 20sp | Regular 400 | 0.1sp | Supporting body |
| `body-sm` | 12sp | 16sp | Regular 400 | 0.1sp | Captions, subtitles |
| `label-lg` | 14sp | 20sp | SemiBold 600 | 0.1sp | Button labels |
| `label-md` | 12sp | 16sp | Medium 500 | 0.3sp | Chip labels |
| `label-sm` | 11sp | 16sp | Medium 500 | 0.4sp | Metadata, timestamps |
| `overline` | 10sp | 14sp | SemiBold 600 | 1.5sp | Section labels (uppercase) |

#### 5.2.3 Typography Rules

1. **Section labels** use `overline` style in UPPERCASE with `text-muted` color
2. **Large statistics** (attendance %, expense totals, task counts) use `display-lg` or `display-md` with `text-primary`
3. **Card titles** use `title-md` with `text-primary`
4. **Supporting context** uses `body-sm` or `label-sm` with `text-secondary` or `text-muted`
5. **Accent text** (emerald) is used sparingly — action links, status indicators, active tab labels only
6. **Never** use `text-muted` color for primary data values
7. **Display sizes** must have **negative letter spacing** for cinematic premium feel

---

### 5.3 Spacing System

CampusOS uses an **8dp base grid**. All spacing values are multiples of 4dp.

#### 5.3.1 Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4dp | Micro gaps — between label and value |
| `space-2` | 8dp | Small gaps — between related items |
| `space-3` | 12dp | Medium-small — list item internal padding |
| `space-4` | 16dp | Base unit — card padding, screen padding |
| `space-5` | 20dp | Medium-large — between card sections |
| `space-6` | 24dp | Large — section-level spacing, dialog padding |
| `space-8` | 32dp | XL — section separators |
| `space-10` | 40dp | XXL — screen-level breathing room |

#### 5.3.2 Card Spacing Rules

| Area | Value |
|---|---|
| Card outer padding | 18dp all sides |
| Between card sections | 14–16dp vertical spacer |
| Icon box size (large) | 40–42dp |
| Icon box size (medium) | 34dp |
| Icon box padding | 8–10dp |
| Card list vertical gap | 14dp |
| Screen horizontal padding | 16dp |
| Screen top padding | 16dp |
| Screen bottom padding | 100dp (clears nav bar) |

#### 5.3.3 Component Spacing Rules

| Component | Internal Padding |
|---|---|
| Primary button | 16dp H × 12dp V |
| Chip / badge | 10dp H × 5dp V |
| Quick action chip | 16dp H × 13dp V |
| Tab item | 10dp H × 4dp V |
| Status badge | 8dp H × 3dp V |
| Dialog | 24dp padding |
| Bottom sheet | 20dp padding |
| Nav bar item | 10dp H × 4dp V (around icon) |
| Search pill | 12dp H × 8dp V |

#### 5.3.4 Grid System

The 2×2 stat card grid on the home screen:
- 2 columns, equal width
- Column gap: 10dp
- Row gap: 10dp
- Card height: determined by content (auto, ~140–160dp)

---

### 5.4 Elevation & Depth

CampusOS achieves depth through **layered glassmorphism**, not box shadows.

#### 5.4.1 Surface Layer Stack

```
Layer 0 — Background (#050907)
  ↑ Ambient emerald orbs (radialGradient, 6–9% alpha)

Layer 1 — Card base (#111A14 → #090E0B linear gradient)
  ↑ Localized emerald radial glow (bottom-right, 10–13% alpha)
  ↑ Gradient border (0.6dp, White@8% → EmeraldDim@25% → White@5%)

Layer 2 — Inner elements (row items, chips, list rows)
  Background: #0D1610 or #0C1410

Layer 3 — Overlay / Modal (#162019)
  Backdrop: bg-base at 85% opacity

Layer 4 — Toast / Snackbar (#1C2820)
```

#### 5.4.2 Card Glow Specifications

Every card has a **localized radial glow at the bottom-right corner**:

```
radialGradient(
  center: bottom-right corner of card,
  radius: 900–1100px,
  stops: [
    0%   → transparent,
    50%  → transparent,
    78%  → emerald-primary @ 5% alpha,
    100% → emerald-primary @ 12–13% alpha
  ]
)
```

**Status-reactive glow** (Attendance card):
- Attendance ≥ 75%: glow color = `#00E676`
- Attendance < 75%: glow color = `#FF5252`

#### 5.4.3 Background Orbs

Three atmospheric light sources behind the content:

| Orb | Position | Radius | Color | Alpha |
|---|---|---|---|---|
| Top-right | (100% width, 80dp) | 900px | `#00E676` | 9% |
| Bottom-left | (0, 75% height) | 1100px | `#00C853` | 6% |
| Mid-right | (100% width, 50% height) | 700px | `#00796B` | 4% |

---

### 5.5 Border & Outline System

#### 5.5.1 Card Borders
All card borders:
- **Width:** 0.6dp
- **Type:** Gradient (linear, top-left to bottom-right)
- **Color stops:** `[White@8%, EmeraldDim@25%, EmeraldPrimary@14%, White@5%]`
- **Border radius:** 18dp (main cards)

> On React Native, gradient borders require SVG or Skia implementation (see Section 13.3).

#### 5.5.2 Inner Element Borders
Chip, badge, inner row borders:
- **Width:** 0.5dp
- **Color:** Flat `EmeraldDim @ 20–25% alpha` or status color @ 22–25% alpha

#### 5.5.3 Border Radius Reference

| Element | Radius |
|---|---|
| Main cards | 18dp |
| Dialogs | 20dp |
| Bottom sheets | 24dp (top corners only) |
| Inner rows / list items | 12dp |
| Quick action chips | 12dp |
| Small chips / badges | 8dp |
| Status badges | 6–8dp |
| Icon boxes | 9–10dp |
| Search pill | 10dp |
| Avatar | 50% (circular) |
| Nav bar | 0dp (full width) |

---

### 5.6 Icon System

#### 5.6.1 Icon Library
**Primary:** `MaterialCommunityIcons` or `MaterialIcons` from `@expo/vector-icons`

#### 5.6.2 Icon Sizes

| Context | Size |
|---|---|
| Navigation bar icons | 22dp |
| Card section header icons | 18dp |
| Icon box (42dp container) | 22dp |
| Icon box (34dp container) | 17dp |
| Action link arrow icons | 13dp |
| Status indicator icons | 11–12dp |
| Header search icon | 16dp |

#### 5.6.3 Icon Colors

| Context | Color |
|---|---|
| Primary card icon | `#00E676` (emerald-primary) |
| Navigation selected | `#00E676` |
| Navigation unselected | `#4A6B58` |
| Status present | `#00E676` |
| Status absent | `#FF5252` |
| Status holiday | `#FFC107` |
| Muted / secondary | `#6B8F7A` (text-muted) |
| Action link arrow | `#00E676 @ 75% alpha` |

#### 5.6.4 Icon Box Styling
Icon containers:
- Background: `icon-color @ 10–12% alpha`
- Border: `icon-color @ 20–25% alpha`, 0.5dp

---

### 5.7 Motion & Animation

#### 5.7.1 Spring Animations
All interactive elements use **spring physics**, not linear easing.

Via `react-native-reanimated`:

| Element | Damping | Stiffness | Scale Down |
|---|---|---|---|
| Card tap | 10 (medium bouncy) | 100 (medium) | 0.985 |
| Button tap | 10 | 60 (soft) | 0.96 |
| Stat mini-card | 10 | 100 | 0.985 |
| Checkbox | 8 | 150 | 1.0 (pop up) |

#### 5.7.2 Transition Durations

| Transition | Duration | Easing |
|---|---|---|
| Screen navigation (Expo Router) | 280ms | Spring |
| Bottom sheet open | 350ms | Spring (soft) |
| Dialog appear | 200ms | Ease out |
| Progress bar fill (on mount) | 600ms | Ease in-out |
| Skeleton shimmer | 1200ms | Linear loop |
| Tab switch | 180ms | Fade + 8dp translate |

#### 5.7.3 Micro-interaction Rules

1. **Every tappable card** must have press feedback (scale spring: 0.985)
2. **Progress bars** animate their fill value on first mount
3. **Large numbers** (stats) should count up from 0 on screen enter
4. **Tab switches** use fade + slight upward translate (8dp)
5. **Empty states** appear with a fade-in (200ms delay)
6. **Checkbox** toggle has a spring scale pop

#### 5.7.4 Reduced Motion
Respect `AccessibilityInfo.isReduceMotionEnabled()`:
- When `true`: disable all spring animations, use instant transitions, remove parallax

---

## 6. Component Library

### 6.1 `EmeraldGlassCard`
Primary card container. All dashboard cards use this.

**Visual layers (bottom to top):**
1. Base fill: `LinearGradient(#0F1010 → #141414 → #111111, diagonal)` — pure dark charcoal, zero green tint
2. Radial glow: emerald, `center: bottom-right`, 10–12% alpha at peak (subtle corner illumination)
3. Gradient border: 0.6dp, `[White@6%, EmeraldDim@18%, EmeraldPrimary@12%, White@4%]`

**States:**
- Default: emerald glow
- Status-reactive: emerald or rose glow based on data value
- Pressed: scale 0.985 via spring (damping 12, stiffness 120)

**Variants:**
- `EmeraldGlassCard` — full-width dashboard card (18dp radius)
- `StatMiniCard` — compact 2-column grid card with centered symmetry (16dp radius)

---

### 6.2 `StatMiniCard`
Used in the 2×2 summary grid on the home screen.

**Optical Symmetry & Balanced Layout (Fixes Left-Dominance):**
- **Top Row**: 
  - Icon box (34dp, radius 9dp) on the left — dark glass + emerald accent tint
  - Navigation diagonal arrow (`ArrowOutward` ↗, 18dp, muted emerald `#6B8F7A`) on the right — balances the top edge
- **Middle Row (Value)**:
  - Large value (`display-md`, `text-primary`), centrally balanced within the card
  - Editable pre-filled value: long-press opens manual number edit modal
- **Bottom Row**:
  - Micro-label (`overline` / `label-sm`, `text-secondary`, uppercase)
  - Sub-label / status chip (e.g. `Can miss 2` or `3 due today`) centered or symmetrically aligned
- **Padding**: Uniform 14dp all around to eliminate empty dark margins on the right

**Grid:** 2 columns, 10dp gap, uniform card height (~144dp)

---

### 6.3 `AccentStripe`
Vertical gradient stripe on the left edge of main cards.

- Size: 3dp wide × 60dp tall
- Placed: left edge, vertically centered
- Gradient: `[color@0%, color@70%, color@0%]` (vertical, fade in/out)
- Shape: right corners rounded (3dp)

---

### 6.4 `StatusBadge`
Pill chip for present/absent/due-today/NOW/NEXT labels.

- Background: `status-color @ 12% alpha`
- Border: `status-color @ 25% alpha`, 0.5dp, radius 8dp
- Text: `label-sm`, SemiBold, `status-color`
- Padding: 10dp H × 5dp V

---

### 6.5 `GlassHeader`
Top app bar.

- Background: `LinearGradient(#050907 → #0C0D0C, vertical)` with glass blur
- **Logo Area**: 
  - Graduation Cap / Mortarboard icon (`school`, 30dp) with soft emerald radial glow ring behind it
  - Personal App Nickname: bold title (`title-lg`, `text-primary`, e.g., "MyCollege")
  - Subtitle: **Removed completely** to preserve 12dp vertical space
- **Right Side Controls**:
  - **Collapsible Search Button**:
    - Default state: 38dp circular dark glass icon button (50% border radius) with search icon
    - On tap: spring-animates open (~220ms) into a full horizontal search input with clear (✕) button
    - Auto-focuses keyboard on expand; collapses back on ✕ tap or outside dismiss
  - **AvatarButton**:
    - 38dp outer glow ring (EmeraldPrimary@25% radial)
    - 34dp circle: `#141414` pure charcoal bg, EmeraldPrimary@50% border, student initials in EmeraldPrimary

---

### 6.6 `GlassNavBar`
Bottom navigation bar with animated sliding indicator.

- **5 Navigation Items**: `Home`, `Attend` (shortened from "Attendance" to guarantee 1-line display on 360dp devices), `Timetable`, `Expenses`, `More`
- **Background**: `#0A0B0A @ 95%` dark charcoal glass with top subtle border gradient
- **Sliding Animated Active Indicator Pill**:
  - Smoothly slides horizontally from old tab position to new tab position using `react-native-reanimated` spring animation (damping 15, stiffness 120, ~250ms duration)
  - Pill background: `EmeraldPrimary @ 18%` with `EmeraldPrimary @ 35%` 0.5dp border
- **Icon & Label Styling**:
  - **Selected Icon**: **Pure White (`#FFFFFF`)** — prevents mixing into emerald background glow
  - **Selected Label**: Crisp white (`#F0FFF4`, `label-sm`, SemiBold)
  - **Unselected Icon**: Muted sage green (`#4A6B58`)
  - **Unselected Label**: Muted text (`#6B8F7A`, `label-sm`)

---

### 6.7 `ClassRowItem`
Class entry inside TimetableCard.

**Background by state:**
- Current (`NOW`): `EmeraldPrimary@8%`
- Next (`NEXT`): `#0E1A12`
- Others: `#0C1410`

**Structure:**
- Top row: color dot + time range + NOW/NEXT badge
- Middle: subject name (bold, `text-primary` if current, `text-secondary` otherwise)
- Bottom row: room/teacher + attendance action buttons OR status badge

---

### 6.8 `AttendanceActionButtons`
Quick mark buttons inside `ClassRowItem`.

- **Present:** EmeraldPresent@12% bg, EmeraldPresent@22% border, ✓ icon + "Present"
- **Absent:** StatusAbsent@12% bg, StatusAbsent@22% border, ✕ icon + "Absent"
- Padding: 9dp H × 4dp V, radius 6dp

---

### 6.9 `QuickActionChip`
Action buttons in the Quick Actions home section.

- Background: dark glass (#111A14)
- Border: EmeraldDim@28%, 0.6dp, radius 12dp
- Layout: Row centered, icon (EmeraldPrimary, 17dp) + 8dp gap + label (`label-md`, `text-primary`)
- Padding: 16dp H × 13dp V

---

### 6.10 `EmeraldButton` (Primary CTA)
- Background: `LinearGradient(#00C853 → #00E676@85%)`
- Border top-left highlight: White@25%
- Text: `label-lg`, Black, #002114
- Press: scale 0.96, spring

---

### 6.11 `GlassButton` (Secondary)
- Background: `LinearGradient(#111A14 → #0D1610)`
- Border: EmeraldDim@28% + White@6%, 0.6dp
- Text: `label-lg`, `text-primary`

---

### 6.12 `EmptyState`
Shown when a section has no data.

- Container: EmeraldPrimary@6% bg, EmeraldDim@20% border, radius 12dp, padding 16dp
- Text: EmeraldPrimary@70% for positive, `text-muted` for neutral
- Example: "All caught up! No pending tasks."

---

### 6.13 `GlassDialog`
Container for all modal dialogs.

- Scrim: `bg-base @ 80%` full screen
- Container: `#162019`, EmeraldDim@20% border (0.8dp), radius 20dp
- Header: `title-lg`, `text-primary` + X close button
- Padding: 24dp
- Actions: `GlassButton` (cancel) + `EmeraldButton` (confirm)

---

### 6.14 `GlassInput`
Text input fields.

- Background: `#0A1410`
- Border default: EmeraldDim@20%, 1dp
- Border focused: EmeraldPrimary@50%, 1dp
- Border error: StatusAbsent@50%, 1dp
- Radius: 12dp
- Label: `label-sm`, `text-muted` (floating above on focus)
- Text: `body-md`, `text-primary`
- Cursor: `#00E676`
- Placeholder: `text-disabled`

---

### 6.15 `ProgressBar`
Attendance progress bar.

- Height: 6dp
- Background track: `#1C2820`
- Fill: `status-present` (good) or `status-absent` (low)
- Border radius: 4dp (fully rounded ends)
- Animation: fills from 0 to value on mount (600ms, ease-in-out)

---

### 6.16 `BottomSheet`
Filter panels, date pickers.

- Snap heights: 40%, 70%, 100%
- Background: `#0D1410`
- Top border: EmeraldDim@20% gradient
- Top corner radius: 24dp
- Drag handle: 36dp × 4dp, rounded, `#1C2820`, centered

---

## 7. Navigation Architecture

### 7.1 Navigation Structure

```
App Root
├── Onboarding Stack (first launch only)
│   ├── Welcome Slide 1 (Attendance)
│   ├── Welcome Slide 2 (Expenses)
│   ├── Welcome Slide 3 (Timetable)
│   └── Profile Setup
│
└── Main App
    ├── Bottom Tab Navigator (GlassNavBar)
    │   ├── Tab 1: Home
    │   ├── Tab 2: Attendance
    │   ├── Tab 3: Timetable
    │   ├── Tab 4: Expenses
    │   └── Tab 5: More
    │
    └── Overlay Stack Screens (full screen, no tab bar visible)
        ├── Tasks Screen
        ├── Books & Documents Screen
        ├── Notes Screen
        ├── Profile & Settings Screen
        ├── ID Card Viewer Screen
        ├── Add-ons & Calculators Screen
        ├── Holidays Screen
        └── Search Screen
```

### 7.2 Navigation Behavior

| Behavior | Rule |
|---|---|
| Tab bar visibility | Visible on main 5 tabs, hidden on stack screens |
| Back navigation | Expo Router `back()` + Android hardware back |
| Tab press (current tab) | Scrolls back to top |
| State persistence | Each tab remembers scroll position |
| Deep links | Not required for v1 |

### 7.3 Screen Transitions

| Transition | Direction | Duration |
|---|---|---|
| Tab switch | Fade + 8dp up translate | 180ms |
| Stack push | Slide from right | 280ms |
| Stack pop | Slide to right | 250ms |
| Modal / dialog open | Scale + fade | 200ms |
| Bottom sheet open | Slide from bottom | 350ms |
| Bottom sheet close | Slide to bottom | 280ms |

---

## 8. Screen Requirements

### 8.1 Home Screen (Dashboard)

**Purpose:** Consolidated at-a-glance view of all academic data.

**Layout:** Scrollable vertical feed with `GlassHeader` at top.

---

**Section 1 — Overview (2×2 Stat Grid)**

Label: "OVERVIEW" (overline, `text-muted`, uppercase)

Four `StatMiniCard` in a 2-column × 2-row symmetrical grid (fixes left-dominance):

| Position | Data | Icon & Tint | Value Format | Sub-label / Badge | Action |
|---|---|---|---|---|---|
| Top-left | Overall Attendance | `CheckCircle` (`#00E676`) | `XX%` (tap/long-press to edit) | "Can miss N" / "Need N" | `ArrowOutward` ↗ to Attend |
| Top-right | Pending Tasks | `Assignment` (`#00E676` or `#FFAB40` if due today) | `N` | "N due today" / "All done" | `ArrowOutward` ↗ to Tasks |
| Bottom-left | Month Expenses | `Wallet` (`#00E676`) | `₹X,XXX` | "This month" / MoM diff | `ArrowOutward` ↗ to Expenses |
| Bottom-right | Books & PDFs | `MenuBook` / `BookOpen` (`#69F0AE` mint) | `N` | "N books & PDFs" | `ArrowOutward` ↗ to Books |

- **Optical Balance**: Icon box at top-left, `ArrowOutward` diagonal arrow (↗) at top-right, value centrally anchored, sub-label/badge centered at bottom.
- **Editable Values**: Long-press on `XX%` opens quick manual correction modal.

---

**Section 2 — Attendance Detail Card**

`EmeraldGlassCard` with:
- `AccentStripe` (left, emerald if ≥75%, rose if <75%)
- Header row: CheckCircle icon + "Attendance" label + "View All ↗" link (`ArrowOutward`)
- Large percentage: `display-md`, `text-primary` (long-press to edit manually)
- **Status Badge Chip Row**:
  - `Can miss N classes` (emerald chip) or `Need N classes` (rose chip)
  - `75% Target • Met` or `75% Target • ⚠ At Risk`
- 6dp `ProgressBar`
- `StatPill` row: Present (editable) | Absent (editable) | Total sessions

---

**Section 3 — Expenses Card**

`EmeraldGlassCard` with:
- `AccentStripe` (left, emerald)
- Header: Payments icon + "Expenses" + "View All ↗" link (`ArrowOutward`)
- Large total: `display-md`, ₹ prefixed
- "This month" badge chip with month-over-month trend indicator (e.g. `↓ 12% vs Aug`)
- "QUICK LOG" section label (overline)
- Horizontally scrollable quick expense preset chips (user-customizable: Chai ₹15, Lunch ₹80, Metro ₹30, etc.)
- Quick preset gear button to manage/edit presets directly from the card

---

**Section 4 — Tasks & Deadlines Card (Non-Destructive Checkbox)**

`EmeraldGlassCard` with:
- `AccentStripe` (left, emerald)
- Header: Assignment icon + "Tasks & Deadlines" + "View All ↗" link (`ArrowOutward`)
- Large pending count: `display-md`
- "N due today" amber badge (if applicable)
- **Task Item List Behavior (Crucial Bug Fix)**:
  - Checking the checkbox **does NOT delete** the task
  - Completed task receives **strike-through text**, row opacity dims to **55%**, and completed task sinks to the bottom of the list
  - Only explicit swipe-to-delete or delete dialog removes a task
- **Task Row Layout**:
  - Left: Emerald checkbox
  - Middle: Title (bold), 1-line description preview, Priority badge (HIGH=rose, MEDIUM=amber, LOW=mint), Due date chip
  - Right: Quick edit & delete icons
- `EmptyState` if no tasks

---

**Section 5 — Books & Library Card**

`EmeraldGlassCard` with:
- `AccentStripe` (left, muted emerald)
- Header: MenuBook icon + "Books & Library" + "View All →"
- Large file count: `display-md`
- "N Books · N Notes" breakdown badge chip

---

**Section 6 — Academic Summary Card**

`EmeraldGlassCard` (tappable → Add-ons screen):
- Row: calculator icon box + "Semester X — CGPA Tracker" + "Open CGPA, GPA & Goal Calculator"

---

**Section 7 — Today's Classes Card**

`EmeraldGlassCard` with:
- Header: CalendarMonth icon + "Today's Classes" + "Schedule →"
- List of `ClassRowItem` for today's timetable
- `EmptyState` if no classes today

---

**Section 8 — Quick Actions**

Section label: "QUICK ACTIONS" (overline)
2-column row:
- `QuickActionChip`: "Add Expense" (Payments icon)
- `QuickActionChip`: "Add Task" (Task icon)

---

### 8.2 Attendance Screen

**Purpose:** Subject-level attendance tracking with day-based scheduling view.

**Layout:**
- Overall summary bar at top (overall % + classes can miss/need)
- **Day-Based Subject Selector**:
  - Shows classes for the **selected day** (auto-defaults to current day from timetable schedule)
  - Horizontal day pills: `Mon` | `Tue` | `Wed` | `Thu` | `Fri` | `Sat` | `All Subjects`
  - Selecting a day filters the list to only subjects scheduled on that day
- **Subject Cards**:
  - Subject name and code
  - **Gradient Ring / Donut Indicator**: 12dp radial gradient circle (`subject.color @ 100%` center to `20%` edge) replacing flat dot
  - Present / Absent count badges (tappable to edit counts manually)
  - Per-subject progress bar (6dp, rounded, colored by status)
  - Attendance % large number (long-press to trigger manual override dialog)
- FAB: "+" (add subject)
- On subject tap: opens calendar view for that subject

**Manual Count Override Dialog:**
- "Edit Attendance Counts" modal
- Input fields: `Present: N`, `Absent: N`, optional note
- Updates database and recalculates percentages immediately

**Calendar View & Auto-Absent Logic:**
- Monthly grid with color-coded dates (emerald=present, rose=absent, amber=holiday)
- **Auto-Absent Rule**: If a non-holiday class passes without being marked (30 minutes after class end time), the system auto-marks it as ABSENT
- **Retroactive Edit**: User can tap any past date/session to manually override or correct auto-absent marks
- **Holiday Days**: Days flagged in the Holiday calendar are automatically exempt from attendance calculations (neither present nor absent)

---

### 8.3 Timetable Screen

**Purpose:** Weekly class schedule management with persisted views.

**Layout & View Modes:**
- **View Mode Persistence**: User can toggle between **List View** and **Grid View** via top-right toggle button; preference is persisted in AsyncStorage (`timetable_view_mode`)
- **List View**:
  - Day tabs (Mon → Sun) with horizontal scroll and animated active indicator
  - Auto-selects current day on open
  - List of class slots using dark glass cards with subject color stripe
- **Grid View (Enhanced Dark Glass UI)**:
  - Time columns across the top (scrollable horizontal if >4 slots)
  - Day rows with compact height
  - Each cell: compact dark glass card with subject short code (e.g. "CSA"), time slot, room, and a 3dp left subject color stripe
  - Empty cells show subtle dark placeholder "—"
- **Holiday Integration**:
  - If a day is marked as a holiday, a prominent amber holiday banner appears (e.g., "🏖 Holiday — Diwali") and class slots are dimmed/flagged as off
- FAB: "+" (add class slot)

---

### 8.4 Expenses Screen

**Purpose:** Multi-month expense tracking, day-part filtering, and editable presets.

**Layout & Key Features:**
- **Month Selector & Multi-Month Archiving**:
  - Header month carousel: `‹ September 2026 ›`
  - Permanent SQLite storage: all past months are archived and can be navigated and inspected anytime
- **Month-Over-Month Comparison View**:
  - Dedicated comparison card:
    - Total spend comparison vs previous month (e.g., `₹4,200 vs ₹4,900 last month (-14%)`)
    - Average daily spend comparison (e.g., `₹140/day vs ₹163/day`)
    - Category-by-category shift breakdown
- **Day-Part / Time-of-Day Filters**:
  - Horizontal filter pills: `All` | `Morning 🌅` | `Afternoon ☀️` | `Evening 🌆` | `Night 🌙`
  - Time slots:
    - Morning (5:00 AM – 11:59 AM)
    - Afternoon (12:00 PM – 4:59 PM)
    - Evening (5:00 PM – 8:59 PM)
    - Night (9:00 PM – 4:59 AM)
  - Secondary Category filter dropdown: Food, Travel, Books/Stationery, Leisure, Rent, Other
- **Swipe-to-Edit Interaction**:
  - Swipe expense item left reveals Edit ✏️ and Delete 🗑️ actions
  - First-time hint: "Swipe left to edit or delete expenses" (persisted flag `expense_swipe_hint_shown`)
  - Long press on expense item also opens context action menu

**Editable Quick Expense Presets (CRUD):**
- Quick preset chips row with "Edit Presets" gear icon and "+" add preset button
- Preset Manager bottom sheet allows:
  1. Editing existing presets (change title, amount, icon)
  2. Deleting unused presets
  3. Creating new custom presets
- Persisted in SQLite `expense_presets` table

---

### 8.5 More Screen

**Purpose:** Navigation hub for secondary features.

**Layout:**
- Section title: "College Modules & Tools" (`headline-sm`)
- Appearance card: theme/accent current status → taps to Profile
- Menu items list (each as `EmeraldGlassCard`):

| # | Title | Subtitle | Icon Tint |
|---|---|---|---|
| 1 | Tasks | College assignments, deadlines | Emerald `#00E676` |
| 2 | Books & Documents | Academic textbooks, syllabus | Mint `#69F0AE` |
| 3 | Notes & Lecture Snaps | Formulae sheets, whiteboard photos | Emerald `#00C853` |
| 4 | Add-ons & Calculators | CGPA, GPA, Attendance Predictor | Amber `#FFC107` |
| 5 | Student Profile & Theme | Name · Course | Teal `#80CBC4` |
| 6 | College ID Card | View & export digital ID | Mint `#B2DFDB` |
| 7 | Holidays & Non-Class Days | College holidays, Sunday rules | Warm Amber `#FFAB40` |

- Footer: dark glass box with emerald CloudSync icon + "CampusOS Engine — Local SQLite active"

---

### 8.6 Tasks Screen (Stack)

**Purpose:** Full task management.

**Layout:**
- Filter tabs: All / Pending / Due Today / Completed (emerald underline active)
- Task list: cards with title, subject tag, due date, priority badge
- Priority colors: High = Rose, Medium = Amber, Low = Emerald
- Checkbox to complete (spring pop animation)
- FAB: "Add Task"

**Add Task dialog fields:**
Title, Description (optional), Due Date, Subject (optional picker), Priority (3-option selector)

---

### 8.7 Books & PDFs Screen (Stack)

**Purpose:** Clean academic document and PDF reader hub.

**Key Changes:**
- **Screen Title**: Renamed to `"Books & PDFs"`
- **Clean Starting State**: Zero fake or sample PDFs on fresh install; starts with a sleek empty state illustration
- **Simplified Add Document Flow**:
  - FAB (+) opens document picker directly
  - Upon selecting PDF, bottom sheet opens with only **2 fields**:
    1. **Title** (auto pre-filled with PDF filename, user-editable)
    2. **Subject** (optional dropdown selector from user's subject list)
  - Instant save to SQLite `documents` table and app storage
- **Native OS PDF Viewer**:
  - Tapping any document card immediately launches the device's native PDF viewer (Android default viewer intent, iOS Quick Look) via Expo FileSystem & Sharing
- **Document Card**:
  - Shows PDF file icon, title, subject badge, file size, and upload date
  - Swipe left to delete with confirmation bottom sheet

---

### 8.8 Notes Screen (Stack)

**Purpose:** Photo notes from whiteboards, printed sheets.

**Layout:**
- 2-column photo grid
- Each photo: thumbnail + subject tag pill + date
- Top right: camera button + gallery button
- Tap → fullscreen viewer with share/delete

---

### 8.9 Profile & Settings Screen (Stack)

**Sections:**

**Profile:**
- Avatar (84dp circle, emerald ring, tap to change)
- Name, Roll Number, Course, Branch, Semester, College
- Edit via inline form or "Edit Profile" dialog

**Theme & Appearance:**
- Glass accent selector: 6 swatches (see color options)
  - Emerald Mint (default)
  - Aurora Indigo
  - Cosmic Violet
  - Ocean Cyan
  - Sunset Amber
  - Slate Minimal
- Selected swatch: emerald check mark

**ID Card:**
- Preview card thumbnail
- Download PNG + Share buttons

---

### 8.10 Add-ons & Calculators Screen (Stack)

**Tabs:** CGPA / SGPA / Target / Predictor / Timer

1. **CGPA Calculator** — Enter up to 10 semesters (SGPA + credits each), see cumulative
2. **SGPA Calculator** — Enter subjects with grade points + credits for this semester
3. **Target CGPA** — "I want X CGPA by end of semester N, what SGPA do I need?"
4. **Attendance Predictor** — "How many more classes can I miss and stay above 75%?"
5. **Study Timer (Pomodoro)** — 25/5/15 cycles, session history, subject tagging

---

### 8.11 Search Screen (Stack)

**Layout:**
- Search input (auto-focused on open)
- Results grouped by category (Tasks / Subjects / Expenses / Documents / Notes)
- Each result: category icon + title/name + source context
- Tap → navigate to that item in its home screen

---

### 8.12 Holidays Screen (Stack)

**Layout & Academic Logic:**
- Monthly calendar with amber highlighted holiday dates
- Add holiday FAB → date picker + holiday name + type (`HOLIDAY` or `HALF_DAY`)
- **Attendance & Timetable Synchronization**:
  - Classes scheduled on holiday dates are automatically flagged with a holiday banner in Timetable
  - Attendance engine completely excludes holiday classes from absent/present calculations
  - Supports automatic absent rules for unexcused school days with full retroactive user correction

---

### 8.13 ID Card Viewer Screen (Stack)

**Layout & Viewing Modes:**
- Default view: student ID card displayed in glass container with profile photo, name, roll, course, semester, college, and barcode
- **Fullscreen Preview Mode**:
  - "View Fullscreen" button expands ID card to full screen with pitch-black backdrop
  - Supports smooth pinch-to-zoom and pan
- **Landscape Layout Mode**:
  - Dedicated rotate toggle in fullscreen mode switches to an optimized horizontal ID layout (photo on left, credentials on right)
  - Download PNG and system share options available in both orientations

---

## 9. User Flows

### 9.1 First Launch Flow
```
App Launch
  → Splash screen (CampusOS logo, dark emerald)
  → Onboarding slides (3 screens — attendance, expenses, timetable)
  → "Get Started" → Profile Setup
      Name, Course, College, Semester
  → "Set Up Timetable" (optional, can skip)
  → Home screen (empty states guide first actions)
```

### 9.2 Daily Usage Flow
```
Morning:
  Home → Today's Classes → Mark attendance for each class

Afternoon:
  Home → Quick Log → tap "Canteen ₹50" chip

Evening:
  Home → Tasks card → check off completed tasks
        → Add Task for tomorrow's deadline
```

### 9.3 Mark Attendance (Quick — from Home)
```
Home screen visible
  → Today's Classes section → tap class row
  → Row shows "Present" / "Absent" buttons
  → Tap "Present"
  → Row immediately updates with "Present" status badge
  → Home attendance stat mini-card updates %
```

### 9.4 Mark Attendance (Full flow — Attendance screen)
```
Attendance tab → select subject → calendar opens
  → Tap date cell → bottom sheet appears
  → Tap Present / Absent / Holiday
  → Cell updates color → sheet closes
  → Subject % recalculates → overall % updates
```

### 9.5 Add Quick Expense (from Home)
```
Home → Quick Log section → tap preset chip (e.g., "Canteen ₹50")
  → Expense logged instantly
  → Home expense total updates
  → Toast: "₹50 logged — Canteen"
```

### 9.6 Add Custom Expense
```
Quick Actions → "Add Expense"
  → Dialog: amount (number pad, auto-focused) + category + date
  → Save → dialog closes → monthly total updates
```

### 9.7 Add Task
```
Quick Actions → "Add Task"
  → Dialog: title + subject + due date + priority
  → Save → task appears in Tasks card
  → If due today: "N due today" amber badge updates
```

### 9.8 Check CGPA
```
More → Add-ons & Calculators → CGPA tab
  → Each row: Semester, SGPA input, Credits input
  → CGPA calculates live as user types
  → Shows target progress (X / 10)
```

---

## 10. Data Requirements

### 10.1 Local Storage Architecture

**Tech Stack:**
- `expo-sqlite` v3 with `SQLiteProvider` (structured relational data)
- `@react-native-async-storage/async-storage` (app settings, flags)

### 10.2 SQLite Schema

#### Table: `subjects`
```
id             INTEGER PRIMARY KEY AUTOINCREMENT
name           TEXT NOT NULL
code           TEXT
color_hex      TEXT DEFAULT '#00E676'
credits        INTEGER DEFAULT 4
target_pct     REAL DEFAULT 75.0
created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
```

#### Table: `attendance_sessions`
```
id             INTEGER PRIMARY KEY AUTOINCREMENT
subject_id     INTEGER REFERENCES subjects(id) ON DELETE CASCADE
date           TEXT NOT NULL                        -- ISO 8601: YYYY-MM-DD
time_slot      TEXT                                -- e.g., "09:00 - 10:00"
status         TEXT CHECK(status IN ('PRESENT','ABSENT','HOLIDAY','DUTY_LEAVE'))
notes          TEXT
created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
UNIQUE(subject_id, date, time_slot)
```

#### Table: `timetable_entries`
```
id             INTEGER PRIMARY KEY AUTOINCREMENT
subject_id     INTEGER REFERENCES subjects(id) ON DELETE CASCADE
day_of_week    INTEGER NOT NULL                    -- 0=Mon, 6=Sun
start_time     TEXT NOT NULL                       -- "09:00"
end_time       TEXT NOT NULL                       -- "10:00"
room           TEXT DEFAULT ''
teacher        TEXT DEFAULT ''
```

#### Table: `tasks`
```
id             INTEGER PRIMARY KEY AUTOINCREMENT
title          TEXT NOT NULL
description    TEXT DEFAULT ''
due_date       TEXT                                -- YYYY-MM-DD, nullable
priority       TEXT DEFAULT 'MEDIUM' CHECK(priority IN ('HIGH','MEDIUM','LOW'))
subject_id     INTEGER REFERENCES subjects(id) ON DELETE SET NULL
completed      INTEGER DEFAULT 0                  -- 0=false, 1=true
completed_at   DATETIME
created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
```

#### Table: `expenses`
```
id             INTEGER PRIMARY KEY AUTOINCREMENT
amount         REAL NOT NULL
category       TEXT NOT NULL
description    TEXT DEFAULT ''
time_of_day    TEXT DEFAULT 'MORNING' CHECK(time_of_day IN ('MORNING','AFTERNOON','EVENING','NIGHT'))
month_key      TEXT NOT NULL                       -- e.g., '2026-09'
date           TEXT NOT NULL DEFAULT (date('now'))
created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
```

#### Table: `expense_presets`
```
id             INTEGER PRIMARY KEY AUTOINCREMENT
name           TEXT NOT NULL
amount         REAL NOT NULL
category       TEXT NOT NULL
icon           TEXT DEFAULT 'food-fork-drink'
is_custom      INTEGER DEFAULT 0                   -- 0=default, 1=user created
sort_order     INTEGER DEFAULT 0
```

#### Table: `documents`
```
id             INTEGER PRIMARY KEY AUTOINCREMENT
filename       TEXT NOT NULL
file_path      TEXT NOT NULL
doc_type       TEXT DEFAULT 'OTHER' CHECK(doc_type IN ('BOOK','NOTES','SYLLABUS','OTHER'))
subject_id     INTEGER REFERENCES subjects(id) ON DELETE SET NULL
size_bytes     INTEGER DEFAULT 0
added_at       DATETIME DEFAULT CURRENT_TIMESTAMP
```

#### Table: `notes` (photo notes)
```
id             INTEGER PRIMARY KEY AUTOINCREMENT
photo_uri      TEXT NOT NULL
subject_id     INTEGER REFERENCES subjects(id) ON DELETE SET NULL
label          TEXT DEFAULT ''
created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
```

#### Table: `holidays`
```
id             INTEGER PRIMARY KEY AUTOINCREMENT
date           TEXT NOT NULL UNIQUE
name           TEXT NOT NULL
type           TEXT DEFAULT 'HOLIDAY' CHECK(type IN ('HOLIDAY','DUTY_LEAVE'))
```

#### Table: `student_profile` (single row, id=1)
```
id             INTEGER PRIMARY KEY DEFAULT 1
app_nickname   TEXT DEFAULT 'MyCollege'            -- Custom app display name
name           TEXT DEFAULT ''
roll_number    TEXT DEFAULT ''
course         TEXT DEFAULT ''
branch         TEXT DEFAULT ''
semester       TEXT DEFAULT 'Semester 1'
college        TEXT DEFAULT ''
avatar_uri     TEXT DEFAULT ''
glass_accent   TEXT DEFAULT 'emerald'
```

### 10.3 AsyncStorage Keys

| Key | Type | Default |
|---|---|---|
| `onboarding_completed` | boolean | false |
| `app_theme_accent` | string | `'emerald'` |
| `timetable_setup_done` | boolean | false |
| `subjects_setup_done` | boolean | false |
| `timetable_view_mode` | string | `'list'` ('list' or 'grid') |
| `expense_swipe_hint_shown` | boolean | false |

### 10.4 Computed / Derived Values

All derived at query time — never stored redundantly:

| Value | Computation |
|---|---|
| Subject attendance % | `COUNT(PRESENT) / COUNT(PRESENT + ABSENT) * 100` |
| Overall % | Average across all subjects (weighted by class count) |
| Classes can miss | `FLOOR((present - 0.75 × total) / 0.75)` |
| Classes needed | `CEIL((0.75 × total - present) / 0.25)` |
| Month total | `SUM(amount) WHERE date BETWEEN month-start AND month-end` |
| Tasks remaining | `COUNT WHERE completed = 0` |
| Tasks due today | `COUNT WHERE due_date = today AND completed = 0` |
| Today's classes | `timetable_entries WHERE day_of_week = weekday(today)` JOIN sessions |
| CGPA | `SUM(sgpa × credits) / SUM(credits)` across semesters |

---

## 11. Non-Functional Requirements

### 11.1 Performance Targets

| Metric | Target |
|---|---|
| App cold start → home screen | < 1.5 seconds |
| Local data query time | < 50ms |
| Screen navigation (stack push) | < 280ms |
| Attendance % recalculation | < 100ms |
| SQLite write (INSERT) | < 30ms |
| Image load (notes grid) | Progressive blur-up |
| JavaScript bundle size | < 5MB |

### 11.2 Offline-First Requirements
- 100% of core functionality works without internet
- Zero required network calls for any CRUD operation
- No "loading from server" state — all data is local
- App launches fully functional in airplane mode

### 11.3 Storage Budget

| Asset | Limit |
|---|---|
| App base install | < 50MB |
| SQLite database | < 10MB (typical usage) |
| Individual document | Warn user if > 50MB |
| Notes photos | App-sandboxed, user-controlled |

### 11.4 Battery & Permissions
- No background services
- No location access
- No push notifications (v1)
- Camera permission: only when Notes feature is used (requested in-context)
- Storage permission: only when adding documents (requested in-context)

### 11.5 Security
- No user credentials stored anywhere
- All data in app-specific sandbox (not shared storage by default)
- No analytics or telemetry in v1
- No network calls in core app

### 11.6 Platform Compatibility

| Platform | Minimum Version |
|---|---|
| iOS | 15.0+ |
| Android | 8.0 (API 26)+ |
| Expo SDK | 51+ |
| React Native | 0.74+ |

### 11.7 Localization
- **v1:** English only
- Numbers: Indian locale format (₹1,00,000)
- Dates: DD/MM/YYYY display, ISO 8601 internal storage
- **v2 roadmap:** Hindi + Tamil + Telugu + Marathi + Bengali + Kannada

---

## 12. Accessibility

### 12.1 Contrast Ratios

| Pair | Ratio | Standard |
|---|---|---|
| `text-primary (#F0FFF4)` on `bg-surface (#0D1410)` | ~18:1 | WCAG AAA (7:1) |
| `text-secondary (#B2DFDB)` on `bg-card (#111A14)` | ~7.5:1 | WCAG AAA |
| `text-muted (#6B8F7A)` on `bg-card (#111A14)` | ~3.2:1 | WCAG AA Large |
| `emerald-primary (#00E676)` on `bg-base (#050907)` | ~9.5:1 | WCAG AAA |
| `status-absent (#FF5252)` on `bg-base (#050907)` | ~5.8:1 | WCAG AA |

> All primary text interactions exceed WCAG AAA requirements.

### 12.2 Touch Target Minimums

| Element | Minimum Size |
|---|---|
| Nav bar items | 44 × 48dp |
| All interactive cards | Full width × auto height |
| Checkboxes | 44 × 44dp touch area |
| FAB | 56dp circle |
| Attendance action buttons | 44 × 32dp minimum |
| Dialog close button | 44 × 44dp |

### 12.3 Screen Reader Support
- All icons: `accessibilityLabel` set
- Interactive cards: `accessibilityRole="button"` + descriptive hint
- Progress bars: `accessibilityValue={{ min: 0, max: 100, now: percentage }}`
- Stat cards: speak "Attendance: 74%, needs attention"

### 12.4 Keyboard / External Input
- All interactive elements focusable via hardware keyboard (tablet use)
- Logical focus order: left-to-right, top-to-bottom
- Tab/Enter navigation supported

### 12.5 Reduced Motion
- Detect `AccessibilityInfo.isReduceMotionEnabled()`
- When `true`: no spring scale animations, instant transitions, no parallax effects, progress bars still animate (but no count-up numbers)

---

## 13. Platform & Tech Constraints

### 13.1 Expo Dependency Stack

| Feature | Package |
|---|---|
| Routing | `expo-router` (v3, file-based) |
| SQLite | `expo-sqlite` (v3 with `SQLiteProvider`) |
| Key-value store | `@react-native-async-storage/async-storage` |
| Icons | `@expo/vector-icons` (MaterialIcons, MaterialCommunityIcons) |
| Animations | `react-native-reanimated` (v3) |
| Gestures | `react-native-gesture-handler` |
| Linear Gradient | `expo-linear-gradient` |
| Radial Gradient | `@shopify/react-native-skia` or `react-native-svg` |
| Image Picker | `expo-image-picker` |
| Camera | `expo-camera` |
| File System | `expo-file-system` |
| Fonts | `expo-font` + `@expo-google-fonts/inter` |
| Date Handling | `date-fns` |
| Status Bar | `expo-status-bar` |
| Splash Screen | `expo-splash-screen` |
| Haptics | `expo-haptics` |
| Sharing | `expo-sharing` |
| Charts | `react-native-gifted-charts` or `victory-native` |

### 13.2 Expo Build Requirements

| Environment | Capability |
|---|---|
| Expo Go | Dev only — no Skia, limited camera, no custom native modules |
| Custom Expo Dev Build | Full feature set — required for Skia, SQLite v3, Camera |
| EAS Build | Required for App Store / Play Store production release |

### 13.3 Glassmorphism on React Native

React Native does not support CSS `backdrop-filter: blur()`. Achieve the glassmorphism look through:

**Card Background (Dark Glass Effect):**
- Use `expo-linear-gradient` for the base dark charcoal fill
- Layer a `react-native-svg` `RadialGradient` for the localized emerald glow

**Radial Gradient (Card Glow) — Option A (Recommended):**
Use `@shopify/react-native-skia`:
- `Canvas` → `Rect` with `RadialGradient` shader
- Renders at native speed, identical iOS + Android
- Required for pixel-perfect bottom-right corner glow

**Radial Gradient — Option B (Simpler):**
Use `react-native-svg`:
- `<Svg>` wrapping card → `<Defs>` → `<RadialGradient cx="100%" cy="100%">`
- Apply as background layer via absolute positioning
- Slightly less flexible, no additional native deps beyond SVG

**Gradient Borders:**
React Native `View` borders do not support gradient colors. Options:
- **Option A:** SVG border path (complex but accurate)
- **Option B:** Use a thin outer `View` with `LinearGradient` + inner card View with 1dp inset (simulated gradient border)
- **Option C:** `@shopify/react-native-skia` — draw the border as an `RRect` stroke with gradient paint

**Blur Effect (Header, Nav Bar):**
- iOS: `expo-blur` `BlurView` works natively
- Android: `expo-blur` has limited support — use fallback dark semi-transparent overlay (`rgba(9, 14, 11, 0.94)`) instead

---

## Appendices

### Appendix A — Color Tokens

```
Background
  bg-base:        #050907
  bg-surface:     #0C0D0C
  bg-card:        #0F1010  (pure charcoal, zero green tint)
  bg-elevated:    #141414  (pure charcoal elevated)
  bg-inner:       #0A0B0A
  bg-rim:         #181818

Emerald Accents
  emerald-primary:    #00E676
  emerald-secondary:  #00C853
  emerald-highlight:  #69F0AE
  emerald-dim:        #00796B
  emerald-deep:       #004D40

Typography
  text-primary:   #F0FFF4
  text-secondary: #B2DFDB
  text-muted:     #6B8F7A
  text-disabled:  #3D5247

Status
  status-present:  #00E676  (bg: #052810)
  status-absent:   #FF5252  (bg: #2A0808)
  status-holiday:  #FFC107  (bg: #2A1A00)
  status-pending:  #FFAB40

Borders
  border-subtle:   #1F3028
  border-emerald:  #2D5040

Navigation
  nav-selected-icon:  #FFFFFF  (pure white icon)
  nav-selected-text:  #F0FFF4  (pure white label)
  nav-unselected:     #4A6B58  (muted sage green)
  nav-indicator-pill: rgba(0, 230, 118, 0.18) (sliding indicator)
  nav-surface:        rgba(10, 11, 10, 0.95)
```

---

### Appendix B — Spacing Reference

```
4dp   Micro gap (label–value pair)
8dp   Small gap (between related elements)
12dp  Medium-small (list item internal)
14dp  Card list gap / section spacer
16dp  Base padding (card inner, screen sides)
18dp  Large card padding
20dp  Medium-large spacer
24dp  Dialog padding / large component spacing
32dp  Section separator
100dp Screen bottom padding (nav bar clearance)
```

---

### Appendix C — Component Border Radius

```
Main cards:        18dp
Dialogs:           20dp
Bottom sheets:     24dp (top only)
Inner rows:        12dp
Quick actions:     12dp
Icon boxes:        9–10dp
Chips / badges:    8dp
Status badges:     6–8dp
Search pill:       10dp
Avatar:            50% (circle)
Onboarding cards:  24dp
Nav bar:           0dp
```

---

### Appendix D — Type Scale Summary

```
display-xl:   57sp / Black 900 / -1.5sp spacing
display-lg:   45sp / Bold 700  / -1.0sp spacing
display-md:   36sp / Bold 700  / -0.5sp spacing
headline-sm:  24sp / SemiBold  / -0.1sp spacing
title-lg:     22sp / Bold      / -0.2sp spacing
title-md:     16sp / SemiBold  / -0.1sp spacing
title-sm:     14sp / SemiBold  /  0sp   spacing
body-lg:      16sp / Regular   / +0.15sp spacing
body-md:      14sp / Regular   / +0.10sp spacing
body-sm:      12sp / Regular   / +0.10sp spacing
label-lg:     14sp / SemiBold  / +0.10sp spacing
label-md:     12sp / Medium    / +0.30sp spacing
label-sm:     11sp / Medium    / +0.40sp spacing
overline:     10sp / SemiBold  / +1.50sp spacing (UPPERCASE)
```

---

### Appendix E — Animation Cheat Sheet

```
Card press:       scale 0.985, spring (damping 10, stiffness 100)
Button press:     scale 0.96,  spring (damping 10, stiffness 60)
Screen push:      280ms, slide-right, spring
Screen pop:       250ms, slide-left, spring
Tab switch:       180ms, fade + 8dp up translate
Dialog open:      200ms, scale + fade, ease-out
Bottom sheet:     350ms, slide-up, spring (damping 8, stiffness 80)
Progress fill:    600ms, ease-in-out, on mount
Number count-up:  800ms, ease-out, 0 → final value
Skeleton shimmer: 1200ms linear loop
Checkbox pop:     150ms spring
```

---

*CampusOS PRD v2.0 — Dark Emerald Edition*
*Platform: React Native / Expo*
*Last updated: September 2026*
