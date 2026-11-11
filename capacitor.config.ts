import type { CapacitorConfig } from '@capacitor/cli';

// Bundle the browser build into the Android app under a stable private identity.
const config: CapacitorConfig = {
  appId: 'com.andrei.hobbiestracker',
  appName: 'Hobbies Tracker',
  webDir: 'dist',
};

export default config;
