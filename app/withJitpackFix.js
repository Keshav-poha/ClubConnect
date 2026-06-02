const { withProjectBuildGradle } = require('@expo/config-plugins');

const withJitpackFix = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      // Replace the standard JitPack entry with the filtered one
      config.modResults.contents = config.modResults.contents.replace(
        /maven\s*\{\s*url\s*(['"])https:\/\/www\.jitpack\.io\1\s*\}/g,
        `maven {
      url 'https://www.jitpack.io'
      content {
        excludeGroup "io.github.react-native-community"
      }
    }`,
      );
    }
    return config;
  });
};

module.exports = withJitpackFix;
