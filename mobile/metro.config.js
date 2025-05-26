// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")

/** @type {import('expo/metro-config').MetroConfig} */

const path = require("path")

// Define the folder containing your native modules or shared code
const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, "../..") // adjust if needed

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot)

// Add support for `.cjs` and other extensions if needed
config.resolver.sourceExts.push("cjs", "json")

// Speed up build times by excluding unnecessary files from watcher
config.watchFolders = [workspaceRoot]

// Disable haste resolver (modern setups don't need it)
config.resolver.unstable_noStoreSeeks = true

// Apply NativeWind plugin last
module.exports = withNativeWind(config, {
  input: "./global.css",
})