# Calio --- Changes & Production Requirements

## 1. App Icon

-   The application icon should use the **Calio icon**, not the Expo
    icon.

## 2. Profile Picture / Icon Size

-   When changing the profile picture/icon size, the selected size
    should not reset.
-   Fix the image sizing behavior so the selected size is preserved.
-   Add a **Delete Profile Picture (PFP)** option.

## 3. Home Page --- Monthly Expenses

-   On the Home page, the **Monthly Expenses** section has a badge/label
    (₹1 / Mom) that is overflowing the floating card.
-   Fix the layout so the badge stays properly inside the card and does
    not overflow.

## 4. Timetable --- Incorrect Day/Time

-   The timetable is sometimes showing the wrong day/time.
-   Fix the issue where an incorrect timetable entry can be created
    accidentally.
-   Make sure the selected day and time are correctly saved and
    displayed.

## 5. Timetable --- View Modes

-   The current **Grid mode** is incorrectly displaying the timetable
    like a list.
-   Fix the view-mode mapping:
    -   **List mode** → list-style timetable.
    -   **Grid mode** → proper grid-style timetable.
-   Create a proper new **Grid timetable view** if required.
-   Add automatic day selection/display:
    -   If today is Monday, automatically show the Monday timetable.
    -   If today is Tuesday, automatically show the Tuesday timetable.
    -   Continue similarly for the other days.
-   The behavior should feel similar to a calendar where the current day
    is automatically selected.

## 6. Expense History

-   In the Expense section, the current expense history uses item cards.
-   Add a **table view** for expense history as well.
-   Do not load the complete expense history at once.
-   Load older expense records progressively when the user scrolls
    (infinite scroll / lazy loading).

## 7. Books & PDFs

-   The Books & PDFs functionality is currently not working properly.
-   Users should be able to **upload PDF files**.
-   Add/fix the PDF upload functionality.
-   Uploaded PDFs should be available for viewing/reading inside the
    application.

## 8. App Header

-   Remove the unnecessary/default app header.
-   Display **"Calio"** as the application name where the app
    header/title is required.

## 9. Timetable Editing

-   Add/fix the ability for users to **edit their timetable** from the
    Timetable page.
-   Users should be able to modify existing timetable entries instead of
    having to recreate them.

## 10. New User --- First-Time Setup

-   Add a proper **Welcome Page** for new users with **Login** and
    **Sign Up** options.
-   Existing/returning users should be able to enter the main
    application without going through the first-time setup again.
-   For a new user, show an initial setup flow and collect the required
    student details, such as:
    -   Name
    -   College name
    -   Roll number
    -   Other required student information
-   After the basic details, ask the new user to **set up their
    timetable**.
-   Provide options to:
    -   Enter the timetable manually.
    -   Add/import the timetable from an image or screenshot.
-   After setup, use the saved information throughout the application
    wherever required.
-   Handle default/prefilled values correctly during setup.
-   Add a **Reset All Data** option so the user can clear the stored
    application data and start the setup again.

## 11. Theme Support Across the App

-   The **Expenses, Timetable, and some other pages** do not currently
    support the application's theme change.
-   These pages are still using the default **green color** even when
    the user changes the application theme/accent.
-   Make theme support consistent across the entire application.
-   Remove hardcoded green colors where they are being used for UI
    elements.
-   All pages, cards, buttons, icons, backgrounds, borders, text
    accents, and other themed components should use the application's
    centralized theme/accent system.
-   Changing the theme should update all supported pages consistently,
    including:
    -   Home
    -   Expenses
    -   Timetable
    -   Books & PDFs
    -   Profile
    -   Other application pages/components
