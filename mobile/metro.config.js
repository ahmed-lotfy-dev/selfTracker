const { getDefaultConfig } = require("expo/metro-config");
const { withUniwindConfig } = require("uniwind/metro");
const { addLiveStoreDevtoolsMiddleware } = require("@livestore/devtools-expo");

const config = getDefaultConfig(__dirname);

const FinalConfig = withUniwindConfig(config, {
  cssEntryFile: "./src/global.css",
  dtsFile: "./src/uniwind-types.d.ts",
});

FinalConfig.resolver.sourceExts.push("sql", "cjs", "mjs");

FinalConfig.resolver.unstable_enablePackageExports = true;

addLiveStoreDevtoolsMiddleware(FinalConfig, { schemaPath: "./src/livestore/schema.ts" });

module.exports = FinalConfig;
