const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Keep file-system CSS for development, but use virtual CSS in production
  // to avoid Metro racing on react-native-css-interop/.cache/web.css in CI.
  forceWriteFileSystem: process.env.NODE_ENV !== "production",
});
