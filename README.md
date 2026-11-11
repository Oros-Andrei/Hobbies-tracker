# Hobbies Tracker

A private media tracker for books, movies, series, anime, and animation. Built with React, TypeScript, Vite, and Capacitor.

## Run in a browser

```powershell
npm install
npm run dev
```

Open `http://localhost:8080`. Browser data is saved in IndexedDB.

## Build for Android

Android Studio and an Android SDK are required.
Set Android Studio's Gradle JDK to JDK 21. Its bundled JDK 25 is too new for this generated Gradle project.

```powershell
npm install
npm run android:sync
npm run android:open
```

The Android app stores its data in app-private SQLite. To build a debug APK from the `android` directory, run `./gradlew.bat assembleDebug` in PowerShell. The APK will be under `android/app/build/outputs/apk/debug/`.

## Data and backups

The app works without an account. Book search uses Open Library only when requested; books can also be entered manually. Movies and shows are entered manually. Export creates a versioned JSON backup; import validates and replaces local data after confirmation. There is no automatic device sync.
