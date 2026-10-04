const fs = require('fs');
const path = require('path');

const patches = [
  // 1. Neutralize warnOfExpoGoPushUsage so it NEVER throws in Expo Go on Android
  {
    paths: [
      path.join(__dirname, '..', 'node_modules', 'expo-notifications', 'build', 'warnOfExpoGoPushUsage.js'),
      path.join(__dirname, '..', 'node_modules', 'expo-notifications', 'src', 'warnOfExpoGoPushUsage.ts'),
    ],
    content: `export const warnOfExpoGoPushUsage = () => {};\n`,
  },
  // 2. Neutralize DevicePushTokenAutoRegistration so it never triggers remote push listeners on module import
  {
    paths: [
      path.join(__dirname, '..', 'node_modules', 'expo-notifications', 'build', 'DevicePushTokenAutoRegistration.fx.js'),
      path.join(__dirname, '..', 'node_modules', 'expo-notifications', 'src', 'DevicePushTokenAutoRegistration.fx.ts'),
    ],
    content: `export async function setAutoServerRegistrationEnabledAsync(enabled) {}\nexport async function __handlePersistedRegistrationInfoAsync(registrationInfo) {}\n`,
  },
  // 3. Neutralize TopicSubscriptionModule.android.js — requireNativeModule('ExpoTopicSubscriptionModule')
  //    throws "Cannot find native module" in Expo Go since the native side is not bundled.
  //    Replace with a safe stub that mirrors the web/non-android fallback.
  {
    paths: [
      path.join(__dirname, '..', 'node_modules', 'expo-notifications', 'build', 'TopicSubscriptionModule.android.js'),
    ],
    content: `const module = {\n  addListener: () => {},\n  removeListeners: () => {},\n  subscribeToTopicAsync: () => Promise.resolve(null),\n  unsubscribeFromTopicAsync: () => Promise.resolve(null),\n};\nexport default module;\n`,
  },
];

let patchedCount = 0;

patches.forEach(({ paths, content }) => {
  paths.forEach((filePath) => {
    if (fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content, 'utf8');
      patchedCount++;
      console.log(`[Colio Patch] Successfully neutralized ${path.basename(filePath)} to prevent Expo Go crash.`);
    }
  });
});

console.log(`[Colio Patch] Done. Patched ${patchedCount} files.`);
