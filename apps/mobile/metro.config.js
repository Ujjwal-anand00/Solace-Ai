const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Explicit resolution fallbacks for monorepo hoisted packages
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  'expo-notifications': path.resolve(monorepoRoot, 'node_modules/expo-notifications'),
  'expo-device': path.resolve(monorepoRoot, 'node_modules/expo-device'),
};

module.exports = withNativeWind(config, { input: './global.css' });
