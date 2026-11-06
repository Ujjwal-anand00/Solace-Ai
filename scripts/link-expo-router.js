const fs = require('fs');
const path = require('path');

function ensureJunction(target, link, label) {
  if (fs.existsSync(target) && !fs.existsSync(link)) {
    try {
      fs.symlinkSync(target, link, 'junction');
      console.log(`[postinstall] Created junction for ${label}`);
    } catch (err) {
      console.warn(`[postinstall] Could not link ${label}:`, err.message);
    }
  }
}

// 1. Root expo-router junction from apps/mobile
const routerTarget = path.resolve(__dirname, '../apps/mobile/node_modules/expo-router');
const routerLink = path.resolve(__dirname, '../node_modules/expo-router');
ensureJunction(routerTarget, routerLink, 'expo-router at root node_modules');

// 2. Mobile expo-notifications & expo-device junctions from root
const notifTarget = path.resolve(__dirname, '../node_modules/expo-notifications');
const notifLink = path.resolve(__dirname, '../apps/mobile/node_modules/expo-notifications');
ensureJunction(notifTarget, notifLink, 'expo-notifications at apps/mobile/node_modules');

const deviceTarget = path.resolve(__dirname, '../node_modules/expo-device');
const deviceLink = path.resolve(__dirname, '../apps/mobile/node_modules/expo-device');
ensureJunction(deviceTarget, deviceLink, 'expo-device at apps/mobile/node_modules');


