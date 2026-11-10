const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../apps/server/dist');
const destDir = path.resolve(__dirname, '../dist');

if (fs.existsSync(srcDir)) {
  fs.cpSync(srcDir, destDir, { recursive: true, force: true });
  console.log('[build] Mirrored apps/server/dist to root dist/');
} else {
  console.warn('[build] apps/server/dist does not exist to mirror.');
}

