module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'], //  This says the root of your project folder
        // alias: {},
      },
    ],
    [
      'module:react-native-reanimated/plugin',
      {
        moduleName: '@env',
      },
    ],
  ],
};
