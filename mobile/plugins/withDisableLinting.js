const { withAppBuildGradle } = require('@expo/config-plugins');

const withDisableLinting = (config) => {
  return withAppBuildGradle(config, async (config) => {
    const buildGradle = config.modResults.contents;
    if (buildGradle.includes('lintOptions {')) {
      return config;
    }

    // Insert lintOptions inside android block
    const pattern = /android\s*{/;
    if (pattern.test(buildGradle)) {
      config.modResults.contents = buildGradle.replace(
        pattern,
        `android {
    lintOptions {
        checkReleaseBuilds false
        abortOnError false
    }
`
      );
    }
    return config;
  });
};

module.exports = withDisableLinting;
