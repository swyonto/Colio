const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, '..', 'node_modules', 'expo-notifications', 'build', 'warnOfExpoGoPushUsage.js'),
  path.join(__dirname, '..', 'node_modules', 'expo-notifications', 'src', 'warnOfExpoGoPushUsage.ts'),
];

let patchedCount = 0;

targetFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    const safeContent = `export const warnOfExpoGoPushUsage = () => {};\n`;
    fs.writeFileSync(file, safeContent, 'utf8');
    patchedCount++;
    console.log(`[Colio Patch] Successfully neutralized ${path.basename(file)} to prevent Expo Go crash.`);
  }
});

console.log(`[Colio Patch] Done. Patched ${patchedCount} files.`);
