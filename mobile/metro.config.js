const path = require("node:path");
const fs = require("node:fs");
const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
module.exports = mergeConfig(getDefaultConfig(__dirname), {
  watchFolders: [
    path.resolve(__dirname, "../src/lib"),
    fs.realpathSync(path.resolve(__dirname, "node_modules")),
  ],
  resolver: {
    nodeModulesPaths: [path.resolve(__dirname, "node_modules")],
    disableHierarchicalLookup: true,
  },
});
