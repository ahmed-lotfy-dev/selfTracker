const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");

const config = getDefaultConfig(__dirname);

const FinalConfig = withUniwindConfig(config, {
  cssEntryFile: "./src/global.css",
  dtsFile: "./src/uniwind-types.d.ts",
});

FinalConfig.resolver.sourceExts.push("sql", "cjs", "mjs");

FinalConfig.resolver.unstable_enablePackageExports = true;

// No Devtools needed for now

module.exports = FinalConfig;
