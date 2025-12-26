const { withAppBuildGradle } = require('@expo/config-plugins');

const withDisableLinting = (config) => {
  return withAppBuildGradle(config, async (config) => {
    const buildGradle = config.modResults.contents;

    // Prevent duplicate injection
    if (buildGradle.includes('checkReleaseBuilds false')) {
      return config;
    }

    config.modResults.contents = buildGradle + `
// Added by withDisableLinting plugin
android {
    lintOptions {
        checkReleaseBuilds false
        abortOnError false
    }
}
`;
    return config;
  });
};

module.exports = withDisableLinting;
