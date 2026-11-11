# Hobbies Tracker — Project Knowledge

## Overview

Hobbies Tracker is a single-person React application for browsers and Android. It tracks Books, Movies, Series, Anime, and Animation. Browser data is local IndexedDB data. Android data is app-private SQLite through Capacitor. Android automatic cloud and device-transfer backup is disabled; the user controls JSON exports. There are no accounts or automatic cloud sync.

The visual design is a dark cyberpunk interface: navy and near-black surfaces, cyan as the primary accent, subdued dark magenta on selected media cards, angular borders, and restrained glow. The browser uses a sidebar; Android-sized screens use bottom navigation.

Responsive cyberpunk city artwork sits behind the interface, with separate portrait art for Android-sized screens. Feathered masks fade brighter PNG lighting around the motorcycle and city while the character and base images remain steady. Reduced-motion settings hide the animated frames.

Eight locally bundled transparent cyberpunk icons live in `src/Resources/icons`: Books, Movies, Series, Anime, Animation, Dashboard, Statistics, and Settings. The shared `src/Components/MediaIcon.tsx` maps them to desktop and mobile navigation, dashboard category tiles, library headings, and no-cover item cards. A real Open Library book cover takes precedence over category artwork. The mobile Library icon follows its selected category; icons remain available offline.

Oxanium is used for headings and the Hobbies Tracker wordmark; Space Grotesk is used for body text and forms. Shared custom dropdowns replace native status menus. Scrollbars use slim cyan thumbs on transparent tracks without arrow buttons, and numeric inputs hide native spinner controls while retaining typing and validation. The top header has been removed.

There is no global Add header or bottom navigation action. New items are added from the selected library category, which fixes their category in the add form. The dashboard category tiles lead into those library sections. Custom status menus open as vertical overlays without expanding item cards or forms. Open Library results show cover thumbnails when available; saved book covers fit completely within their card art panel.
Item-card status menus use compact text and rows sized to match their trigger; form and library filter menus keep their regular size.

## Core behavior

Each media item has a category, title, total, current progress, and one of Planned, In progress, Completed, or Dropped. Books also have an author and may have a cover URL and Open Library work key. Books track pages, movies track minute position, and all show categories track a total episode count. New items can start in any status; a directly added Completed item records its completion date and reading pages or actual watch minutes. Only In progress items appear as item cards on the dashboard; all four statuses appear in the library.

Progress updates have a local date, previous and new progress values, and actual minutes watched for videos. Movie time defaults to the change in minute position and can be corrected before saving. Show time is entered explicitly. Reaching an item's total automatically marks it Completed. Completed items leave the dashboard. Metadata edits do not add activity to statistics.

Statistics sum positive book page changes and actual logged viewing minutes. They show total pages read for Books, completed count and total time for Movies, and completed count and total time separately for Series, Anime, and Animation. Book pages and movie time have twelve-month charts. Stored watch minutes are formatted as hours and minutes on cards, progress summaries, totals, and chart labels.

## Data flow

`src/App.tsx` loads a `Snapshot` of items and progress events. All UI changes pass through a serialized `commit` operation that writes first, then publishes the saved snapshot to React. `src/Resources/storage.ts` chooses `storage.web.ts` for IndexedDB or `storage.android.ts` for native SQLite. Android writes replace item and event rows in one transaction. The browser writes one snapshot in one IndexedDB transaction. A failed load or write is shown rather than silently replacing the saved data.

`src/Resources/mediaLogic.ts` handles item creation, progress, status, edits, and duration formatting. `stats.ts` derives totals and monthly activity. `backup.ts` validates the full snapshot and creates a portable format with `app: "hobbies-tracker"` and `formatVersion: 1`. Import validates before replacing the device's entire snapshot and asks for confirmation. Browser export downloads JSON; Android writes JSON to its cache and opens the share sheet so the user can save it. The backup contains items and dated progress, not SQLite or IndexedDB internals.

`openLibrary.ts` searches Open Library on explicit submit, paces requests, and tries to get page count from the selected edition. Missing or inaccurate page counts can be entered manually. Book lookup requires internet, but saved entries and progress remain local. Video metadata and artwork are manual placeholders until a future API is chosen; there is no movie, series, or anime API in this version.

## Development

`npm run dev` starts the browser app at `http://localhost:8080`. `npm test` checks core progress, statistics, and backup validation. `npm run build` type-checks and builds the web bundle. `npm run android:sync` copies that bundle into the Capacitor Android project. Build the debug APK with Gradle inside `android/`.

The Android Gradle wrapper uses Gradle 9.1.0 so Android Studio can run it with its bundled JDK 25. The Android Gradle Plugin remains 8.13.0; verify the native build in Android Studio after this wrapper upgrade.
