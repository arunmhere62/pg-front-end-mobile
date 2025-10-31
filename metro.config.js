const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix symbolication errors by disabling source map generation for internal files
config.symbolicator = {
  ...config.symbolicator,
  customizeFrame: (frame) => {
    // Skip frames from InternalBytecode.js
    if (frame.file && frame.file.includes('InternalBytecode.js')) {
      return null;
    }
    return frame;
  },
};

module.exports = config;
