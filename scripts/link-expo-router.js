const fs = require('fs');
const path = require('path');

const target = path.resolve(__dirname, '../apps/mobile/node_modules/expo-router');
const link = path.resolve(__dirname, '../node_modules/expo-router');

if (fs.existsSync(target) && !fs.existsSync(link)) {
  try {
    fs.symlinkSync(target, link, 'junction');
    console.log('[postinstall] Created junction for expo-router at root node_modules');
  } catch (err) {
    console.warn('[postinstall] Could not link expo-router:', err.message);
  }
}

