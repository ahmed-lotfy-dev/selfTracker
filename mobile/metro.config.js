const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

// Exclude .cxx build artifacts to prevent watcher crashes
config.resolver.blockList = [
  ...(config.resolver.blockList || []),
  /.*\/node_modules\/.*\.cxx\/.*/,
  /.*\/android\/.cxx\/.*/
];

const FinalConfig = withUniwindConfig(config, {
  cssEntryFile: "./src/global.css",
  dtsFile: "./src/uniwind-types.d.ts",
});

FinalConfig.resolver.sourceExts.push("sql", "cjs", "mjs");

FinalConfig.resolver.unstable_enablePackageExports = true;

// No Devtools needed for now

module.exports = FinalConfig;
