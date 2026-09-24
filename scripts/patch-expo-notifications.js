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
